const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path       = require('path');
require('dotenv').config();

const logar   = require('./controllers/logar');
const logado  = require('./controllers/logado');
const deslogar = require('./controllers/deslogado');

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

// Rotas de autenticação
app.post('/api/users/logar',   logar);
app.get('/api/users/deslogar', deslogar);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor online na porta ${process.env.PORT || 3000}`);
});