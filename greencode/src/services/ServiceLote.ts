import { EquipamentoData, LoteData } from '../models/entities';
import { Repository } from '../persistence/Repository';
import { StatusLote, StatusRastreamento } from '../models/enums';
import { ValidadorDataEntrada } from '../security/Validators';

export class ServiceLote {
  constructor(private readonly repo: Repository<LoteData>, private readonly equipamentos: Repository<EquipamentoData>, private readonly validadorData: ValidadorDataEntrada) {}

  criarLote(lote: LoteData, usuario: string): void {
    if (!this.validadorData.validar(lote.dataEntrada)) throw new Error(this.validadorData.obterMensagemErro());
    if (this.repo.get(lote.id)) throw new Error('Lote já cadastrado.');
    lote.statusProcessamento = StatusLote.RECEBIDO;
    lote.equipamentos = [];
    this.repo.save(lote, usuario, 'CRIAR_LOTE');
  }

  adicionarEquipamentoAoLote(loteId: string, equipamento: EquipamentoData, usuario: string): void {
    const lote = this.repo.get(loteId);
    if (!lote) throw new Error('Lote não encontrado.');
    if (lote.statusProcessamento === StatusLote.FINALIZADO) throw new Error('Lote finalizado não aceita novos equipamentos.');
    if (this.equipamentos.get(equipamento.id)) throw new Error('Equipamento já cadastrado.');
    equipamento.loteId = loteId;
    equipamento.posicaoNoLote = lote.equipamentos.length + 1;
    equipamento.statusRastreamento = StatusRastreamento.AGUARDANDO_TRIAGEM;
    equipamento.historicoMovimentacoes = [];
    this.equipamentos.save(equipamento, usuario, 'ADICIONAR_EQUIPAMENTO_LOTE');
    lote.equipamentos.push(equipamento.id);
    this.repo.save(lote, usuario, 'ATUALIZAR_LOTE');
  }

  processarTriagem(loteId: string, usuario: string): void {
    const lote = this.repo.get(loteId);
    if (!lote) throw new Error('Lote não encontrado.');
    const equipamentos = lote.equipamentos.map(id => this.equipamentos.get(id)).filter(Boolean) as EquipamentoData[];
    if (equipamentos.length === 0) throw new Error('Lote sem equipamentos.');
    lote.statusProcessamento = StatusLote.TRIAGEM_CONCLUIDA;
    for (const equipamento of equipamentos) {
      if (equipamento.statusRastreamento === StatusRastreamento.AGUARDANDO_TRIAGEM) {
        equipamento.statusRastreamento = StatusRastreamento.AGUARDANDO_DESMONTE;
        this.equipamentos.save(equipamento, usuario, 'CONCLUIR_TRIAGEM');
      }
    }
    this.repo.save(lote, usuario, 'CONCLUIR_TRIAGEM_LOTE');
  }

  gerarRelatorioTriagem(loteId: string): string {
    const lote = this.repo.get(loteId);
    if (!lote) throw new Error('Lote não encontrado.');
    const equipamentos = lote.equipamentos.map(id => this.equipamentos.get(id)).filter(Boolean);
    return JSON.stringify({ lote, equipamentos }, null, 2);
  }

  consultarLotePorPeriodo(dataInicio: string, dataFim: string): LoteData[] {
    const ini = new Date(dataInicio).getTime(), fim = new Date(dataFim).getTime();
    return this.repo.all().filter(l => { const t = new Date(l.dataEntrada).getTime(); return t >= ini && t <= fim; });
  }
}
