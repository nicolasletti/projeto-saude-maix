# Saúde MaiX — Guia para Claude Code

Sistema web de triagem clínica para Síndrome do X Frágil (SXF).
Projeto de Extensão: PUCPR × IBK.

## Comandos essenciais

```bash
npm run dev   # Inicia com nodemon (porta 3000, auto-reload)
npm start     # Produção sem auto-reload

# Criar hash de senha para testes
node -e "const b = require('bcrypt'); b.hash('123456', 10).then(h => console.log(h))"
```

Acesso: http://localhost:3000

## Variáveis de ambiente (.env — não commitado)

`PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`

## Arquitetura

**Backend:** Express.js — `src/backend/server.js`, porta 3000
- Serve o frontend estático de `src/frontend/`
- 3 rotas implementadas: `GET /`, `POST /api/users/logar`, `GET /api/users/deslogar`
- Autenticação: bcrypt + JWT com cookie httpOnly (8h de expiração)
- Middleware de auth: `src/backend/controllers/logado.js`

**Banco:** PostgreSQL — schema `saude_maix`
- `Profissional` — profissional de saúde que faz login
- `Paciente` + `Responsavel` — dados do paciente e responsável
- `Indicador_Clinico` — 12 indicadores com pesos distintos por sexo (M/F)
- `Triagem` + `Indicador_Triagem` — sessão de triagem e indicadores marcados
- `Relatorio` + `Prontuario` — score final e histórico

**Score:** ponderação linear dos indicadores por sexo — `src/core/scoreCalculator.js` (ainda não implementado)

**Frontend:** Vanilla JS + CSS puro (sem framework)
- Cada página tem trio `.html`/`.js`/`.css` em `src/frontend/pages/<nome>/`
- Tema claro/escuro via classe CSS no `body` (toggle em `login.js`)

## Status das páginas frontend

| Página      | HTML | JS     | CSS | Status       |
|-------------|------|--------|-----|--------------|
| `login/`    | ok   | ok     | ok  | Funcional    |
| `main/`     | ok   | vazio  | ok  | Estrutura só |
| `triagem/`  | ok   | vazio  | ok  | Estrutura só |
| `checklist/`| ok   | vazio  | ok  | Estrutura só |
| `relatorio/`| ok   | vazio  | ok  | Estrutura só |

## Estrutura resumida

```
src/backend/
  server.js           # Entry point, rotas principais
  controllers/        # logar.js, logado.js (middleware JWT), deslogado.js
  models/             # (vazio — queries SQL aqui)
  routes/             # (vazio — rotas da API aqui)
  services/           # (vazio — lógica de negócio aqui)
  utils/db.js         # Pool de conexão PostgreSQL

src/core/
  scoreCalculator.js  # (vazio — cálculo do score ponderado dos 12 indicadores)

src/frontend/pages/
  login/              # Autenticação
  main/               # Dashboard de gerenciamento de pacientes
  triagem/            # Formulário de triagem
  checklist/          # Checklist dos 12 indicadores clínicos
  relatorio/          # Geração e exibição do relatório

data/database/schema.sql   # Script completo do banco com 12 indicadores pré-inseridos
data/dump/dump.py          # Gera CSVs com dados fictícios (Faker): 50 responsáveis,
                           # 100 pacientes, 20 profissionais, 150+ triagens
```

## Convenções

- **Commits:** Conventional Commits em português (`feat`/`fix`/`style`/`refactor`/`docs`/`chore`/`test`)
- **Branches:** nunca commitar direto na `main` — usar `feat/*` ou `fix/*`
- **Nomes:** arquivos e variáveis em português (ex: `logar.js`, `profissional`, `triagem`)
- **Segredos:** nunca subir `.env` — já está no `.gitignore`

## Pendências conhecidas

1. `login.js` redireciona para `/pages/principal/principal.html` — caminho errado, deveria ser `/pages/main/main.html`
2. `main.js`, `triagem.js`, `checklist.js`, `relatorio.js` estão vazios
3. `src/core/scoreCalculator.js` sem implementação
4. Backend sem rotas de paciente/triagem/relatório (`controllers/models/routes/services` vazios)
5. Testes não configurados (`tests/` existe mas está vazia)
6. `docs/arquitetura.md` e `docs/requisitos.md` praticamente vazios
