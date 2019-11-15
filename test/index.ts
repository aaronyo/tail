/* global suite, test */

import 'mocha';
import * as fs from 'fs';
import { tail } from '../src';
import { assert } from 'chai';

const appendFile = __dirname + '/../../test/tmp/append-file.txt';

suite('tail', () => {
  test('basic test', async () => {
    const output = await tail(
      async lines => {
        const collected: string[] = [];
        for await (const line of lines) {
          collected.push(line);
          if (line === '4') break;
        }
        return collected;
      },
      { args: ['-n4'] },
    )(__dirname + '/../../test/test-file.txt');
    assert.deepEqual(output, ['1', '2', '3', '4']);
  });

  test('non existent file', async () => {
    let errObj: { code?: number } = {};
    try {
      await tail(
        async lines => {
          for await (const line of lines) {
            assert.fail(line);
          }
        },
        { args: ['-n4'] },
      )('bad_filename');
    } catch (err) {
      errObj = JSON.parse(err.message);
    }
    assert.equal(errObj.code, 1);
  });

  test('nothing missed -- buffered until iteration begins', async () => {
    const input = ['a', 'b', 'c'];
    const output: string[] = [];
    fs.closeSync(fs.openSync(appendFile, 'w'));
    await tail(async lines => {
      // add to the file before we start iterating
      fs.appendFileSync(appendFile, input.join('\n') + '\n');

      // delay a bit
      await new Promise(r => setTimeout(r, 10));

      // start iterating -- nothing should be missed
      for await (const line of lines) {
        output.push(line);
        if (line === 'c') break;
      }
    })(appendFile);
    assert.deepEqual(output, input);
  });

  test('Exceptions propogate', async () => {
    fs.closeSync(fs.openSync(appendFile, 'w'));
    try {
      await tail(() => {
        throw new Error('failed');
      })(appendFile);
    } catch (err) {
      assert.equal(err.message, 'failed');
      return;
    }

    assert.fail('Expected exception');
  });
});
