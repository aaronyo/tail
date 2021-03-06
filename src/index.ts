import { spawn } from 'child_process';
import * as readline from 'readline';

interface Options {
  args?: string[];
}

type TailFn = (
  opts?: Options,
) => (file: string) => { lines: AsyncGenerator<string>; close: () => void };

export const tail: TailFn = (opts = {}) => file => {
  const tailProc = spawn('tail', [...(opts.args || []), '-f', file]);

  const rl = readline.createInterface({
    input: tailProc.stdout,
  });
  rl.on('close', () => tailProc.kill());

  let errMsg = '';
  tailProc.stderr.on('data', data => {
    errMsg = '' + data;
  });

  const onClosed = new Promise((resolve, reject) => {
    tailProc.on('close', async code => {
      if (code === 0 || code === null) {
        resolve();
        return;
      }
      reject(new Error(JSON.stringify({ code, msg: errMsg })));
    });
  });

  // All this mess is the best way I could find to get the readline to start
  // buffering the output of the spawned tail process immediately. Don't want
  // to lose any

  async function* rlGen(): AsyncGenerator<string> {
    for await (const l of rl) {
      yield l;
    }
  }
  const rlIter = rlGen();

  // start pulling on readline; which will start buffering the tail stdout
  const first = rlIter.next();

  async function* bufferedGen(): AsyncGenerator<string> {
    const firstItem = await first;
    if (!firstItem.done) {
      try {
        yield firstItem.value;
        yield* rlIter;
      } finally {
        rl.close();
      }
    }
    return await onClosed;
  }

  return {
    lines: bufferedGen(),
    close: () => rl.close(),
  };
};

type WithTailFn = <T extends unknown>(
  fn: (lines: AsyncGenerator<string>, close: () => void) => Promise<T>,
  opts?: Options,
) => (file: string) => Promise<T>;

export const withTail: WithTailFn = (fn, opts) => async file => {
  const { lines, close } = tail(opts)(file);

  const work = async () => {
    try {
      return await fn(lines, close);
    } finally {
      close();
    }
  };
  return work();
};

export interface Tailer {
  close: () => void;
  tail: TailFn;
  withTail: WithTailFn;
}

export const makeTailer = () => {
  let closeCallbacks: (() => void)[] = [];
  let closed = false;

  const close = () => {
    closed = true;
    closeCallbacks.forEach(cb => cb());
  };

  const boundTail: TailFn = opts => file => {
    if (closed) throw new Error('Tailer has been closed');
    const { lines, close: tailClose } = tail(opts)(file);
    closeCallbacks.push(tailClose);
    return {
      lines,
      close: () => {
        closeCallbacks = closeCallbacks.filter(cb => cb != tailClose);
      },
    };
  };

  const boundWithTail: WithTailFn = (fn, opts) => async file => {
    if (closed) throw new Error('Tailer has been closed');
    const { lines, close } = boundTail(opts)(file);

    const work = async () => {
      try {
        return await fn(lines, close);
      } finally {
        close();
      }
    };
    return work();
  };

  return {
    tail: boundTail,
    withTail: boundWithTail,
    close,
    activeTails: () => closeCallbacks.length,
  };
};
