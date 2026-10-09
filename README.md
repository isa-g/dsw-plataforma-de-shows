# 🎪 Sistema de Gestão de Shows e Ingressos — Backend

API REST para gerenciamento de **artistas, locais, shows e venda de ingressos**, com autenticação via **JWT** e controle de acesso por perfil (**ADMIN** e **CLIENTE**). O projeto também inclui um **menu interativo de terminal** (`menu.js`) que consome a API, permitindo usar todo o sistema sem precisar de ferramentas como Postman ou Thunder Client.

---

## 📑 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura e estrutura de pastas](#-arquitetura-e-estrutura-de-pastas)
- [Modelo de dados](#-modelo-de-dados)
- [Regras de negócio](#-regras-de-negócio)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e execução](#-instalação-e-execução)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Menu interativo (CLI)](#-menu-interativo-cli)
- [Documentação da API](#-documentação-da-api)
- [Exemplos de uso](#-exemplos-de-uso)
- [Códigos de resposta e erros](#-códigos-de-resposta-e-erros)
- [Scripts disponíveis](#-scripts-disponíveis)
- [Observações e melhorias futuras](#-observações-e-melhorias-futuras)

---

## ✨ Funcionalidades

- **Autenticação**: cadastro de usuários e login por **e-mail ou username**, com senha criptografada (bcrypt) e token JWT com validade de 1 dia.
- **Perfis de acesso**: `ADMIN` (gerencia o catálogo) e `CLIENTE` (consulta shows e compra ingressos).
- **CRUD de Artistas**, **Locais** e **Shows**.
- **Compra de ingressos** por tipo de setor (pista, VIP, camarote etc.) e **consulta dos ingressos do usuário logado**.
- **Bloqueio de conflito de agenda**: não é possível haver dois shows no mesmo local e horário.
- **Menu CLI** em Node.js com navegação por perfil (as opções mudam se o usuário é ADMIN ou CLIENTE).

---

## 🛠 Tecnologias

| Tecnologia | Uso |
| --- | --- |
| [Node.js](https://nodejs.org/) (18+) | Ambiente de execução (usa `fetch` nativo no menu CLI) |
| [Express 4](https://expressjs.com/) | Framework web / rotas |
| [Prisma 5](https://www.prisma.io/) | ORM e migrations |
| [MySQL](https://www.mysql.com/) | Banco de dados relacional |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | Geração e validação de tokens JWT |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Hash de senhas |
| [cors](https://github.com/expressjs/cors) | Liberação de requisições cross-origin |
| [dotenv](https://github.com/motdotla/dotenv) | Carregamento de variáveis de ambiente |
| [zod](https://zod.dev/) | Instalado como dependência (ainda não utilizado no código) |

---

## 🏗 Arquitetura e estrutura de pastas

O projeto segue uma arquitetura em camadas: **Rotas → Controllers → Services → Prisma (banco)**.

```
backend/
├── banco de dados modelos/     # Modelagem conceitual/lógica (brModelo) e script SQL inicial
│   ├── banco_conceitual.brM
│   ├── banco_logico.brM
│   └── banco.sql
├── prisma/
│   ├── schema.prisma           # Modelos, enums e relacionamentos
│   └── migrations/             # Histórico de migrations do banco
├── src/
│   ├── app.js                  # Configuração do Express, CORS, rotas e tratamento de erros
│   ├── routes/                 # Definição dos endpoints e middlewares aplicados
│   ├── controllers/            # Recebem a requisição e devolvem a resposta HTTP
│   ├── services/               # Regras de negócio e acesso ao banco via Prisma
│   └── middlewares/
│       ├── authMiddleware.js   # Valida o token JWT (Bearer)
│       └── autorizar.js        # Restringe rotas por perfil (ex.: apenas ADMIN)
├── menu.js                     # Menu interativo de terminal (cliente da API)
├── server.js                   # Ponto de entrada: sobe o servidor HTTP
├── .exemple.env                # Modelo de variáveis de ambiente
└── package.json
```

**Responsabilidades de cada camada**

- **Routes**: mapeiam método + caminho para um controller e definem quais middlewares protegem a rota.
- **Controllers**: extraem dados de `req`, chamam o service e traduzem o resultado/erro em status HTTP.
- **Services**: concentram as validações e regras de negócio e conversam com o banco através do Prisma Client.
- **Middlewares**: autenticação (JWT) e autorização (perfil).

---

## 🗄 Modelo de dados

```
Artista 1 ────< N Show N >──── 1 Local
                    │
                    1
                    │
                    N
Usuario 1 ────< N Ingresso
```

### Entidades

**Artista** (`artista`)

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Int (PK, auto) | coluna `id_art` |
| `nome` | String (50) | coluna `nome_artista` |

**Local** (`local`)

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Int (PK, auto) | coluna `id_local` |
| `nome` | String (50) | coluna `nome_local` |
| `cidade` | String (50) | |
| `capacidade` | Int (opcional) | |

**Show** (`show`)

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Int (PK, auto) | coluna `id_show` |
| `dataHora` | DateTime | coluna `data_hora` |
| `setores` | String (opcional) | descrição dos setores do show |
| `artistaId` | Int (FK) | coluna `id_art` |
| `localId` | Int (FK) | coluna `id_local` |

> Possui restrição **única** `(localId, dataHora)`, garantindo no banco que dois shows não ocupem o mesmo local no mesmo horário.

**Usuario** (`usuario`)

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Int (PK, auto) | coluna `id_usu` |
| `nome` | String (50) | |
| `username` | String (50), único | coluna `nome_unico` |
| `email` | String (50), único | |
| `senha` | String | armazena o **hash** bcrypt (coluna `senha_hash`) |
| `role` | Enum `Role` | `ADMIN` ou `CLIENTE` (padrão: `CLIENTE`) |
| `criadoEm` | DateTime | preenchido automaticamente |

**Ingresso** (`ingresso`)

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Int (PK, auto) | coluna `id_ingresso` |
| `quantidade` | Int | |
| `tipo` | Enum `TipoIngresso` | veja abaixo |
| `usuarioId` | Int (FK) | comprador |
| `showId` | Int (FK) | coluna `id_show`; exclusão em cascata |
| `criadoEm` | DateTime | preenchido automaticamente |

### Enums

- **Role**: `ADMIN`, `CLIENTE`
- **TipoIngresso**: `PISTA`, `VIP`, `CAMAROTE`, `CADEIRA_SUPERIOR`, `CADEIRA_INFERIOR`, `ARQUIBANCADA`

---

## 📏 Regras de negócio

1. **E-mail e username são únicos** — não é possível cadastrar dois usuários com o mesmo valor.
2. **Senhas nunca são salvas em texto puro** — são criptografadas com bcrypt (10 rounds).
3. **Perfil padrão é `CLIENTE`** quando o `role` não é informado ou é inválido.
4. **Conflito de agenda**: não é permitido cadastrar ou editar um show para um local e horário já ocupados por outro show (validado no service e reforçado por índice único no banco).
5. **Data/hora válida**: o campo `dataHora` deve estar em formato reconhecível (ex.: `2026-11-20T21:00:00`); datas inválidas são rejeitadas.
6. **Compra de ingresso**: o show precisa existir e o tipo deve ser um dos valores do enum. O tipo é normalizado automaticamente (`"cadeira superior"` → `CADEIRA_SUPERIOR`).
7. **Exclusão de show** remove em cascata os ingressos vinculados a ele.
8. **Criação, edição e exclusão de shows** são exclusivas do perfil `ADMIN`.

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) **18 ou superior**
- [MySQL](https://dev.mysql.com/downloads/) em execução (local ou remoto)
- npm (já incluso com o Node.js)

---

## 🚀 Instalação e execução

### 1. Clone o repositório e instale as dependências

```bash
git clone <url-do-repositorio>
cd backend
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .exemple.env .env
```

Edite o `.env` (veja a seção [Variáveis de ambiente](#-variáveis-de-ambiente)). **A `DATABASE_URL` deve apontar para o seu MySQL.**

### 3. Crie o banco e rode as migrations

```bash
npx prisma migrate dev
```

Esse comando cria as tabelas no banco e gera o Prisma Client.
Se precisar apenas gerar o client: `npx prisma generate`.

### 4. Inicie a API

```bash
npm start
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`):

```
Servidor de backend rodando na porta 3000
```

### 5. (Opcional) Abra o menu interativo

Em **outro terminal**, com a API em execução:

```bash
node menu.js
```

### 6. (Opcional) Visualize o banco com o Prisma Studio

```bash
npx prisma@5 studio
```

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `PORT` | Porta em que a API será executada | `3000` |
| `DATABASE_URL` | String de conexão com o MySQL | `mysql://usuario:senha@localhost:3306/nome_do_banco` |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT | uma string longa e aleatória |

Exemplo:

```env
PORT=3000
DATABASE_URL="mysql://root:minhasenha@localhost:3306/shows_db"
JWT_SECRET="troque-por-um-segredo-longo-e-aleatorio"
```

> ⚠️ **Nunca versione o arquivo `.env`.** Ele já está listado no `.gitignore`. Use um `JWT_SECRET` forte e exclusivo em produção.

---

## 💻 Menu interativo (CLI)

O arquivo `menu.js` é um cliente de terminal que se comunica com a API em `http://localhost:3000/api`. O menu se adapta ao perfil logado:

| Perfil | Opções disponíveis |
| --- | --- |
| **Não autenticado** | Autenticação (cadastro/login), consultar shows |
| **CLIENTE** | Autenticação, consultar shows, comprar e ver meus ingressos |
| **ADMIN** | Tudo do cliente + gerenciar Artistas, Locais e Shows |

**Fluxo sugerido para o primeiro uso**

1. Suba a API (`npm start`) e abra o menu (`node menu.js`).
2. Em **Autenticação → Cadastrar**, crie um usuário com perfil **ADMIN**.
3. Faça **login** com esse usuário.
4. Cadastre **Artistas** e **Locais**.
5. Cadastre um **Show** informando os IDs de artista e local.
6. Crie (ou use) um usuário **CLIENTE**, faça login e **compre ingressos**.

---

## 📡 Documentação da API

**URL base:** `http://localhost:3000/api`

Rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

Legenda de acesso: 🌐 público · 🔑 requer login · 👑 requer perfil ADMIN

### Autenticação — `/api/auth`

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/api/auth/cadastrar` | 🌐 | Cadastra um novo usuário |
| POST | `/api/auth/login` | 🌐 | Autentica e retorna o token JWT |

**Body — cadastrar**

```json
{
  "nome": "Maria Silva",
  "username": "mariasilva",
  "email": "maria@email.com",
  "senha": "123456",
  "role": "CLIENTE"
}
```

`role` é opcional (`ADMIN` ou `CLIENTE`; padrão `CLIENTE`).

**Body — login** (`login` aceita e-mail **ou** username)

```json
{
  "login": "mariasilva",
  "senha": "123456"
}
```

**Resposta — login (200)**

```json
{
  "usuario": { "id": 1, "nome": "Maria Silva", "username": "mariasilva", "email": "maria@email.com", "role": "CLIENTE" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Artistas — `/api/artistas`

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/artistas` | 🌐 | Lista todos os artistas |
| GET | `/api/artistas/:id` | 🌐 | Busca um artista por ID |
| POST | `/api/artistas` | 🔑 | Cadastra um artista |
| PUT | `/api/artistas/:id` | 🔑 | Atualiza o nome do artista |
| DELETE | `/api/artistas/:id` | 🔑 | Remove um artista |

**Body — criar/atualizar**

```json
{ "nome": "Banda Exemplo" }
```

### Locais — `/api/locais`

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/locais` | 🌐 | Lista todos os locais |
| GET | `/api/locais/:id` | 🌐 | Busca um local por ID |
| POST | `/api/locais` | 🔑 | Cadastra um local |
| PUT | `/api/locais/:id` | 🔑 | Atualiza um local |
| DELETE | `/api/locais/:id` | 🔑 | Remove um local |

**Body — criar/atualizar**

```json
{ "nome": "Arena Central", "cidade": "Florianópolis", "capacidade": 15000 }
```

`nome` e `cidade` são obrigatórios na criação; `capacidade` é opcional.

### Shows — `/api/shows`

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/shows` | 🌐 | Lista shows (com artista e local), ordenados por data |
| GET | `/api/shows/:id` | 🌐 | Busca um show por ID |
| POST | `/api/shows` | 👑 | Cadastra um show |
| PUT | `/api/shows/:id` | 👑 | Atualiza um show |
| DELETE | `/api/shows/:id` | 👑 | Remove um show |

**Body — criar**

```json
{
  "artistaId": 1,
  "localId": 1,
  "dataHora": "2026-11-20T21:00:00",
  "setores": "Pista, VIP, Camarote"
}
```

Na atualização, todos os campos são opcionais (apenas os enviados são alterados).

### Ingressos — `/api/ingressos`

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/api/ingressos/comprar` | 🔑 | Compra ingressos para um show |
| GET | `/api/ingressos/meus-ingressos` | 🔑 | Lista os ingressos do usuário logado |

**Body — comprar**

```json
{
  "showId": 1,
  "tipo": "VIP",
  "quantidade": 2
}
```

Tipos aceitos: `PISTA`, `VIP`, `CAMAROTE`, `CADEIRA_SUPERIOR`, `CADEIRA_INFERIOR`, `ARQUIBANCADA`.

---

## 🧪 Exemplos de uso

Exemplos com `curl`:

**1. Cadastrar um administrador**

```bash
curl -X POST http://localhost:3000/api/auth/cadastrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","username":"admin","email":"admin@email.com","senha":"123456","role":"ADMIN"}'
```

**2. Fazer login e obter o token**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","senha":"123456"}'
```

**3. Cadastrar um artista**

```bash
curl -X POST http://localhost:3000/api/artistas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"nome":"Banda Exemplo"}'
```

**4. Cadastrar um show**

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"artistaId":1,"localId":1,"dataHora":"2026-11-20T21:00:00","setores":"Pista, VIP"}'
```

**5. Comprar um ingresso**

```bash
curl -X POST http://localhost:3000/api/ingressos/comprar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"showId":1,"tipo":"PISTA","quantidade":2}'
```

**6. Ver meus ingressos**

```bash
curl http://localhost:3000/api/ingressos/meus-ingressos \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ⚠️ Códigos de resposta e erros

Todas as respostas de erro seguem o formato:

```json
{ "erro": "Mensagem descritiva do problema." }
```

| Status | Significado |
| --- | --- |
| `200` | Requisição bem-sucedida |
| `201` | Recurso criado com sucesso |
| `400` | Dados inválidos ou violação de regra de negócio |
| `401` | Token ausente, mal formatado, inválido ou expirado |
| `403` | Perfil sem permissão para a ação |
| `404` | Recurso não encontrado |
| `500` | Erro interno do servidor |

---

## 📜 Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia a API (`node server.js`) |
| `npm run db:push` | Sincroniza o schema com o banco sem criar migration (`prisma db push`) |
| `node menu.js` | Abre o menu interativo de terminal |
| `npx prisma migrate dev` | Aplica as migrations e gera o Prisma Client |
| `npx prisma@5 studio` | Abre a interface visual do banco |

---

## 🔧 Observações e melhorias futuras

- Proteger as rotas de **Artistas** e **Locais** com `autorizar(['ADMIN'])`, como já é feito em Shows.
- Impedir que usuários definam o próprio `role` como `ADMIN` no cadastro público (ex.: criar o primeiro admin via seed/script).
- Validar os dados de entrada com **Zod** (já instalado como dependência).
- Controlar a **capacidade** dos locais/estoque de ingressos na compra.
- Padronizar os status HTTP de erro (ex.: 404 em "não encontrado" nas rotas de atualização/remoção).
- Adicionar testes automatizados e documentação Swagger/OpenAPI.
- Atualizar o `banco.sql` e os modelos do brModelo para refletir o schema atual do Prisma.

---