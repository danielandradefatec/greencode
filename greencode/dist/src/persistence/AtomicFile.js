"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomicFile = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const crypto_1 = require("../security/crypto");
class AtomicFile {
    chave;
    constructor(chave) {
        this.chave = chave;
    }
    ensureDir(filePath) {
        (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(filePath), { recursive: true });
    }
    exists(filePath) {
        return (0, node_fs_1.existsSync)(filePath);
    }
    read(filePath, fallback) {
        if (!(0, node_fs_1.existsSync)(filePath))
            return fallback;
        const payload = (0, node_fs_1.readFileSync)(filePath, 'utf8');
        return JSON.parse((0, crypto_1.descriptografar)(payload, this.chave));
    }
    write(filePath, value) {
        this.ensureDir(filePath);
        const temp = (0, node_path_1.join)((0, node_path_1.dirname)(filePath), `.${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`);
        const payload = (0, crypto_1.criptografar)(JSON.stringify(value, null, 2), this.chave);
        (0, node_fs_1.writeFileSync)(temp, payload, 'utf8');
        (0, node_fs_1.renameSync)(temp, filePath);
        try {
            (0, node_fs_1.unlinkSync)(temp);
        }
        catch { }
    }
}
exports.AtomicFile = AtomicFile;
