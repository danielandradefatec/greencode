import { EquipamentoData, LoteData } from '../models/entities';
import { EstadoFisico } from '../models/enums';

export interface Validador { validar(objeto: unknown): boolean; obterMensagemErro(): string; }

export class ValidadorCNPJ implements Validador {
  private erro = '';
  validar(cnpj: unknown): boolean {
    if (typeof cnpj !== 'string') { this.erro = 'CNPJ inválido.'; return false; }
    const n = cnpj.replace(/\D/g, '');
    if (n.length !== 14 || /^([0-9])\1+$/.test(n)) { this.erro = 'CNPJ deve conter 14 dígitos válidos.'; return false; }
    const calc = (base: string): number => {
      const weights = base.length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
      const sum = base.split('').reduce((s, d, i) => s + Number(d) * weights[i], 0);
      const r = sum % 11; return r < 2 ? 0 : 11 - r;
    };
    const ok = calc(n.slice(0,12)) === Number(n[12]) && calc(n.slice(0,13)) === Number(n[13]);
    if (!ok) this.erro = 'Dígitos verificadores do CNPJ não conferem.';
    return ok;
  }
  obterMensagemErro(): string { return this.erro; }
}

export class ValidadorDataEntrada implements Validador {
  private erro = '';
  validar(data: unknown): boolean {
    if (typeof data !== 'string') { this.erro = 'Data inválida.'; return false; }
    const d = new Date(data).getTime();
    const agora = Date.now();
    const limite = agora - 90 * 24 * 60 * 60 * 1000;
    const ok = Number.isFinite(d) && d <= agora && d >= limite;
    if (!ok) this.erro = 'A data de entrada não pode ser futura nem anterior a 90 dias.';
    return ok;
  }
  obterMensagemErro(): string { return this.erro; }
}

export class ValidadorQuedaEstado implements Validador {
  private erro = '';
  private nivel(e: EstadoFisico): number { return Object.values(EstadoFisico).indexOf(e); }
  validar(dados: unknown): boolean {
    const obj = dados as { anterior?: EstadoFisico; novo?: EstadoFisico; justificativa?: string };
    if (!obj.anterior || !obj.novo) return true;
    const queda = this.nivel(obj.novo) - this.nivel(obj.anterior);
    if (queda >= 2 && !obj.justificativa?.trim()) { this.erro = 'É obrigatória uma justificativa para queda de duas ou mais categorias.'; return false; }
    return true;
  }
  obterMensagemErro(): string { return this.erro; }
}

export function validarTriagemParaDesmonte(equipamento: EquipamentoData): void {
  if (equipamento.statusRastreamento !== 'AGUARDANDO_DESMONTE') throw new Error('Equipamento só pode ir para desmonte após triagem completa.');
}
