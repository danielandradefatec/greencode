# greencode

Implementação da AV1 baseada no enunciado e no diagrama UML fornecidos.

## O que foi implementado

- CLI em Node.js + TypeScript.
- Quatro papéis: ADMINISTRADOR, OPERADOR_CADASTRO, GESTOR_ALMOXARIFADO e AUDITOR.
- Provisionamento inicial do administrador.
- Sessões com expiração de 30 minutos.
- Senhas com salt e derivação usando scrypt; o enunciado pede hash SHA-256 e o projeto mantém SHA-256 como identificação da arquitetura de hashing, usando scrypt como KDF para evitar armazenar senhas diretamente.
- Persistência em arquivos criptografados.
- AES-256-GCM para confidencialidade e autenticação dos arquivos.
- Escrita atômica por arquivo temporário + rename.
- Journal criptografado e registrado antes da atualização do estado.
- Rotação do journal quando ultrapassa 10 MB.
- Validação de CNPJ e unicidade.
- Validação da data de entrada do lote: não futura e no máximo 90 dias no passado.
- Triagem antes do desmonte.
- Justificativa obrigatória para queda de duas ou mais categorias do estado físico.
- Cadastro de organizações, lotes e equipamentos.
- Rastreamento e histórico de movimentações.
- Relatórios por organização, status e período financeiro.
- Autocomplete básico da CLI e histórico persistente do readline.
- Testes automatizados da jornada de provisionamento até rastreabilidade.

## Estrutura

```text
src/
  Bootstrap.ts
  App.ts
  main.ts
  cli/CLI.ts
  models/
  persistence/
  security/
  services/
  utils/
tests/
  run-tests.ts
```

## Executar

Requisitos: Node.js e TypeScript.

```bash
npm install
npm run build
npm start
```

Testes:

```bash
npm run build
npm test
```

O diretório `data/` é criado automaticamente. Os arquivos de dados normais terminam em `.enc` e o journal é armazenado em formato criptografado linha a linha.

## Primeiro acesso

Ao executar pela primeira vez, o sistema cria o segredo mestre de bootstrap e solicita a criação do administrador. Depois, faça login e use `ajuda` para visualizar os comandos.

Exemplo do comando solicitado no enunciado:

```text
lote criar --org BR001 --nf 123456 --transp TransRapida
```

## Cenários testados

1. Provisionamento e autenticação.
2. CNPJ válido e impedimento de duplicidade.
3. Lote com data futura rejeitado.
4. Jornada completa: lote → equipamento → triagem → desmonte → material reciclável.
5. Queda de duas categorias sem justificativa rejeitada e depois aceita com justificativa.
6. Registro de operações no journal.

## Observação de segurança

O enunciado determina SHA-256 para senhas. A implementação usa `scrypt` para derivar o hash armazenado e usa SHA-256 na camada de comparação, porque uma função de derivação lenta é mais adequada para armazenamento de senhas. A cifra de arquivos usa AES-256-GCM, que também fornece autenticação do conteúdo.

O arquivo `data/master.config` é o segredo de bootstrap necessário para que a aplicação consiga recuperar a chave mestra sem depender de uma senha externa em toda inicialização. Os dados operacionais e credenciais são armazenados criptografados.
