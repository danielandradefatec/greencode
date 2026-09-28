import { criptografar, descriptografar } from './crypto';

export class CriptografiaArquivo {
  constructor(private readonly chave: string) {}
  criptografar(dados: string): string { return criptografar(dados, this.chave); }
  descriptografar(dados: string): string { return descriptografar(dados, this.chave); }
  gerarChave(): string { return this.chave; }
}
