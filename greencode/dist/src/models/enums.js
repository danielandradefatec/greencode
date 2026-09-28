"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusRastreamento = exports.StatusLote = exports.EstadoFisico = exports.TipoEquipamento = exports.PapelUsuario = void 0;
var PapelUsuario;
(function (PapelUsuario) {
    PapelUsuario["ADMINISTRADOR"] = "ADMINISTRADOR";
    PapelUsuario["OPERADOR_CADASTRO"] = "OPERADOR_CADASTRO";
    PapelUsuario["GESTOR_ALMOXARIFADO"] = "GESTOR_ALMOXARIFADO";
    PapelUsuario["AUDITOR"] = "AUDITOR";
})(PapelUsuario || (exports.PapelUsuario = PapelUsuario = {}));
var TipoEquipamento;
(function (TipoEquipamento) {
    TipoEquipamento["COMPUTADOR_MESA"] = "COMPUTADOR_MESA";
    TipoEquipamento["NOTEBOOK"] = "NOTEBOOK";
    TipoEquipamento["MONITOR"] = "MONITOR";
    TipoEquipamento["IMPRESSORA"] = "IMPRESSORA";
    TipoEquipamento["SERVIDOR"] = "SERVIDOR";
    TipoEquipamento["ROTEADOR"] = "ROTEADOR";
    TipoEquipamento["CABO_ESTRUTURADO"] = "CABO_ESTRUTURADO";
    TipoEquipamento["FONTE_ALIMENTACAO"] = "FONTE_ALIMENTACAO";
})(TipoEquipamento || (exports.TipoEquipamento = TipoEquipamento = {}));
var EstadoFisico;
(function (EstadoFisico) {
    EstadoFisico["NOVO"] = "NOVO";
    EstadoFisico["BOM_ESTADO"] = "BOM_ESTADO";
    EstadoFisico["USADO_LEVE"] = "USADO_LEVE";
    EstadoFisico["USADO_MODERADO"] = "USADO_MODERADO";
    EstadoFisico["DANIFICADO_LEVE"] = "DANIFICADO_LEVE";
    EstadoFisico["DANIFICADO_GRAVE"] = "DANIFICADO_GRAVE";
    EstadoFisico["INSERVIVEL"] = "INSERVIVEL";
})(EstadoFisico || (exports.EstadoFisico = EstadoFisico = {}));
var StatusLote;
(function (StatusLote) {
    StatusLote["RECEBIDO"] = "RECEBIDO";
    StatusLote["EM_TRIAGEM"] = "EM_TRIAGEM";
    StatusLote["TRIAGEM_CONCLUIDA"] = "TRIAGEM_CONCLUIDA";
    StatusLote["ENCAMINHADO"] = "ENCAMINHADO";
    StatusLote["FINALIZADO"] = "FINALIZADO";
})(StatusLote || (exports.StatusLote = StatusLote = {}));
var StatusRastreamento;
(function (StatusRastreamento) {
    StatusRastreamento["AGUARDANDO_TRIAGEM"] = "AGUARDANDO_TRIAGEM";
    StatusRastreamento["EM_TRIAGEM"] = "EM_TRIAGEM";
    StatusRastreamento["AGUARDANDO_DESMONTE"] = "AGUARDANDO_DESMONTE";
    StatusRastreamento["EM_DESMONTE"] = "EM_DESMONTE";
    StatusRastreamento["PECAS_APROVEITAVEIS"] = "PECAS_APROVEITAVEIS";
    StatusRastreamento["MATERIAL_RECICLAVEL"] = "MATERIAL_RECICLAVEL";
    StatusRastreamento["DESCARTE_SEGURO"] = "DESCARTE_SEGURO";
    StatusRastreamento["BAIXA_DEFINITIVA"] = "BAIXA_DEFINITIVA";
})(StatusRastreamento || (exports.StatusRastreamento = StatusRastreamento = {}));
