"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const readline = __importStar(require("node:readline"));
const enums_1 = require("../models/enums");
const permissions_1 = require("../utils/permissions");
const Id_1 = require("../utils/Id");
class CLI {
    services;
    rl;
    token = '';
    usuario = '';
    papel;
    constructor(services) {
        this.services = services;
    }
    async iniciar() {
        console.log('\n=== GREENCODE ===');
        console.log('Sistema de logística reversa de equipamentos.');
        if (this.services.ctx.repos.credenciais.all().length === 0)
            await this.provisionamento();
        await this.login();
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout, historySize: 100, terminal: true, completer: (line) => { const comandos = ['ajuda', 'usuario', 'org', 'lote', 'equipamento', 'relatorio', 'journal', 'sair']; const hits = comandos.filter(c => c.startsWith(line)); return [hits.length ? hits : comandos, line]; } });
        this.rl.on('SIGINT', () => this.sair());
        console.log(`\nLogin efetuado: ${this.usuario} (${this.papel})`);
        console.log(`Ações disponíveis: ${(0, permissions_1.acoesDoPapel)(this.papel).join(', ')}`);
        await this.loop();
    }
    question(q) { return new Promise(resolve => this.rl.question(q, resolve)); }
    async provisionamento() {
        console.log('\nProvisionamento inicial. Crie o administrador.');
        const usuario = await this.askWithoutRl('Usuário administrador [admin]: ');
        const senha = await this.askWithoutRl('Senha: ');
        const nome = usuario || 'admin';
        this.services.ctx.auth.criarCredencial(nome, senha, enums_1.PapelUsuario.ADMINISTRADOR, 'provisionamento-inicial');
        console.log('Administrador criado com sucesso.');
    }
    async askWithoutRl(q) {
        const temp = readline.createInterface({ input: process.stdin, output: process.stdout });
        const value = await new Promise(resolve => temp.question(q, resolve));
        temp.close();
        return value;
    }
    async login() {
        while (!this.token) {
            const usuario = await this.askWithoutRl('Usuário: ');
            const senha = await this.askWithoutRl('Senha: ');
            try {
                const sessao = this.services.ctx.auth.autenticar(usuario, senha);
                this.token = sessao.token;
                this.usuario = sessao.usuario;
                this.papel = sessao.papel;
            }
            catch (e) {
                console.log(`ERRO: ${e.message}`);
            }
        }
    }
    async loop() {
        while (this.services.ctx.auth.validarToken(this.token)) {
            const linha = (await this.question('\ngreencode> ')).trim();
            if (!linha)
                continue;
            try {
                await this.executar(linha);
            }
            catch (e) {
                console.log(`ERRO: ${e.message}`);
            }
        }
        console.log('Sessão expirada.');
        this.rl.close();
    }
    async executar(linha) {
        const [cmd, ...args] = linha.split(/\s+/);
        switch (cmd.toLowerCase()) {
            case 'ajuda': return this.ajuda();
            case 'sair': return this.sair();
            case 'usuario': return this.usuarioCmd(args);
            case 'org': return this.orgCmd(args);
            case 'lote': return this.loteCmd(args);
            case 'equipamento': return this.equipamentoCmd(args);
            case 'relatorio': return this.relatorioCmd(args);
            case 'journal': return console.log(JSON.stringify(this.services.ctx.journal.listar().slice(-20), null, 2));
            default: console.log('Comando desconhecido. Digite ajuda.');
        }
    }
    ajuda() {
        console.log(`\nComandos:\n  usuario criar <login> <senha> <papel>\n  org criar <id> <razaoSocial> <cnpj> <email>\n  org listar\n  lote criar --org <id> --nf <nota> --transp <transportadora>\n  lote equipamento <loteId> <tipo> <marca> <modelo> <ano> <peso>\n  lote triagem <loteId>\n  equipamento rastrear <id>\n  equipamento mover <id> <origem> <destino> [observacao]\n  equipamento estado <id> <estado> [justificativa]\n  relatorio status <status>\n  relatorio org <orgId> <inicio> <fim>\n  journal\n  sair`);
    }
    usuarioCmd(args) {
        (0, permissions_1.exigirPermissao)(this.papel, 'USUARIO_CRIAR');
        if (args[0] !== 'criar' || args.length < 4)
            throw new Error('Uso: usuario criar <login> <senha> <papel>');
        const papel = args[3];
        if (!Object.values(enums_1.PapelUsuario).includes(papel))
            throw new Error('Papel inválido.');
        this.services.ctx.auth.criarCredencial(args[1], args[2], papel, this.usuario);
        console.log('Usuário criado.');
    }
    orgCmd(args) {
        if (args[0] === 'listar') {
            (0, permissions_1.exigirPermissao)(this.papel, 'RELATORIO');
            console.table(this.services.organizacao.listarOrganizacoesAtivas());
            return;
        }
        (0, permissions_1.exigirPermissao)(this.papel, 'ORGANIZACAO_CRIAR');
        if (args[0] !== 'criar' || args.length < 5)
            throw new Error('Uso: org criar <id> <razaoSocial> <cnpj> <email>');
        const org = { id: args[1], razaoSocial: args[2], cnpj: args[3], inscricaoEstadual: '', enderecoCompleto: '', telefone: '', email: args[4], dataCadastro: new Date().toISOString(), ativo: true };
        this.services.organizacao.cadastrarOrganizacao(org, this.usuario);
        console.log('Organização cadastrada.');
    }
    loteCmd(args) {
        if (args[0] === 'criar') {
            (0, permissions_1.exigirPermissao)(this.papel, 'LOTE_CRIAR');
            const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
            const org = get('--org'), nf = get('--nf'), transp = get('--transp');
            if (!org || !nf || !transp)
                throw new Error('Uso: lote criar --org <id> --nf <nota> --transp <transportadora>');
            const lote = { id: (0, Id_1.novoId)('LOTE'), dataEntrada: new Date().toISOString(), organizacaoId: org, notaFiscal: nf, transportadora: transp, equipamentos: [], statusProcessamento: enums_1.StatusLote.RECEBIDO, observacoes: '' };
            this.services.lote.criarLote(lote, this.usuario);
            console.log(`Lote criado: ${lote.id}`);
            return;
        }
        if (args[0] === 'equipamento') {
            (0, permissions_1.exigirPermissao)(this.papel, 'LOTE_CRIAR');
            if (args.length < 7)
                throw new Error('Uso: lote equipamento <loteId> <tipo> <marca> <modelo> <ano> <peso>');
            const lote = this.services.lotes.get(args[1]);
            if (!lote)
                throw new Error('Lote não encontrado.');
            const tipo = args[2];
            if (!Object.values(enums_1.TipoEquipamento).includes(tipo))
                throw new Error('Tipo inválido.');
            const equipamento = { id: (0, Id_1.novoId)('EQP'), codigoBarrasInterno: this.services.equipamento.gerarCodigoBarras(tipo, this.services.equipamentos.all().length + 1), tipo, marca: args[3], modelo: args[4], anoFabricacao: Number(args[5]), estadoFisico: enums_1.EstadoFisico.USADO_LEVE, pesoQuilogramas: Number(args[6]), loteId: lote.id, posicaoNoLote: 0, statusRastreamento: enums_1.StatusRastreamento.AGUARDANDO_TRIAGEM, historicoMovimentacoes: [] };
            this.services.lote.adicionarEquipamentoAoLote(lote.id, equipamento, this.usuario);
            console.log(`Equipamento criado: ${equipamento.id}`);
            return;
        }
        if (args[0] === 'triagem') {
            (0, permissions_1.exigirPermissao)(this.papel, 'LOTE_TRIAGEM');
            this.services.lote.processarTriagem(args[1], this.usuario);
            console.log('Triagem concluída.');
            return;
        }
        throw new Error('Uso: lote criar|equipamento|triagem ...');
    }
    equipamentoCmd(args) {
        if (args[0] === 'rastrear') {
            (0, permissions_1.exigirPermissao)(this.papel, 'RELATORIO');
            const e = this.services.equipamento.rastrearEquipamento(args[1]);
            if (!e)
                throw new Error('Equipamento não encontrado.');
            console.log(JSON.stringify(e, null, 2));
            return;
        }
        if (args[0] === 'mover') {
            (0, permissions_1.exigirPermissao)(this.papel, 'EQUIPAMENTO_MOVIMENTAR');
            if (args.length < 4)
                throw new Error('Uso: equipamento mover <id> <origem> <destino> [observacao]');
            this.services.equipamento.registrarMovimentacao(args[1], args[2], args[3], this.usuario, args.slice(4).join(' '));
            console.log('Movimentação registrada.');
            return;
        }
        if (args[0] === 'estado') {
            (0, permissions_1.exigirPermissao)(this.papel, 'EQUIPAMENTO_ESTADO');
            const estado = args[2];
            if (!Object.values(enums_1.EstadoFisico).includes(estado))
                throw new Error('Estado inválido.');
            this.services.equipamento.atualizarEstadoFisico(args[1], estado, args.slice(3).join(' '), this.usuario);
            console.log('Estado atualizado.');
            return;
        }
        throw new Error('Uso: equipamento rastrear|mover|estado ...');
    }
    relatorioCmd(args) {
        (0, permissions_1.exigirPermissao)(this.papel, 'RELATORIO');
        if (args[0] === 'status') {
            console.log(this.services.relatorio.gerarRelatorioPorStatus(args[1]));
            return;
        }
        if (args[0] === 'org') {
            console.log(this.services.relatorio.gerarRelatorioPorOrganizacao(args[1], { inicio: new Date(args[2]), fim: new Date(args[3]) }));
            return;
        }
        throw new Error('Uso: relatorio status|org ...');
    }
    sair() {
        if (this.token)
            this.services.ctx.auth.logout(this.token);
        if (this.rl)
            this.rl.close();
        console.log('Até logo.');
        process.exit(0);
    }
}
exports.CLI = CLI;
