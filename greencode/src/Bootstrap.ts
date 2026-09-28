import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gerarChaveMestra } from './security/crypto';
import { AtomicFile } from './persistence/AtomicFile';
import { Journal } from './persistence/Journal';
import { Repository } from './persistence/Repository';
import { CredencialData, SessaoData } from './models/entities';
import { PapelUsuario } from './models/enums';
import { AuthService } from './security/AuthService';

export interface AppContext {
  dataDir: string;
  storage: AtomicFile;
  journal: Journal;
  auth: AuthService;
  repos: {
    credenciais: Repository<CredencialData>;
    sessoes: Repository<SessaoData>;
  };
}

export function createContext(dataDir: string): AppContext {
  mkdirSync(dataDir, { recursive: true });
  const masterPath = join(dataDir, 'master.config');
  let chave: string;
  if (!existsSync(masterPath)) {
    chave = gerarChaveMestra();
    writeFileSync(masterPath, chave, 'utf8');
  } else {
    chave = readFileSync(masterPath, 'utf8').trim();
  }
  const storage = new AtomicFile(chave);
  const journal = new Journal(join(dataDir, 'journal.log'), chave);
  const credenciais = new Repository<CredencialData>(join(dataDir, 'credenciais.enc'), storage, journal, 'Credencial', c => c.usuario);
  const sessoes = new Repository<SessaoData>(join(dataDir, 'sessoes.enc'), storage, journal, 'Sessao', s => s.token);
  return { dataDir, storage, journal, auth: new AuthService(credenciais, sessoes), repos: { credenciais, sessoes } };
}

export function provisionarSeNecessario(ctx: AppContext, senhaAdmin: string): boolean {
  if (ctx.repos.credenciais.all().length > 0) return false;
  ctx.auth.criarCredencial('admin', senhaAdmin, PapelUsuario.ADMINISTRADOR, 'provisionamento-inicial');
  return true;
}
