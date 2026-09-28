import { CLI } from './cli/CLI';
import { createServices } from './App';

async function main(): Promise<void> {
  const services = createServices();
  await new CLI(services).iniciar();
}

main().catch(error => { console.error(`ERRO FATAL: ${error.message}`); process.exit(1); });
