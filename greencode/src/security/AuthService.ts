import { randomBytes } from 'node:crypto';
import { CredencialData, SessaoData } from '../models/entities';
import { PapelUsuario } from '../models/enums';
import { gerarSalt, hashSenha, senhaValida } from './crypto';
import { Repository } from '../persistence/Repository';

const SESSION_MINUTES = 30;

export class AuthService {
  constructor(
    private readonly credenciais: Repository<CredencialData>,
    private readonly sessoes: Repository<SessaoData>
  ) {}

  criarCredencial(usuario: string, senha: string, papel: PapelUsuario, responsavel: string): CredencialData {
    if (this.credenciais.get(usuario)) throw new Error('Usuário já cadastrado.');
    const salt = gerarSalt();
    const cred: CredencialData = { usuario, hashSenha: hashSenha(senha, salt), salt, ultimoAcesso: new Date().toISOString(), papel };
    this.credenciais.save(cred, responsavel, 'CRIAR_CREDENCIAL');
    return cred;
  }

  autenticar(usuario: string, senha: string): SessaoData {
    const cred = this.credenciais.get(usuario);
    if (!cred || !senhaValida(senha, cred.salt, cred.hashSenha)) throw new Error('Usuário ou senha inválidos.');
    const agora = new Date();
    const sessao: SessaoData = {
      token: randomBytes(32).toString('hex'), usuario, papel: cred.papel,
      criacao: agora.toISOString(), expiracao: new Date(agora.getTime() + SESSION_MINUTES * 60000).toISOString()
    };
    this.sessoes.save(sessao, usuario, 'CRIAR_SESSAO');
    cred.ultimoAcesso = agora.toISOString();
    this.credenciais.save(cred, usuario, 'ATUALIZAR_ACESSO');
    return sessao;
  }

  validarToken(token: string): boolean {
    const sessao = this.sessoes.get(token);
    return !!sessao && new Date(sessao.expiracao).getTime() > Date.now();
  }

  renovarToken(token: string): SessaoData {
    const sessao = this.sessoes.get(token);
    if (!sessao || !this.validarToken(token)) throw new Error('Sessão inválida ou expirada.');
    sessao.expiracao = new Date(Date.now() + SESSION_MINUTES * 60000).toISOString();
    this.sessoes.save(sessao, sessao.usuario, 'RENOVAR_SESSAO');
    return sessao;
  }

  logout(token: string): void {
    this.sessoes.remove(token, 'sistema');
  }
}
