# AV1 — greencode

## 1. Objetivo

O `greencode` é uma aplicação de linha de comando para apoiar a operação de logística reversa de equipamentos de informática e telecomunicações. O sistema foi organizado em camadas de modelos, persistência, segurança, serviços e interface CLI.

## 2. Papéis

- **ADMINISTRADOR:** contas, configurações e operações gerais.
- **OPERADOR_CADASTRO:** organizações, contratos e criação de lotes.
- **GESTOR_ALMOXARIFADO:** triagem, movimentações e atualização física dos equipamentos.
- **AUDITOR:** consultas e relatórios.

A autorização é aplicada antes das operações de negócio.

## 3. Segurança

### Senhas

Cada credencial possui salt individual e hash derivado com `scrypt`. O hash armazenado não é a senha original.

### Criptografia dos arquivos

Os arquivos operacionais usam AES-256-GCM. Cada gravação possui IV aleatório e tag de autenticação. A chave mestra é gerada com bytes aleatórios e armazenada no arquivo de bootstrap.

### Sessão

Após autenticação é criado um token aleatório com validade de 30 minutos. O token é verificado antes de continuar a operação.

### Escrita atômica

O arquivo é escrito primeiro em um arquivo temporário. Depois o temporário é renomeado para o arquivo definitivo. Isso reduz o risco de deixar um arquivo parcialmente gravado após uma interrupção.

## 4. Journal

Antes de alterar uma entidade, o sistema registra uma transação contendo:

- identificador;
- timestamp;
- operação;
- entidade;
- dados anteriores;
- dados posteriores;
- usuário responsável.

O journal também é criptografado. Quando ultrapassa 10 MB, o arquivo é rotacionado.

## 5. Validações

- CNPJ com 14 dígitos e dígitos verificadores válidos.
- CNPJ não pode ser duplicado.
- Data de entrada do lote não pode ser futura.
- Data de entrada não pode ser anterior a 90 dias.
- Equipamento só entra em desmonte depois da triagem.
- Queda de duas ou mais categorias no estado físico exige justificativa.

## 6. Jornada de teste

A suíte automatizada executa:

1. criação da primeira credencial;
2. autenticação;
3. cadastro de organização;
4. tentativa de CNPJ duplicado;
5. tentativa de lote com data futura;
6. criação de lote;
7. inclusão de equipamento;
8. conclusão da triagem;
9. movimentação para desmonte;
10. movimentação para material reciclável;
11. tentativa inválida de queda de estado sem justificativa;
12. alteração válida com justificativa;
13. verificação do journal.

## 7. Comandos principais

```text
ajuda
usuario criar <login> <senha> <papel>
org criar <id> <razaoSocial> <cnpj> <email>
org listar
lote criar --org <id> --nf <nota> --transp <transportadora>
lote equipamento <loteId> <tipo> <marca> <modelo> <ano> <peso>
lote triagem <loteId>
equipamento rastrear <id>
equipamento mover <id> <origem> <destino> [observacao]
equipamento estado <id> <estado> [justificativa]
relatorio status <status>
relatorio org <orgId> <inicio> <fim>
journal
sair
```

## 8. Execução

```bash
npm install
npm run build
npm test
npm start
```

## 9. Compatibilidade

O projeto usa APIs padrão do Node.js e TypeScript, sem dependências de plataforma específicas no código da aplicação. A estrutura foi preparada para Windows e distribuições Linux compatíveis com o enunciado.

## 10. Evolução

A separação entre serviços, repositórios e modelos permite substituir a persistência em arquivos por um banco relacional em uma atividade futura sem alterar a maior parte das regras de negócio.
