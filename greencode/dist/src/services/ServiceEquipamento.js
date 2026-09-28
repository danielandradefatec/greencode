"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceEquipamento = void 0;
const enums_1 = require("../models/enums");
const Validators_1 = require("../security/Validators");
class ServiceEquipamento {
    repo;
    validadorQueda;
    constructor(repo, validadorQueda) {
        this.repo = repo;
        this.validadorQueda = validadorQueda;
    }
    rastrearEquipamento(id) { return this.repo.get(id); }
    atualizarEstadoFisico(id, novoEstado, justificativa, usuario) {
        const equipamento = this.repo.get(id);
        if (!equipamento)
            throw new Error('Equipamento não encontrado.');
        if (!this.validadorQueda.validar({ anterior: equipamento.estadoFisico, novo: novoEstado, justificativa }))
            throw new Error(this.validadorQueda.obterMensagemErro());
        equipamento.estadoFisico = novoEstado;
        this.repo.save(equipamento, usuario, 'ATUALIZAR_ESTADO_FISICO');
    }
    gerarCodigoBarras(tipo, sequencia) {
        return `GC-${tipo.slice(0, 4)}-${String(sequencia).padStart(6, '0')}`;
    }
    registrarMovimentacao(id, origem, destino, usuario, observacao = '') {
        const equipamento = this.repo.get(id);
        if (!equipamento)
            throw new Error('Equipamento não encontrado.');
        const mov = {
            id: `MOV-${Date.now()}`, equipamentoId: id, dataHora: new Date().toISOString(), origem, destino,
            responsavel: usuario, observacao
        };
        equipamento.historicoMovimentacoes.push(mov);
        equipamento.statusRastreamento = this.statusPorDestino(equipamento, destino);
        this.repo.save(equipamento, usuario, 'REGISTRAR_MOVIMENTACAO');
    }
    statusPorDestino(equipamento, destino) {
        const d = destino.toLowerCase();
        const atual = equipamento.statusRastreamento;
        if (d.includes('triagem'))
            return enums_1.StatusRastreamento.EM_TRIAGEM;
        if (d.includes('desmonte')) {
            (0, Validators_1.validarTriagemParaDesmonte)(equipamento);
            return enums_1.StatusRastreamento.EM_DESMONTE;
        }
        if (d.includes('aproveit'))
            return enums_1.StatusRastreamento.PECAS_APROVEITAVEIS;
        if (d.includes('reciclag') || d.includes('reciclavel'))
            return enums_1.StatusRastreamento.MATERIAL_RECICLAVEL;
        if (d.includes('descarte'))
            return enums_1.StatusRastreamento.DESCARTE_SEGURO;
        if (d.includes('baixa'))
            return enums_1.StatusRastreamento.BAIXA_DEFINITIVA;
        return atual;
    }
    calcularDepreciacao(equipamento, taxaAnual = 0.2) {
        const idade = Math.max(0, new Date().getFullYear() - equipamento.anoFabricacao);
        return Math.max(0, Math.pow(1 - taxaAnual, idade));
    }
}
exports.ServiceEquipamento = ServiceEquipamento;
