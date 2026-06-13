const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path       = require('path');
require('dotenv').config();

const logar    = require('./controllers/logar');
const logado   = require('./controllers/logado');
const deslogar = require('./controllers/deslogado');
const { cadastrar, listar, buscarResponsavel } = require('./controllers/pacientes');
const salvarTriagem = require('./controllers/salvarTriagem');
const { listar: listarRelatorios, buscar: buscarRelatorio } = require('./controllers/relatorios');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Serve os arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../src/frontend')));

// Página de login (pública)
app.get('/', (req, res) => {
  res.redirect('/pages/login/login.html');
});

// Área protegida — só entra quem está logado
app.get('/privado', logado, (req, res) => {
  res.send(`Bem-vindo, ${req.usuario.nome}!`);
});

// Retorna os dados do usuário logado
app.get('/api/users/usuario-logado', logado, (req, res) => {
  res.json({
    nome: req.usuario.nome,
    email: req.usuario.email,
    perfil: req.usuario.perfil
  });
});

// Rotas de autenticação
app.post('/api/users/logar',   logar);
app.get('/api/users/deslogar', deslogar);
app.post('/api/triagem', logado, salvarTriagem);

// Rotas de pacientes (protegidas)
app.post('/api/pacientes',     logado, cadastrar);
app.get('/api/pacientes',      logado, listar);
app.get('/api/responsaveis',   logado, buscarResponsavel);

// Rotas de relatórios (protegidas)
app.get('/api/relatorios',     logado, listarRelatorios);
app.get('/api/relatorios/:id', logado, buscarRelatorio);

// Rota de diagnóstico temporária — lista responsáveis sem paciente vinculado
app.get('/api/debug/responsaveis-orfaos', logado, async (req, res) => {
  try {
    const db = require('./utils/db');
    const r = await db.query(`
      SELECT r.id_responsavel, r.nome_completo, r.cpf
      FROM saude_maix.Responsavel r
      LEFT JOIN saude_maix.Paciente p ON p.id_responsavel = r.id_responsavel
      WHERE p.id_paciente IS NULL
    `);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor online na porta ${process.env.PORT || 3000}`);
});
