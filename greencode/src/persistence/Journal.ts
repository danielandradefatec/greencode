import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { JournalTransacao } from '../models/entities';
import { criptografar, descriptografar } from '../security/crypto';

export class Journal {
  constructor(private readonly filePath: string, private readonly chave: string) {
    mkdirSync(dirname(filePath), { recursive: true });
  }

  registrar(t: JournalTransacao): void {
    const linha = criptografar(JSON.stringify(t), this.chave);
    appendFileSync(this.filePath, linha + '\n', 'utf8');
    this.rotacionarSeNecessario();
  }

  listar(): JournalTransacao[] {
    if (!existsSync(this.filePath)) return [];
    return readFileSync(this.filePath, 'utf8').split('\n').filter(Boolean).map((l: string) => JSON.parse(descriptografar(l, this.chave)) as JournalTransacao);
  }

  rotacionarSeNecessario(): void {
    if (!existsSync(this.filePath) || statSync(this.filePath).size <= 10 * 1024 * 1024) return;
    const rotated = join(dirname(this.filePath), `journal-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
    renameSync(this.filePath, rotated);
  }
}
