"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exigirPermissao = exigirPermissao;
exports.acoesDoPapel = acoesDoPapel;
const enums_1 = require("../models/enums");
const regras = {
    ORGANIZACAO_CRIAR: [enums_1.PapelUsuario.ADMINISTRADOR, enums_1.PapelUsuario.OPERADOR_CADASTRO],
    CONTRATO_RENOVAR: [enums_1.PapelUsuario.ADMINISTRADOR, enums_1.PapelUsuario.OPERADOR_CADASTRO],
    LOTE_CRIAR: [enums_1.PapelUsuario.ADMINISTRADOR, enums_1.PapelUsuario.OPERADOR_CADASTRO],
    LOTE_TRIAGEM: [enums_1.PapelUsuario.ADMINISTRADOR, enums_1.PapelUsuario.GESTOR_ALMOXARIFADO],
    EQUIPAMENTO_MOVIMENTAR: [enums_1.PapelUsuario.ADMINISTRADOR, enums_1.PapelUsuario.GESTOR_ALMOXARIFADO],
    EQUIPAMENTO_ESTADO: [enums_1.PapelUsuario.ADMINISTRADOR, enums_1.PapelUsuario.GESTOR_ALMOXARIFADO],
    RELATORIO: Object.values(enums_1.PapelUsuario),
    USUARIO_CRIAR: [enums_1.PapelUsuario.ADMINISTRADOR]
};
function exigirPermissao(papel, acao) {
    if (!regras[acao].includes(papel))
        throw new Error(`Permissão negada para ${papel}: ${acao}.`);
}
function acoesDoPapel(papel) {
    return Object.keys(regras).filter(acao => regras[acao].includes(papel));
}
