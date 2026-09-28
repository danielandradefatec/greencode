import { PapelUsuario, TipoEquipamento, EstadoFisico, StatusLote, StatusRastreamento } from './enums';

export interface CredencialData {
  usuario: string;
  hashSenha: string;
  salt: string;
  ultimoAcesso: string;
  papel: PapelUsuario;
}

export interface SessaoData {
  token: string;
  usuario: string;
  papel: PapelUsuario;
  criacao: string;
  expiracao: string;
}

export interface ContratoData {
  id: string;
  organizacaoId: string;
  dataAssinatura: string;
  dataVencimento: string;
  clausulas: string[];
  valorMensal: number;
  renovacaoAutomatica: boolean;
}

export interface OrganizacaoData {
  id: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  enderecoCompleto: string;
  telefone: string;
  email: string;
  dataCadastro: string;
  ativo: boolean;
  contratoVigente?: ContratoData;
}

export interface LoteData {
  id: string;
  dataEntrada: string;
  organizacaoId: string;
  notaFiscal: string;
  transportadora: string;
  equipamentos: string[];
  statusProcessamento: StatusLote;
  observacoes: string;
}

export interface MovimentacaoData {
  id: string;
  equipamentoId: string;
  dataHora: string;
  origem: string;
  destino: string;
  responsavel: string;
  observacao: string;
}

export interface EquipamentoData {
  id: string;
  codigoBarrasInterno: string;
  tipo: TipoEquipamento;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  estadoFisico: EstadoFisico;
  pesoQuilogramas: number;
  loteId: string;
  posicaoNoLote: number;
  statusRastreamento: StatusRastreamento;
  historicoMovimentacoes: MovimentacaoData[];
}

export interface JournalTransacao {
  id: string;
  timestamp: string;
  operacao: string;
  entidade: string;
  dadosAntes: unknown;
  dadosDepois: unknown;
  usuarioResponsavel: string;
}
