import { OrganizacaoData } from '../models/entities';
import { Repository } from '../persistence/Repository';
import { ValidadorCNPJ } from '../security/Validators';

export class ServiceOrganizacao {
  constructor(private readonly repo: Repository<OrganizacaoData>, private readonly validadorCNPJ: ValidadorCNPJ) {}

  cadastrarOrganizacao(dados: OrganizacaoData, usuario: string): void {
    if (!this.validadorCNPJ.validar(dados.cnpj)) throw new Error(this.validadorCNPJ.obterMensagemErro());
    if (this.repo.all().some(o => o.cnpj.replace(/\D/g, '') === dados.cnpj.replace(/\D/g, ''))) throw new Error('CNPJ já cadastrado.');
    this.repo.save(dados, usuario, 'CADASTRAR_ORGANIZACAO');
  }

  buscarOrganizacao(id: string): OrganizacaoData | undefined { return this.repo.get(id); }
  listarOrganizacoesAtivas(): OrganizacaoData[] { return this.repo.all().filter(o => o.ativo); }

  alterarEndereco(organizacaoId: string, novoEndereco: string, usuario: string): void {
    const org = this.repo.get(organizacaoId);
    if (!org) throw new Error('Organização não encontrada.');
    org.enderecoCompleto = novoEndereco;
    this.repo.save(org, usuario, 'ALTERAR_ENDERECO');
  }

  desativar(organizacaoId: string, usuario: string): void {
    const org = this.repo.get(organizacaoId);
    if (!org) throw new Error('Organização não encontrada.');
    org.ativo = false;
    this.repo.save(org, usuario, 'DESATIVAR_ORGANIZACAO');
  }

  renovarContrato(organizacaoId: string, novoVencimento: string, usuario: string): void {
    const org = this.repo.get(organizacaoId);
    if (!org) throw new Error('Organização não encontrada.');
    if (!org.contratoVigente) throw new Error('Organização não possui contrato vigente.');
    org.contratoVigente.dataVencimento = novoVencimento;
    this.repo.save(org, usuario, 'RENOVAR_CONTRATO');
  }
}
