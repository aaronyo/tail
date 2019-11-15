import { spawn } from 'child_process';
import * as readline from 'readline';
import { EventEmitter } from 'events';

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

type WorkFn<T> = (
  lines: AsyncGenerator<string>,
  close: () => void,
) => Promise<T>;

type TailFn = <T extends unknown>(
  fn: (lines: AsyncGenerator<string>, close: () => void) => Promise<T>,
  opts?: Options,
) => (file: string) => Promise<T>;

export const tail: TailFn = (fn, { args }: Options = {}) => file => {
  return new Promise((resolve, reject) => {
    const tailProc = spawn('tail', [...(args || []), '-f', file]);

    const rl = readline.createInterface({
      input: tailProc.stdout,
    });
    rl.on('close', () => tailProc.kill());

    let errMsg = '';
    tailProc.stderr.on('data', data => {
      errMsg = '' + data;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let caughtErr: unknown;
    tailProc.on('close', async code => {
      if (caughtErr) {
        reject(caughtErr);
        return;
      }

      if (code === 0 || code === null) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        resolve(result);
        return;
      }
      reject(new Error(JSON.stringify({ code, msg: errMsg })));
    });

    const work = async () => {
      try {
        result = await fn(bufferedGenerator(rl), () => rl.close());
      } catch (e) {
        caughtErr = e;
      } finally {
        rl.close();
      }
    };
    work();
  });
};

export interface Tailer {
  close: () => void;
  tail: TailFn;
}

export const makeTailer = () => {
  let closeCallbacks: (() => void)[] = [];
  let closed = false;

  const close = () => {
    closed = true;
    closeCallbacks.forEach(cb => cb());
  };

  const boundTail: TailFn = (fn, opts) => async file => {
    let myClose: () => void;
    try {
      const result = await tail((lines, doClose) => {
        if (closed) {
          throw Error('Tailer has been closed');
        }
        myClose = () => doClose();
        closeCallbacks.push(myClose);
        return fn(lines, doClose);
      }, opts)(file);
      return result;
    } finally {
      closeCallbacks = closeCallbacks.filter(item => item != myClose);
    }
  };

  return { tail: boundTail, close, activeTails: () => closeCallbacks.length };
};
