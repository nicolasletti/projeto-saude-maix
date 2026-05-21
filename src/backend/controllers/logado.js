const jwt = require('jsonwebtoken');

// Middleware — verifica se o usuário está logado antes de liberar a rota
function logado(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Faça login.' });
  }

  try {
    // Verifica e decodifica o token
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = dados; // disponibiliza os dados do profissional na rota
    next();              // libera para a próxima função da rota
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = logado;