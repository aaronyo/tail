import { spawn } from 'child_process';
import * as readline from 'readline';

// All this mess is the best way I could find to get the realine to start
// buffering the output of the spawned tail process immediately. Don't want
// to lose any

const bufferedGenerator = (
  rl: AsyncIterable<string>,
): AsyncGenerator<string> => {
  async function* rlGen(): AsyncGenerator<string> {
    for await (const l of rl) {
      yield l;
    }
  }
  const rlIter = rlGen();
  const first = rlIter.next();
  async function* bufferedGen(): AsyncGenerator<string> {
    const firstItem = await first;
    if (firstItem.done) return;
    yield firstItem.value;
    yield* rlIter;
  }

  return bufferedGen();
};

interface Options {
  args?: string[];
}

export const tail = <T extends unknown>(
  fn: (lines: AsyncGenerator<string>) => Promise<T>,
  { args }: Options = {},
) => async (file: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const tailProc = spawn('tail', [...(args || []), '-f', file]);

    const rl = readline.createInterface({
      input: tailProc.stdout,
    });
    rl.on('close', () => tailProc.kill());

    let errMsg = '';
    let result: T;
    tailProc.stderr.on('data', data => {
      errMsg = '' + data;
    });

    tailProc.on('close', code => {
      if (code === 0 || code === null) {
        resolve(result);
      }
      reject(new Error(JSON.stringify({ code, msg: errMsg })));
    });

    const work = async (): Promise<void> => {
      try {
        result = await fn(bufferedGenerator(rl));
      } finally {
        rl.close();
      }
    };
    work();
  });
};
