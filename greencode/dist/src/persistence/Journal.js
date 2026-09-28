"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Journal = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const crypto_1 = require("../security/crypto");
class Journal {
    filePath;
    chave;
    constructor(filePath, chave) {
        this.filePath = filePath;
        this.chave = chave;
        (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(filePath), { recursive: true });
    }
    registrar(t) {
        const linha = (0, crypto_1.criptografar)(JSON.stringify(t), this.chave);
        (0, node_fs_1.appendFileSync)(this.filePath, linha + '\n', 'utf8');
        this.rotacionarSeNecessario();
    }
    listar() {
        if (!(0, node_fs_1.existsSync)(this.filePath))
            return [];
        return (0, node_fs_1.readFileSync)(this.filePath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse((0, crypto_1.descriptografar)(l, this.chave)));
    }
    rotacionarSeNecessario() {
        if (!(0, node_fs_1.existsSync)(this.filePath) || (0, node_fs_1.statSync)(this.filePath).size <= 10 * 1024 * 1024)
            return;
        const rotated = (0, node_path_1.join)((0, node_path_1.dirname)(this.filePath), `journal-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
        (0, node_fs_1.renameSync)(this.filePath, rotated);
    }
}
exports.Journal = Journal;
