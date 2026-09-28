import { join } from 'node:path';
import { AppContext, createContext } from './Bootstrap';
import { Repository } from './persistence/Repository';
import { OrganizacaoData, LoteData, EquipamentoData } from './models/entities';
import { ServiceOrganizacao } from './services/ServiceOrganizacao';
import { ServiceLote } from './services/ServiceLote';
import { ServiceEquipamento } from './services/ServiceEquipamento';
import { ServiceRelatorio } from './services/ServiceRelatorio';
import { ValidadorCNPJ, ValidadorDataEntrada, ValidadorQuedaEstado } from './security/Validators';

export interface Services {
  ctx: AppContext;
  organizacoes: Repository<OrganizacaoData>;
  lotes: Repository<LoteData>;
  equipamentos: Repository<EquipamentoData>;
  organizacao: ServiceOrganizacao;
  lote: ServiceLote;
  equipamento: ServiceEquipamento;
  relatorio: ServiceRelatorio;
}

export function createServices(dataDir = join(process.cwd(), 'data')): Services {
  const ctx = createContext(dataDir);
  const orgs = new Repository<OrganizacaoData>(join(dataDir, 'organizacoes.enc'), ctx.storage, ctx.journal, 'Organizacao');
  const lotes = new Repository<LoteData>(join(dataDir, 'lotes.enc'), ctx.storage, ctx.journal, 'Lote');
  const equipamentos = new Repository<EquipamentoData>(join(dataDir, 'equipamentos.enc'), ctx.storage, ctx.journal, 'Equipamento');
  return {
    ctx,
    organizacoes: orgs,
    lotes,
    equipamentos,
    organizacao: new ServiceOrganizacao(orgs, new ValidadorCNPJ()),
    lote: new ServiceLote(lotes, equipamentos, new ValidadorDataEntrada()),
    equipamento: new ServiceEquipamento(equipamentos, new ValidadorQuedaEstado()),
    relatorio: new ServiceRelatorio(orgs, lotes, equipamentos)
  };
}
