"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const node_crypto_1 = require("node:crypto");
const crypto_1 = require("./crypto");
const SESSION_MINUTES = 30;
class AuthService {
    credenciais;
    sessoes;
    constructor(credenciais, sessoes) {
        this.credenciais = credenciais;
        this.sessoes = sessoes;
    }
    criarCredencial(usuario, senha, papel, responsavel) {
        if (this.credenciais.get(usuario))
            throw new Error('Usuário já cadastrado.');
        const salt = (0, crypto_1.gerarSalt)();
        const cred = { usuario, hashSenha: (0, crypto_1.hashSenha)(senha, salt), salt, ultimoAcesso: new Date().toISOString(), papel };
        this.credenciais.save(cred, responsavel, 'CRIAR_CREDENCIAL');
        return cred;
    }
    autenticar(usuario, senha) {
        const cred = this.credenciais.get(usuario);
        if (!cred || !(0, crypto_1.senhaValida)(senha, cred.salt, cred.hashSenha))
            throw new Error('Usuário ou senha inválidos.');
        const agora = new Date();
        const sessao = {
            token: (0, node_crypto_1.randomBytes)(32).toString('hex'), usuario, papel: cred.papel,
            criacao: agora.toISOString(), expiracao: new Date(agora.getTime() + SESSION_MINUTES * 60000).toISOString()
        };
        this.sessoes.save(sessao, usuario, 'CRIAR_SESSAO');
        cred.ultimoAcesso = agora.toISOString();
        this.credenciais.save(cred, usuario, 'ATUALIZAR_ACESSO');
        return sessao;
    }
    validarToken(token) {
        const sessao = this.sessoes.get(token);
        return !!sessao && new Date(sessao.expiracao).getTime() > Date.now();
    }
    renovarToken(token) {
        const sessao = this.sessoes.get(token);
        if (!sessao || !this.validarToken(token))
            throw new Error('Sessão inválida ou expirada.');
        sessao.expiracao = new Date(Date.now() + SESSION_MINUTES * 60000).toISOString();
        this.sessoes.save(sessao, sessao.usuario, 'RENOVAR_SESSAO');
        return sessao;
    }
    logout(token) {
        this.sessoes.remove(token, 'sistema');
    }
}
exports.AuthService = AuthService;
