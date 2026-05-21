function deslogar(req, res) {
  res.clearCookie('token');
  return res.status(200).json({ mensagem: 'Logout realizado com sucesso.' });
}

module.exports = deslogar;