"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CLI_1 = require("./cli/CLI");
const App_1 = require("./App");
async function main() {
    const services = (0, App_1.createServices)();
    await new CLI_1.CLI(services).iniciar();
}
main().catch(error => { console.error(`ERRO FATAL: ${error.message}`); process.exit(1); });
