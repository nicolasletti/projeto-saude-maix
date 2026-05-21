e · MD
# Saúde MaiX
 
Sistema web de apoio à triagem clínica para a **Síndrome do X Frágil (SXF)**, desenvolvido como Projeto de Extensão em parceria com a **PUCPR** e o **IBK**.
 
O sistema permite que profissionais de saúde cadastrem pacientes, apliquem um checklist clínico com 12 indicadores validados e obtenham uma recomendação baseada em score ponderado por Random Forest.
 
---
 
## Índice
 
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar](#como-rodar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Git — Comandos Introdutórios](#git--comandos-introdutórios)
- [Padrão de Commits](#padrão-de-commits)
- [Fluxo de Trabalho em Equipe](#fluxo-de-trabalho-em-equipe)
---
 
## Pré-requisitos
 
Antes de começar, certifique-se de ter instalado na sua máquina:
 
| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18.x ou superior | https://nodejs.org |
| npm | 9.x ou superior | (incluído com Node.js) |
| PostgreSQL | 15.x ou superior | https://www.postgresql.org |
| pgAdmin 4 | qualquer | https://www.pgadmin.org |
| Git | 2.x ou superior | https://git-scm.com |
 
---
 
## Instalação
 
**1. Clone o repositório:**
 
```bash
git clone https://github.com/seu-usuario/saude-maix.git
cd saude-maix
```
 
**2. Instale as dependências:**
 
```bash
npm install
```
 
---
 
## Configuração do Banco de Dados
 
**1. Crie o banco no pgAdmin:**
 
```sql
CREATE DATABASE sxf_db;
```
 
**2. Execute o schema para criar as tabelas:**
 
Abra o arquivo `data/database/schema.sql` no pgAdmin (Query Tool) e execute. Isso vai criar o schema `saude_maix`, todas as tabelas e inserir os 12 indicadores clínicos.
 
**3. Crie um usuário administrador para testar o login:**
 
Gere o hash da senha no terminal:
 
```bash
node -e "const b = require('bcrypt'); b.hash('123456', 10).then(h => console.log(h))"
```
 
Copie o hash gerado e execute no pgAdmin:
 
```sql
SELECT setval('saude_maix.profissional_id_profissional_seq',
  (SELECT MAX(id_profissional) FROM saude_maix.profissional));
 
INSERT INTO saude_maix.Profissional
  (nome_completo, cpf, especialidade, telefone, email, num_conselho, login, senha_hash, perfil)
VALUES
  ('Admin', '000.000.000-00', 'Administrador', '(00) 00000-0000',
   'admin@saudemaix.com', 'CRM/PR 00001', 'admin', 'COLE_O_HASH_AQUI', 'Administrador');
```
 
---
 
## Variáveis de Ambiente
 
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
 
```env
PORT=3000
 
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sxf_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
 
JWT_SECRET=uma_frase_longa_e_secreta_aqui
```
 
> ⚠️ **Nunca suba o `.env` para o GitHub.** Ele já está no `.gitignore`.
 
---
 
## Como Rodar
 
**Modo desenvolvimento** (reinicia automaticamente ao salvar):
 
```bash
npm run dev
```
 
**Modo produção:**
 
```bash
npm start
```
 
Acesse no navegador: [http://localhost:3000](http://localhost:3000)
 
---
 
## Estrutura do Projeto
 
```
saude-maix/
│
├── src/
│   ├── backend/
│   │   ├── controllers/       # Recebe as requisições HTTP
│   │   │   ├── logar.js
│   │   │   ├── logado.js      # Middleware de autenticação JWT
│   │   │   └── deslogar.js
│   │   ├── models/            # Queries SQL
│   │   │   ├── pacienteModel.js
│   │   │   └── avaliacaoModel.js
│   │   ├── routes/            # Define as URLs da API
│   │   │   ├── pacienteRoutes.js
│   │   │   └── avaliacaoRoutes.js
│   │   ├── utils/
│   │   │   └── db.js          # Conexão com o PostgreSQL
│   │   └── server.js          # Ponto de entrada do backend
│   │
│   ├── core/
│   │   └── scoreCalculator.js # Lógica do score ponderado (12 sintomas)
│   │
│   └── frontend/
│       ├── pages/
│       │   ├── login/
│       │   ├── triagem/
│       │   ├── checklist/
│       │   ├── relatorio/
│       │   └── register/
│       └── public/
│           ├── css/
│           ├── js/
│           └── img/
│
├── data/
│   ├── database/
│   │   └── schema.sql         # Script de criação das tabelas
│   ├── dump/
│   │   └── dump.py            # Gerador de dados fictícios
│   └── seeds/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── docs/
│   ├── arquitetura.md
│   └── requisitos.md
│
├── .env                       # Variáveis de ambiente (não sobe pro GitHub)
├── .gitignore
├── package.json
└── README.md
```
 
---
 
## Git — Comandos Introdutórios
 
### Configuração inicial (só uma vez)
 
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```
 
### Clonar o repositório
 
```bash
git clone https://github.com/seu-usuario/saude-maix.git
```
 
### Ver o estado atual dos arquivos
 
```bash
git status
```
 
### Baixar as últimas alterações do repositório
 
```bash
git pull origin main
```
 
> Faça isso **sempre** antes de começar a trabalhar para evitar conflitos.
 
### Criar uma branch para sua tarefa
 
```bash
git checkout -b feat/nome-da-funcionalidade
```
 
Exemplos:
```bash
git checkout -b feat/tela-checklist
git checkout -b fix/calculo-score
git checkout -b docs/atualizar-readme
```
 
### Adicionar arquivos para o commit
 
```bash
# Adicionar tudo
git add .
 
# Adicionar uma pasta específica
git add src/frontend/pages/checklist/
 
# Adicionar um arquivo específico
git add src/backend/controllers/logar.js
```
 
### Criar um commit
 
```bash
git commit -m "feat: descrição do que foi feito"
```
 
### Enviar sua branch para o GitHub
 
```bash
git push origin feat/nome-da-funcionalidade
```
 
### Ver o histórico de commits
 
```bash
git log --oneline
```
 
### Voltar para a branch principal
 
```bash
git checkout main
```
 
---
 
## Padrão de Commits
 
Este projeto usa o padrão **Conventional Commits**. Toda mensagem de commit deve seguir o formato:
 
```
tipo: descrição curta no imperativo
```
 
### Tipos disponíveis
 
| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat: adicionar checklist de sintomas` |
| `fix` | Correção de bug | `fix: corrigir cálculo do score feminino` |
| `style` | Alteração visual, CSS | `style: ajustar cores do formulário de login` |
| `refactor` | Refatoração sem mudar comportamento | `refactor: extrair lógica do score para core` |
| `docs` | Documentação | `docs: atualizar README com instruções de banco` |
| `chore` | Configuração, dependências | `chore: adicionar bcrypt ao package.json` |
| `test` | Adição ou correção de testes | `test: adicionar teste unitário do scoreCalculator` |
 
### Exemplos de commits
 
```bash
git commit -m "feat: implementar rota POST /api/avaliacoes"
git commit -m "fix: corrigir varchar(15) do campo telefone no schema"
git commit -m "style: padronizar layout das páginas com CSS compartilhado"
git commit -m "chore: atualizar .gitignore para Node.js"
git commit -m "docs: adicionar diagrama de arquitetura"
```
 
### O que evitar
 
```bash
# ❌ Vago demais
git commit -m "ajustes"
git commit -m "correções"
git commit -m "update"
 
# ✅ Descritivo e rastreável
git commit -m "fix: remover campo senha do retorno da API de login"
```
 
---
 
## Fluxo de Trabalho em Equipe
 
```
1. git pull origin main           # Atualiza sua máquina
 
2. git checkout -b feat/tarefa    # Cria sua branch
 
3. (desenvolve e testa)
 
4. git add .                      # Adiciona os arquivos
   git commit -m "feat: ..."      # Cria o commit
 
5. git push origin feat/tarefa    # Sobe para o GitHub
 
6. Abre um Pull Request no GitHub para revisão
 
7. Após aprovação, merge na main
```
 
> ⚠️ **Nunca faça commit diretamente na branch `main`.** Sempre trabalhe em uma branch separada e abra um Pull Request.
 
---
 
## Equipe
 
Projeto de Extensão — PUCPR × IBK  
Disciplina: Métodos e Modelos Formais
 
---
