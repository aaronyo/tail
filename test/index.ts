/* global suite, test */

import 'mocha';
import * as fs from 'fs';
import { makeTailer, withTail, tail } from '../src';
import { assert } from 'chai';

const testFile = __dirname + '/../../test/test-file.txt';
const appendFile = __dirname + '/../../test/tmp/append-file.txt';

suite('tail', () => {
  test('Basic test', async () => {
    const collected: string[] = [];
    const { lines } = tail({ args: ['-n4'] })(
      __dirname + '/../../test/test-file.txt',
    );
    for await (const line of lines) {
      collected.push(line);
      if (line === '4') break;
    }
    assert.deepEqual(collected, ['1', '2', '3', '4']);
  });

  test('Close interrupts tail', async () => {
    const collected: string[] = [];
    const { lines, close } = tail({ args: ['-n4'] })(testFile);

    setTimeout(close, 50);

    for await (const line of lines) {
      collected.push(line);
      if (line === '5') break;
    }
    assert.deepEqual(collected, ['1', '2', '3', '4']);
  });
});

suite('withTail', () => {
  test('Basic test', async () => {
    const output = await withTail(
      async lines => {
        const collected: string[] = [];
        for await (const line of lines) {
          collected.push(line);
          if (line === '4') break;
        }
        return collected;
      },
      { args: ['-n4'] },
    )(testFile);
    assert.deepEqual(output, ['1', '2', '3', '4']);
  });

  test('Non existent file', async () => {
    let errObj: { code?: number } = {};
    try {
      await withTail(
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

  test('Nothing missed -- buffered until iteration begins', async () => {
    const input = ['a', 'b', 'c'];
    const output: string[] = [];
    fs.closeSync(fs.openSync(appendFile, 'w'));
    await withTail(async lines => {
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
      await withTail(() => {
        throw new Error('failed');
      })(appendFile);
    } catch (err) {
      assert.equal(err.message, 'failed');
      return;
    }

    assert.fail('Expected exception');
  });
});

suite('tailer', () => {
  test('Calling close interrupts the tail', async () => {
    const tailer = makeTailer();
    const tailing = tailer.withTail(
      async lines => {
        const collected: string[] = [];
        for await (const line of lines) {
          collected.push(line);

          // Never happens
          if (line === '5') break;
        }
        return collected;
      },
      { args: ['-n4'] },
    )(testFile);

    // delay a bit
    await new Promise(r => setTimeout(r, 10));

    assert.equal(tailer.activeTails(), 1);

    tailer.close();

    const output = await tailing;
    assert.deepEqual(output, ['1', '2', '3', '4']);
  });

  test("Don't need to call close", async () => {
    const tailer = makeTailer();
    const output = await tailer.withTail(
      async lines => {
        const collected: string[] = [];
        for await (const line of lines) {
          collected.push(line);
          if (line === '4') break;
        }
        return collected;
      },
      { args: ['-n4'] },
    )(testFile);

    assert.equal(tailer.activeTails(), 0);
    assert.deepEqual(output, ['1', '2', '3', '4']);
  });

  test("Closed tailer can't be used", async () => {
    let errMsg = '';

    const tailer = makeTailer();
    tailer.close();

    try {
      await tailer.withTail(async () => {})('');
    } catch (e) {
      errMsg = e.message;
    }

    assert.match(errMsg, /closed/i);
  });
});
