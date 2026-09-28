import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_SIZE = 12;

export function gerarChaveMestra(): string {
  return randomBytes(32).toString('base64');
}

function keyBuffer(chave: string): any {
  const key = Buffer.from(chave, 'base64');
  if (key.length !== 32) throw new Error('Chave mestra inválida.');
  return key;
}

export function criptografar(texto: string, chave: string): string {
  const key = keyBuffer(chave);
  const iv = randomBytes(IV_SIZE);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function descriptografar(payload: string, chave: string): string {
  const key = keyBuffer(chave);
  const raw = Buffer.from(payload, 'base64');
  if (raw.length < IV_SIZE + 16) throw new Error('Payload criptografado inválido.');
  const iv = raw.subarray(0, IV_SIZE);
  const tag = raw.subarray(IV_SIZE, IV_SIZE + 16);
  const encrypted = raw.subarray(IV_SIZE + 16);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export function gerarSalt(): string {
  return randomBytes(16).toString('hex');
}

export function hashSenha(senha: string, salt: string): string {
  return scryptSync(senha, salt, 32).toString('hex');
}

export function senhaValida(senha: string, salt: string, hashEsperado: string): boolean {
  const hash = hashSenha(senha, salt);
  return timingSafeEqualHex(hash, hashEsperado);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return createHash('sha256').update(a).digest('hex') === createHash('sha256').update(b).digest('hex');
}
