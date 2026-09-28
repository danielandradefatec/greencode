import { EquipamentoData, MovimentacaoData } from '../models/entities';
import { Repository } from '../persistence/Repository';
import { EstadoFisico, StatusRastreamento, TipoEquipamento } from '../models/enums';
import { ValidadorQuedaEstado, validarTriagemParaDesmonte } from '../security/Validators';

export class ServiceEquipamento {
  constructor(private readonly repo: Repository<EquipamentoData>, private readonly validadorQueda: ValidadorQuedaEstado) {}

  rastrearEquipamento(id: string): EquipamentoData | undefined { return this.repo.get(id); }

  atualizarEstadoFisico(id: string, novoEstado: EstadoFisico, justificativa: string, usuario: string): void {
    const equipamento = this.repo.get(id);
    if (!equipamento) throw new Error('Equipamento não encontrado.');
    if (!this.validadorQueda.validar({ anterior: equipamento.estadoFisico, novo: novoEstado, justificativa })) throw new Error(this.validadorQueda.obterMensagemErro());
    equipamento.estadoFisico = novoEstado;
    this.repo.save(equipamento, usuario, 'ATUALIZAR_ESTADO_FISICO');
  }

  gerarCodigoBarras(tipo: TipoEquipamento, sequencia: number): string {
    return `GC-${tipo.slice(0, 4)}-${String(sequencia).padStart(6, '0')}`;
  }

  registrarMovimentacao(id: string, origem: string, destino: string, usuario: string, observacao = ''): void {
    const equipamento = this.repo.get(id);
    if (!equipamento) throw new Error('Equipamento não encontrado.');
    const mov: MovimentacaoData = {
      id: `MOV-${Date.now()}`, equipamentoId: id, dataHora: new Date().toISOString(), origem, destino,
      responsavel: usuario, observacao
    };
    equipamento.historicoMovimentacoes.push(mov);
    equipamento.statusRastreamento = this.statusPorDestino(equipamento, destino);
    this.repo.save(equipamento, usuario, 'REGISTRAR_MOVIMENTACAO');
  }

  private statusPorDestino(equipamento: EquipamentoData, destino: string): StatusRastreamento {
    const d = destino.toLowerCase();
    const atual = equipamento.statusRastreamento;
    if (d.includes('triagem')) return StatusRastreamento.EM_TRIAGEM;
    if (d.includes('desmonte')) { validarTriagemParaDesmonte(equipamento); return StatusRastreamento.EM_DESMONTE; }
    if (d.includes('aproveit')) return StatusRastreamento.PECAS_APROVEITAVEIS;
    if (d.includes('reciclag') || d.includes('reciclavel')) return StatusRastreamento.MATERIAL_RECICLAVEL;
    if (d.includes('descarte')) return StatusRastreamento.DESCARTE_SEGURO;
    if (d.includes('baixa')) return StatusRastreamento.BAIXA_DEFINITIVA;
    return atual;
  }

  calcularDepreciacao(equipamento: EquipamentoData, taxaAnual = 0.2): number {
    const idade = Math.max(0, new Date().getFullYear() - equipamento.anoFabricacao);
    return Math.max(0, Math.pow(1 - taxaAnual, idade));
  }
}
