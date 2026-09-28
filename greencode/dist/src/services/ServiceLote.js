"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLote = void 0;
const enums_1 = require("../models/enums");
class ServiceLote {
    repo;
    equipamentos;
    validadorData;
    constructor(repo, equipamentos, validadorData) {
        this.repo = repo;
        this.equipamentos = equipamentos;
        this.validadorData = validadorData;
    }
    criarLote(lote, usuario) {
        if (!this.validadorData.validar(lote.dataEntrada))
            throw new Error(this.validadorData.obterMensagemErro());
        if (this.repo.get(lote.id))
            throw new Error('Lote já cadastrado.');
        lote.statusProcessamento = enums_1.StatusLote.RECEBIDO;
        lote.equipamentos = [];
        this.repo.save(lote, usuario, 'CRIAR_LOTE');
    }
    adicionarEquipamentoAoLote(loteId, equipamento, usuario) {
        const lote = this.repo.get(loteId);
        if (!lote)
            throw new Error('Lote não encontrado.');
        if (lote.statusProcessamento === enums_1.StatusLote.FINALIZADO)
            throw new Error('Lote finalizado não aceita novos equipamentos.');
        if (this.equipamentos.get(equipamento.id))
            throw new Error('Equipamento já cadastrado.');
        equipamento.loteId = loteId;
        equipamento.posicaoNoLote = lote.equipamentos.length + 1;
        equipamento.statusRastreamento = enums_1.StatusRastreamento.AGUARDANDO_TRIAGEM;
        equipamento.historicoMovimentacoes = [];
        this.equipamentos.save(equipamento, usuario, 'ADICIONAR_EQUIPAMENTO_LOTE');
        lote.equipamentos.push(equipamento.id);
        this.repo.save(lote, usuario, 'ATUALIZAR_LOTE');
    }
    processarTriagem(loteId, usuario) {
        const lote = this.repo.get(loteId);
        if (!lote)
            throw new Error('Lote não encontrado.');
        const equipamentos = lote.equipamentos.map(id => this.equipamentos.get(id)).filter(Boolean);
        if (equipamentos.length === 0)
            throw new Error('Lote sem equipamentos.');
        lote.statusProcessamento = enums_1.StatusLote.TRIAGEM_CONCLUIDA;
        for (const equipamento of equipamentos) {
            if (equipamento.statusRastreamento === enums_1.StatusRastreamento.AGUARDANDO_TRIAGEM) {
                equipamento.statusRastreamento = enums_1.StatusRastreamento.AGUARDANDO_DESMONTE;
                this.equipamentos.save(equipamento, usuario, 'CONCLUIR_TRIAGEM');
            }
        }
        this.repo.save(lote, usuario, 'CONCLUIR_TRIAGEM_LOTE');
    }
    gerarRelatorioTriagem(loteId) {
        const lote = this.repo.get(loteId);
        if (!lote)
            throw new Error('Lote não encontrado.');
        const equipamentos = lote.equipamentos.map(id => this.equipamentos.get(id)).filter(Boolean);
        return JSON.stringify({ lote, equipamentos }, null, 2);
    }
    consultarLotePorPeriodo(dataInicio, dataFim) {
        const ini = new Date(dataInicio).getTime(), fim = new Date(dataFim).getTime();
        return this.repo.all().filter(l => { const t = new Date(l.dataEntrada).getTime(); return t >= ini && t <= fim; });
    }
}
exports.ServiceLote = ServiceLote;
