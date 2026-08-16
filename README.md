# Projeto Saúde MaiX
 
Sistema web de apoio à triagem clínica para a **Síndrome do X Frágil (SXF)**, desenvolvido como Projeto de Extensão em parceria com a **PUCPR** e o **IBK**.
 
O sistema permite que profissionais de saúde cadastrem pacientes, apliquem um checklist clínico com 12 indicadores validados e obtenham uma recomendação baseada em score ponderado por Random Forest.
 
---

link do vídeo mostrando o sistema funcionando:
https://youtu.be/sDMBUjlPSm4

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
git clone https://github.com/nicolasletti/saude-maix.git
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
│   │   ├── routes/            # Define as URLs da API
│   │   │   ├── pa
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
git clone https://github.com/nicolasletti/saude-maix.git
```

---
 
## Equipe
 
Projeto de Extensão — PUCPR × IBK  
 
---
