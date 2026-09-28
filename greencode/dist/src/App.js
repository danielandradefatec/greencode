"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServices = createServices;
const node_path_1 = require("node:path");
const Bootstrap_1 = require("./Bootstrap");
const Repository_1 = require("./persistence/Repository");
const ServiceOrganizacao_1 = require("./services/ServiceOrganizacao");
const ServiceLote_1 = require("./services/ServiceLote");
const ServiceEquipamento_1 = require("./services/ServiceEquipamento");
const ServiceRelatorio_1 = require("./services/ServiceRelatorio");
const Validators_1 = require("./security/Validators");
function createServices(dataDir = (0, node_path_1.join)(process.cwd(), 'data')) {
    const ctx = (0, Bootstrap_1.createContext)(dataDir);
    const orgs = new Repository_1.Repository((0, node_path_1.join)(dataDir, 'organizacoes.enc'), ctx.storage, ctx.journal, 'Organizacao');
    const lotes = new Repository_1.Repository((0, node_path_1.join)(dataDir, 'lotes.enc'), ctx.storage, ctx.journal, 'Lote');
    const equipamentos = new Repository_1.Repository((0, node_path_1.join)(dataDir, 'equipamentos.enc'), ctx.storage, ctx.journal, 'Equipamento');
    return {
        ctx,
        organizacoes: orgs,
        lotes,
        equipamentos,
        organizacao: new ServiceOrganizacao_1.ServiceOrganizacao(orgs, new Validators_1.ValidadorCNPJ()),
        lote: new ServiceLote_1.ServiceLote(lotes, equipamentos, new Validators_1.ValidadorDataEntrada()),
        equipamento: new ServiceEquipamento_1.ServiceEquipamento(equipamentos, new Validators_1.ValidadorQuedaEstado()),
        relatorio: new ServiceRelatorio_1.ServiceRelatorio(orgs, lotes, equipamentos)
    };
}
