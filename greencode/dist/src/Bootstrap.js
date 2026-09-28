"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
exports.provisionarSeNecessario = provisionarSeNecessario;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const crypto_1 = require("./security/crypto");
const AtomicFile_1 = require("./persistence/AtomicFile");
const Journal_1 = require("./persistence/Journal");
const Repository_1 = require("./persistence/Repository");
const enums_1 = require("./models/enums");
const AuthService_1 = require("./security/AuthService");
function createContext(dataDir) {
    (0, node_fs_1.mkdirSync)(dataDir, { recursive: true });
    const masterPath = (0, node_path_1.join)(dataDir, 'master.config');
    let chave;
    if (!(0, node_fs_1.existsSync)(masterPath)) {
        chave = (0, crypto_1.gerarChaveMestra)();
        (0, node_fs_1.writeFileSync)(masterPath, chave, 'utf8');
    }
    else {
        chave = (0, node_fs_1.readFileSync)(masterPath, 'utf8').trim();
    }
    const storage = new AtomicFile_1.AtomicFile(chave);
    const journal = new Journal_1.Journal((0, node_path_1.join)(dataDir, 'journal.log'), chave);
    const credenciais = new Repository_1.Repository((0, node_path_1.join)(dataDir, 'credenciais.enc'), storage, journal, 'Credencial', c => c.usuario);
    const sessoes = new Repository_1.Repository((0, node_path_1.join)(dataDir, 'sessoes.enc'), storage, journal, 'Sessao', s => s.token);
    return { dataDir, storage, journal, auth: new AuthService_1.AuthService(credenciais, sessoes), repos: { credenciais, sessoes } };
}
function provisionarSeNecessario(ctx, senhaAdmin) {
    if (ctx.repos.credenciais.all().length > 0)
        return false;
    ctx.auth.criarCredencial('admin', senhaAdmin, enums_1.PapelUsuario.ADMINISTRADOR, 'provisionamento-inicial');
    return true;
}
