# cypress-api-kualitee

Projeto de automação de testes de APIs utilizando Cypress.

## Descrição

Este repositório tem como objetivo automatizar testes de APIs, facilitando a validação de endpoints e garantindo a qualidade das integrações. Utiliza o Cypress como framework principal para escrita e execução dos testes.

## Tecnologias Utilizadas

- **JavaScript** (100%)
- [Cypress](https://www.cypress.io/) para automação de testes

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (versão recomendada: 14.x ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) instalado

## Instalação

Clone o repositório:
```bash
git clone https://github.com/LUCASCNASC/cypress-api-kualitee.git
cd cypress-api-kualitee
```
Instale as dependências:
```bash
npm install
# ou
yarn install
```
## Como executar os testes

Para executar todos os testes em modo headless:
```bash
npx cypress run
```
Para abrir a interface gráfica do Cypress:
```bash
npx cypress open
```
## Estrutura do Projeto

```
cypress-api-kualitee/
├── cypress/
│   ├── integration/   # Scripts de teste
│   ├── fixtures/      # Dados para testes
│   └── support/       # Comandos customizados e configurações
├── cypress.json       # Configuração do Cypress
├── package.json
└── README.md
```

## Contribuição

Sinta-se à vontade para abrir issues e pull requests para sugerir melhorias, reportar bugs ou contribuir com novos testes.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por [LUCASCNASC](https://github.com/LUCASCNASC)

Documentando projeto.