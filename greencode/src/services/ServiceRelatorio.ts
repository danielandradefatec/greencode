import { EquipamentoData, LoteData, OrganizacaoData } from '../models/entities';
import { StatusRastreamento } from '../models/enums';
import { Repository } from '../persistence/Repository';

export class ServiceRelatorio {
  constructor(private readonly orgs: Repository<OrganizacaoData>, private readonly lotes: Repository<LoteData>, private readonly equipamentos: Repository<EquipamentoData>) {}

  gerarRelatorioPorOrganizacao(organizacaoId: string, periodo: { inicio: Date; fim: Date }): string {
    const lotes = this.lotes.all().filter(l => l.organizacaoId === organizacaoId && this.dentro(l.dataEntrada, periodo));
    const equipamentos = lotes.flatMap(l => l.equipamentos.map(id => this.equipamentos.get(id)).filter(Boolean) as EquipamentoData[]);
    return JSON.stringify({ organizacao: this.orgs.get(organizacaoId), periodo, lotes: lotes.length, equipamentos: equipamentos.length }, null, 2);
  }

  gerarRelatorioPorStatus(status: StatusRastreamento): string {
    return JSON.stringify(this.equipamentos.all().filter(e => e.statusRastreamento === status), null, 2);
  }

  gerarRelatorioFinanceiro(periodo: { inicio: Date; fim: Date }): string {
    const contratos = this.orgs.all().map(o => o.contratoVigente).filter(Boolean).filter(c => this.dentro(c!.dataAssinatura, periodo));
    const total = contratos.reduce((s, c) => s + (c?.valorMensal ?? 0), 0);
    return JSON.stringify({ periodo, contratos: contratos.length, valorMensalTotal: total }, null, 2);
  }

  private dentro(data: string, periodo: { inicio: Date; fim: Date }): boolean {
    const t = new Date(data).getTime(); return t >= periodo.inicio.getTime() && t <= periodo.fim.getTime();
  }
}
