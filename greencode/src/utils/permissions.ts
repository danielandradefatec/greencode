import { PapelUsuario } from '../models/enums';

export type Acao = 'ORGANIZACAO_CRIAR' | 'CONTRATO_RENOVAR' | 'LOTE_CRIAR' | 'LOTE_TRIAGEM' | 'EQUIPAMENTO_MOVIMENTAR' | 'EQUIPAMENTO_ESTADO' | 'RELATORIO' | 'USUARIO_CRIAR';

const regras: Record<Acao, PapelUsuario[]> = {
  ORGANIZACAO_CRIAR: [PapelUsuario.ADMINISTRADOR, PapelUsuario.OPERADOR_CADASTRO],
  CONTRATO_RENOVAR: [PapelUsuario.ADMINISTRADOR, PapelUsuario.OPERADOR_CADASTRO],
  LOTE_CRIAR: [PapelUsuario.ADMINISTRADOR, PapelUsuario.OPERADOR_CADASTRO],
  LOTE_TRIAGEM: [PapelUsuario.ADMINISTRADOR, PapelUsuario.GESTOR_ALMOXARIFADO],
  EQUIPAMENTO_MOVIMENTAR: [PapelUsuario.ADMINISTRADOR, PapelUsuario.GESTOR_ALMOXARIFADO],
  EQUIPAMENTO_ESTADO: [PapelUsuario.ADMINISTRADOR, PapelUsuario.GESTOR_ALMOXARIFADO],
  RELATORIO: Object.values(PapelUsuario),
  USUARIO_CRIAR: [PapelUsuario.ADMINISTRADOR]
};

export function exigirPermissao(papel: PapelUsuario, acao: Acao): void {
  if (!regras[acao].includes(papel)) throw new Error(`Permissão negada para ${papel}: ${acao}.`);
}

export function acoesDoPapel(papel: PapelUsuario): Acao[] {
  return (Object.keys(regras) as Acao[]).filter(acao => regras[acao].includes(papel));
}
