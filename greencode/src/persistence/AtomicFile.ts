import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { criptografar, descriptografar } from '../security/crypto';

export class AtomicFile {
  constructor(private readonly chave: string) {}

  ensureDir(filePath: string): void {
    mkdirSync(dirname(filePath), { recursive: true });
  }

  exists(filePath: string): boolean {
    return existsSync(filePath);
  }

  read<T>(filePath: string, fallback: T): T {
    if (!existsSync(filePath)) return fallback;
    const payload = readFileSync(filePath, 'utf8');
    return JSON.parse(descriptografar(payload, this.chave)) as T;
  }

  write<T>(filePath: string, value: T): void {
    this.ensureDir(filePath);
    const temp = join(dirname(filePath), `.${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`);
    const payload = criptografar(JSON.stringify(value, null, 2), this.chave);
    writeFileSync(temp, payload, 'utf8');
    renameSync(temp, filePath);
    try { unlinkSync(temp); } catch {}
  }
}
