interface Options {
    args?: string[];
}
export declare const tail: <T extends unknown>(fn: (lines: AsyncGenerator<string, any, unknown>) => Promise<T>, { args }?: Options) => (file: string) => Promise<T>;
export {};
