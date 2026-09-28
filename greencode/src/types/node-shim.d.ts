declare const process: any;
declare const Buffer: any;
declare module 'node:fs' {
  export const existsSync: any; export const mkdirSync: any; export const readFileSync: any; export const writeFileSync: any;
  export const renameSync: any; export const unlinkSync: any; export const appendFileSync: any; export const statSync: any;
  export const mkdtempSync: any; export const rmSync: any;
}
declare module 'node:path' { export const join: any; export const dirname: any; }
declare module 'node:crypto' {
  export const createCipheriv: any; export const createDecipheriv: any; export const createHash: any;
  export const randomBytes: any; export const randomUUID: any; export const scryptSync: any;
}
declare module 'node:readline' { export const createInterface: any; }
declare module 'node:assert/strict' { const x: any; export = x; }
declare module 'node:os' { export const tmpdir: any; }
