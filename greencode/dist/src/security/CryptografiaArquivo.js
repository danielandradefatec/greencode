"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriptografiaArquivo = void 0;
const crypto_1 = require("./crypto");
class CriptografiaArquivo {
    chave;
    constructor(chave) {
        this.chave = chave;
    }
    criptografar(dados) { return (0, crypto_1.criptografar)(dados, this.chave); }
    descriptografar(dados) { return (0, crypto_1.descriptografar)(dados, this.chave); }
    gerarChave() { return this.chave; }
}
exports.CriptografiaArquivo = CriptografiaArquivo;
