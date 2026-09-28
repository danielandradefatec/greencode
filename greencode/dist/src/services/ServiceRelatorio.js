"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRelatorio = void 0;
class ServiceRelatorio {
    orgs;
    lotes;
    equipamentos;
    constructor(orgs, lotes, equipamentos) {
        this.orgs = orgs;
        this.lotes = lotes;
        this.equipamentos = equipamentos;
    }
    gerarRelatorioPorOrganizacao(organizacaoId, periodo) {
        const lotes = this.lotes.all().filter(l => l.organizacaoId === organizacaoId && this.dentro(l.dataEntrada, periodo));
        const equipamentos = lotes.flatMap(l => l.equipamentos.map(id => this.equipamentos.get(id)).filter(Boolean));
        return JSON.stringify({ organizacao: this.orgs.get(organizacaoId), periodo, lotes: lotes.length, equipamentos: equipamentos.length }, null, 2);
    }
    gerarRelatorioPorStatus(status) {
        return JSON.stringify(this.equipamentos.all().filter(e => e.statusRastreamento === status), null, 2);
    }
    gerarRelatorioFinanceiro(periodo) {
        const contratos = this.orgs.all().map(o => o.contratoVigente).filter(Boolean).filter(c => this.dentro(c.dataAssinatura, periodo));
        const total = contratos.reduce((s, c) => s + (c?.valorMensal ?? 0), 0);
        return JSON.stringify({ periodo, contratos: contratos.length, valorMensalTotal: total }, null, 2);
    }
    dentro(data, periodo) {
        const t = new Date(data).getTime();
        return t >= periodo.inicio.getTime() && t <= periodo.fim.getTime();
    }
}
exports.ServiceRelatorio = ServiceRelatorio;
