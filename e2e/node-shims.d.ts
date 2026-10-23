declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare module 'node:fs/promises' {
  export function readFile(path: string, encoding: 'utf8'): Promise<string>;
  export function appendFile(path: string, data: string, encoding: 'utf8'): Promise<void>;
}

declare module 'node:child_process' {
  export function execFile(
    file: string,
    args: string[],
    options: Record<string, unknown>,
    callback: (error: Error | null, stdout: string, stderr: string) => void,
  ): void;
}

declare module 'node:util' {
  export function promisify(fn: (...args: any[]) => void): (...args: any[]) => Promise<{ stdout: string; stderr: string }>;
}
