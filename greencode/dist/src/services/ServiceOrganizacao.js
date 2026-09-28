"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrganizacao = void 0;
class ServiceOrganizacao {
    repo;
    validadorCNPJ;
    constructor(repo, validadorCNPJ) {
        this.repo = repo;
        this.validadorCNPJ = validadorCNPJ;
    }
    cadastrarOrganizacao(dados, usuario) {
        if (!this.validadorCNPJ.validar(dados.cnpj))
            throw new Error(this.validadorCNPJ.obterMensagemErro());
        if (this.repo.all().some(o => o.cnpj.replace(/\D/g, '') === dados.cnpj.replace(/\D/g, '')))
            throw new Error('CNPJ já cadastrado.');
        this.repo.save(dados, usuario, 'CADASTRAR_ORGANIZACAO');
    }
    buscarOrganizacao(id) { return this.repo.get(id); }
    listarOrganizacoesAtivas() { return this.repo.all().filter(o => o.ativo); }
    alterarEndereco(organizacaoId, novoEndereco, usuario) {
        const org = this.repo.get(organizacaoId);
        if (!org)
            throw new Error('Organização não encontrada.');
        org.enderecoCompleto = novoEndereco;
        this.repo.save(org, usuario, 'ALTERAR_ENDERECO');
    }
    desativar(organizacaoId, usuario) {
        const org = this.repo.get(organizacaoId);
        if (!org)
            throw new Error('Organização não encontrada.');
        org.ativo = false;
        this.repo.save(org, usuario, 'DESATIVAR_ORGANIZACAO');
    }
    renovarContrato(organizacaoId, novoVencimento, usuario) {
        const org = this.repo.get(organizacaoId);
        if (!org)
            throw new Error('Organização não encontrada.');
        if (!org.contratoVigente)
            throw new Error('Organização não possui contrato vigente.');
        org.contratoVigente.dataVencimento = novoVencimento;
        this.repo.save(org, usuario, 'RENOVAR_CONTRATO');
    }
}
exports.ServiceOrganizacao = ServiceOrganizacao;
