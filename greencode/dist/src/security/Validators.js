"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadorQuedaEstado = exports.ValidadorDataEntrada = exports.ValidadorCNPJ = void 0;
exports.validarTriagemParaDesmonte = validarTriagemParaDesmonte;
const enums_1 = require("../models/enums");
class ValidadorCNPJ {
    erro = '';
    validar(cnpj) {
        if (typeof cnpj !== 'string') {
            this.erro = 'CNPJ inválido.';
            return false;
        }
        const n = cnpj.replace(/\D/g, '');
        if (n.length !== 14 || /^([0-9])\1+$/.test(n)) {
            this.erro = 'CNPJ deve conter 14 dígitos válidos.';
            return false;
        }
        const calc = (base) => {
            const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
            const sum = base.split('').reduce((s, d, i) => s + Number(d) * weights[i], 0);
            const r = sum % 11;
            return r < 2 ? 0 : 11 - r;
        };
        const ok = calc(n.slice(0, 12)) === Number(n[12]) && calc(n.slice(0, 13)) === Number(n[13]);
        if (!ok)
            this.erro = 'Dígitos verificadores do CNPJ não conferem.';
        return ok;
    }
    obterMensagemErro() { return this.erro; }
}
exports.ValidadorCNPJ = ValidadorCNPJ;
class ValidadorDataEntrada {
    erro = '';
    validar(data) {
        if (typeof data !== 'string') {
            this.erro = 'Data inválida.';
            return false;
        }
        const d = new Date(data).getTime();
        const agora = Date.now();
        const limite = agora - 90 * 24 * 60 * 60 * 1000;
        const ok = Number.isFinite(d) && d <= agora && d >= limite;
        if (!ok)
            this.erro = 'A data de entrada não pode ser futura nem anterior a 90 dias.';
        return ok;
    }
    obterMensagemErro() { return this.erro; }
}
exports.ValidadorDataEntrada = ValidadorDataEntrada;
class ValidadorQuedaEstado {
    erro = '';
    nivel(e) { return Object.values(enums_1.EstadoFisico).indexOf(e); }
    validar(dados) {
        const obj = dados;
        if (!obj.anterior || !obj.novo)
            return true;
        const queda = this.nivel(obj.novo) - this.nivel(obj.anterior);
        if (queda >= 2 && !obj.justificativa?.trim()) {
            this.erro = 'É obrigatória uma justificativa para queda de duas ou mais categorias.';
            return false;
        }
        return true;
    }
    obterMensagemErro() { return this.erro; }
}
exports.ValidadorQuedaEstado = ValidadorQuedaEstado;
function validarTriagemParaDesmonte(equipamento) {
    if (equipamento.statusRastreamento !== 'AGUARDANDO_DESMONTE')
        throw new Error('Equipamento só pode ir para desmonte após triagem completa.');
}
