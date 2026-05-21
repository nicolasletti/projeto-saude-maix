const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcrypt');
const database = require('../utils/db');

async function logar(req, res) {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Busca o profissional pelo e-mail ou login na tabela do PostgreSQL
    const resultado = await database.query(
      `SELECT id_profissional, nome_completo, email, login, senha_hash, perfil
       FROM saude_maix.Profissional
       WHERE email = $1 OR login = $1`,
      [email]
    );

    // Usuário não encontrado
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const profissional = resultado.rows[0];

    // Compara a senha com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, profissional.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    // Gera o token JWT com os dados do profissional
    const token = jwt.sign(
      {
        id:    profissional.id_profissional,
        nome:  profissional.nome_completo,
        email: profissional.email,
        perfil: profissional.perfil,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Envia o token como cookie seguro
    res.cookie('token', token, { httpOnly: true });
    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      nome: profissional.nome_completo,
      perfil: profissional.perfil,
    });

  } catch (err) {
    console.error('Erro ao logar:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = logar;