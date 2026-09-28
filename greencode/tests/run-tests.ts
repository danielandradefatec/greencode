import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServices } from '../src/App';
import { PapelUsuario, EstadoFisico, TipoEquipamento, StatusRastreamento } from '../src/models/enums';
import { novoId } from '../src/utils/Id';

function test(name: string, fn: () => void): void {
  try { fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}`); throw e; }
}

const dir = mkdtempSync(join(tmpdir(), 'greencode-'));
try {
  const s = createServices(dir);

  test('provisionamento e autenticação', () => {
    s.ctx.auth.criarCredencial('admin', '123456', PapelUsuario.ADMINISTRADOR, 'teste');
    const sessao = s.ctx.auth.autenticar('admin', '123456');
    assert.equal(s.ctx.auth.validarToken(sessao.token), true);
  });

  test('CNPJ válido e unicidade', () => {
    s.organizacao.cadastrarOrganizacao({ id: 'ORG1', razaoSocial: 'Empresa Teste', cnpj: '11222333000181', inscricaoEstadual: '', enderecoCompleto: '', telefone: '', email: 'teste@teste.com', dataCadastro: new Date().toISOString(), ativo: true }, 'admin');
    assert.throws(() => s.organizacao.cadastrarOrganizacao({ id: 'ORG2', razaoSocial: 'Empresa Teste 2', cnpj: '11222333000181', inscricaoEstadual: '', enderecoCompleto: '', telefone: '', email: 'x@x.com', dataCadastro: new Date().toISOString(), ativo: true }, 'admin'));
  });

  test('lote não aceita data futura', () => {
    assert.throws(() => s.lote.criarLote({ id: 'L1', dataEntrada: new Date(Date.now() + 86400000).toISOString(), organizacaoId: 'ORG1', notaFiscal: 'NF1', transportadora: 'T1', equipamentos: [], statusProcessamento: 'RECEBIDO' as any, observacoes: '' }, 'admin'));
  });

  test('jornada completa de equipamento e rastreabilidade', () => {
    const loteId = novoId('LOTE');
    s.lote.criarLote({ id: loteId, dataEntrada: new Date().toISOString(), organizacaoId: 'ORG1', notaFiscal: '123456', transportadora: 'TransRapida', equipamentos: [], statusProcessamento: 'RECEBIDO' as any, observacoes: '' }, 'admin');
    const equipamentoId = novoId('EQP');
    s.lote.adicionarEquipamentoAoLote(loteId, { id: equipamentoId, codigoBarrasInterno: 'GC-NOTE-000001', tipo: TipoEquipamento.NOTEBOOK, marca: 'Marca', modelo: 'Modelo', anoFabricacao: 2022, estadoFisico: EstadoFisico.USADO_LEVE, pesoQuilogramas: 2.1, loteId, posicaoNoLote: 0, statusRastreamento: StatusRastreamento.AGUARDANDO_TRIAGEM, historicoMovimentacoes: [] }, 'admin');
    s.lote.processarTriagem(loteId, 'admin');
    s.equipamento.registrarMovimentacao(equipamentoId, 'almoxarifado', 'desmonte', 'admin');
    s.equipamento.registrarMovimentacao(equipamentoId, 'desmonte', 'material reciclavel', 'admin');
    const e = s.equipamento.rastrearEquipamento(equipamentoId)!;
    assert.equal(e.statusRastreamento, StatusRastreamento.MATERIAL_RECICLAVEL);
    assert.equal(e.historicoMovimentacoes.length, 2);
  });

  test('queda de duas categorias exige justificativa', () => {
    const loteId = novoId('LOTE');
    s.lote.criarLote({ id: loteId, dataEntrada: new Date().toISOString(), organizacaoId: 'ORG1', notaFiscal: 'NF2', transportadora: 'T2', equipamentos: [], statusProcessamento: 'RECEBIDO' as any, observacoes: '' }, 'admin');
    const id = novoId('EQP');
    s.lote.adicionarEquipamentoAoLote(loteId, { id, codigoBarrasInterno: 'GC-000002', tipo: TipoEquipamento.MONITOR, marca: 'A', modelo: 'B', anoFabricacao: 2021, estadoFisico: EstadoFisico.NOVO, pesoQuilogramas: 3, loteId, posicaoNoLote: 0, statusRastreamento: StatusRastreamento.AGUARDANDO_TRIAGEM, historicoMovimentacoes: [] }, 'admin');
    assert.throws(() => s.equipamento.atualizarEstadoFisico(id, EstadoFisico.USADO_MODERADO, '', 'admin'));
    s.equipamento.atualizarEstadoFisico(id, EstadoFisico.USADO_MODERADO, 'Dano identificado na inspeção.', 'admin');
  });

  test('journal registra operações antes da persistência', () => {
    const journal = s.ctx.journal.listar();
    assert.ok(journal.length > 0);
    assert.ok(journal.some(x => x.operacao === 'CRIAR_LOTE'));
  });

  console.log('\nTodos os testes passaram.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
