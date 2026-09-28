"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const App_1 = require("../src/App");
const enums_1 = require("../src/models/enums");
const Id_1 = require("../src/utils/Id");
function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    }
    catch (e) {
        console.error(`✗ ${name}`);
        throw e;
    }
}
const dir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), 'greencode-'));
try {
    const s = (0, App_1.createServices)(dir);
    test('provisionamento e autenticação', () => {
        s.ctx.auth.criarCredencial('admin', '123456', enums_1.PapelUsuario.ADMINISTRADOR, 'teste');
        const sessao = s.ctx.auth.autenticar('admin', '123456');
        strict_1.default.equal(s.ctx.auth.validarToken(sessao.token), true);
    });
    test('CNPJ válido e unicidade', () => {
        s.organizacao.cadastrarOrganizacao({ id: 'ORG1', razaoSocial: 'Empresa Teste', cnpj: '11222333000181', inscricaoEstadual: '', enderecoCompleto: '', telefone: '', email: 'teste@teste.com', dataCadastro: new Date().toISOString(), ativo: true }, 'admin');
        strict_1.default.throws(() => s.organizacao.cadastrarOrganizacao({ id: 'ORG2', razaoSocial: 'Empresa Teste 2', cnpj: '11222333000181', inscricaoEstadual: '', enderecoCompleto: '', telefone: '', email: 'x@x.com', dataCadastro: new Date().toISOString(), ativo: true }, 'admin'));
    });
    test('lote não aceita data futura', () => {
        strict_1.default.throws(() => s.lote.criarLote({ id: 'L1', dataEntrada: new Date(Date.now() + 86400000).toISOString(), organizacaoId: 'ORG1', notaFiscal: 'NF1', transportadora: 'T1', equipamentos: [], statusProcessamento: 'RECEBIDO', observacoes: '' }, 'admin'));
    });
    test('jornada completa de equipamento e rastreabilidade', () => {
        const loteId = (0, Id_1.novoId)('LOTE');
        s.lote.criarLote({ id: loteId, dataEntrada: new Date().toISOString(), organizacaoId: 'ORG1', notaFiscal: '123456', transportadora: 'TransRapida', equipamentos: [], statusProcessamento: 'RECEBIDO', observacoes: '' }, 'admin');
        const equipamentoId = (0, Id_1.novoId)('EQP');
        s.lote.adicionarEquipamentoAoLote(loteId, { id: equipamentoId, codigoBarrasInterno: 'GC-NOTE-000001', tipo: enums_1.TipoEquipamento.NOTEBOOK, marca: 'Marca', modelo: 'Modelo', anoFabricacao: 2022, estadoFisico: enums_1.EstadoFisico.USADO_LEVE, pesoQuilogramas: 2.1, loteId, posicaoNoLote: 0, statusRastreamento: enums_1.StatusRastreamento.AGUARDANDO_TRIAGEM, historicoMovimentacoes: [] }, 'admin');
        s.lote.processarTriagem(loteId, 'admin');
        s.equipamento.registrarMovimentacao(equipamentoId, 'almoxarifado', 'desmonte', 'admin');
        s.equipamento.registrarMovimentacao(equipamentoId, 'desmonte', 'material reciclavel', 'admin');
        const e = s.equipamento.rastrearEquipamento(equipamentoId);
        strict_1.default.equal(e.statusRastreamento, enums_1.StatusRastreamento.MATERIAL_RECICLAVEL);
        strict_1.default.equal(e.historicoMovimentacoes.length, 2);
    });
    test('queda de duas categorias exige justificativa', () => {
        const loteId = (0, Id_1.novoId)('LOTE');
        s.lote.criarLote({ id: loteId, dataEntrada: new Date().toISOString(), organizacaoId: 'ORG1', notaFiscal: 'NF2', transportadora: 'T2', equipamentos: [], statusProcessamento: 'RECEBIDO', observacoes: '' }, 'admin');
        const id = (0, Id_1.novoId)('EQP');
        s.lote.adicionarEquipamentoAoLote(loteId, { id, codigoBarrasInterno: 'GC-000002', tipo: enums_1.TipoEquipamento.MONITOR, marca: 'A', modelo: 'B', anoFabricacao: 2021, estadoFisico: enums_1.EstadoFisico.NOVO, pesoQuilogramas: 3, loteId, posicaoNoLote: 0, statusRastreamento: enums_1.StatusRastreamento.AGUARDANDO_TRIAGEM, historicoMovimentacoes: [] }, 'admin');
        strict_1.default.throws(() => s.equipamento.atualizarEstadoFisico(id, enums_1.EstadoFisico.USADO_MODERADO, '', 'admin'));
        s.equipamento.atualizarEstadoFisico(id, enums_1.EstadoFisico.USADO_MODERADO, 'Dano identificado na inspeção.', 'admin');
    });
    test('journal registra operações antes da persistência', () => {
        const journal = s.ctx.journal.listar();
        strict_1.default.ok(journal.length > 0);
        strict_1.default.ok(journal.some(x => x.operacao === 'CRIAR_LOTE'));
    });
    console.log('\nTodos os testes passaram.');
}
finally {
    (0, node_fs_1.rmSync)(dir, { recursive: true, force: true });
}
