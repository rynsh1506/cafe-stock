declare module "node:path" {
  export interface PlatformPath {
    resolve(...paths: string[]): string;
    dirname(p: string): string;
    join(...paths: string[]): string;
  }
  const path: PlatformPath;
  export default path;
}

declare module "node:process" {
  export interface Process {
    cwd(): string;
    uptime(): number;
    env: Record<string, string | undefined>;
  }
  const process: Process;
  export default process;
}

declare module "node:fs" {
  export interface Stats {
    isFile(): boolean;
    isDirectory(): boolean;
  }
  export function existsSync(path: string): boolean;
  export function mkdirSync(
    path: string,
    options?: { recursive?: boolean },
  ): void;
  export function unlinkSync(path: string): void;
  export function statSync(path: string): Stats;
}

declare module "node:os" {
  export interface NetworkAddress {
    address: string;
    family: string;
    internal: boolean;
  }
  export function networkInterfaces(): Record<
    string,
    NetworkAddress[] | undefined
  >;
}

declare module "bun:sqlite" {
  export class Database {
    constructor(filename: string);
    exec(sql: string): void;
    query(sql: string): {
      run(...params: unknown[]): void;
      all(...params: unknown[]): Record<string, unknown>[];
    };
  }
}

declare module "bun:test" {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
  };
}

interface ImportMeta {
  readonly main?: boolean;
  readonly dirname: string;
  readonly url: string;
}

interface BunFile extends Blob {
  exists(): Promise<boolean>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

declare const Bun: {
  serve(options: {
    port?: number;
    hostname?: string;
    fetch(req: Request): Response | Promise<Response>;
  }): {
    port: number;
    stop(): void;
  };
  file(path: string): BunFile;
};

declare function require(moduleName: string): unknown;
