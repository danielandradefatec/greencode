import { randomUUID } from 'node:crypto';
export const novoId = (prefixo: string): string => `${prefixo}-${randomUUID().slice(0, 8).toUpperCase()}`;
