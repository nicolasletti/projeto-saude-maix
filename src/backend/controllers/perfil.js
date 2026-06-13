const db = require('../utils/db');

// Limite defensivo para o data URL da foto (~2 MB de base64).
const TAMANHO_MAX_FOTO = 3_000_000;

// GET /api/users/usuario-logado — dados do JWT + foto/registro do banco.
async function usuarioLogado(req, res) {
  const base = {
    nome:   req.usuario.nome,
    email:  req.usuario.email,
    perfil: req.usuario.perfil,
  };
  try {
    const r = await db.query(
      'SELECT foto, num_conselho FROM saude_maix.Profissional WHERE id_profissional = $1',
      [req.usuario.id]
    );
    const row = r.rows[0] || {};
    return res.json({ ...base, foto: row.foto || null, registro: row.num_conselho || null });
  } catch (err) {
    console.error('Erro ao carregar usuário logado:', err.message);
    // Fallback: ainda devolve os dados do token, sem foto.
    return res.json({ ...base, foto: null, registro: null });
  }
}

// POST /api/users/foto — salva a foto (data URL base64) do profissional logado.
async function salvarFoto(req, res) {
  const { foto } = req.body;

  if (typeof foto !== 'string' || !foto.startsWith('data:image/')) {
    return res.status(400).json({ erro: 'Envie uma imagem válida.' });
  }
  if (foto.length > TAMANHO_MAX_FOTO) {
    return res.status(413).json({ erro: 'Imagem muito grande. Tente uma menor.' });
  }

  try {
    await db.query(
      'UPDATE saude_maix.Profissional SET foto = $1 WHERE id_profissional = $2',
      [foto, req.usuario.id]
    );
    return res.status(200).json({ mensagem: 'Foto atualizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar foto:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// DELETE /api/users/foto — remove a foto do profissional logado.
async function removerFoto(req, res) {
  try {
    await db.query(
      'UPDATE saude_maix.Profissional SET foto = NULL WHERE id_profissional = $1',
      [req.usuario.id]
    );
    return res.status(200).json({ mensagem: 'Foto removida.' });
  } catch (err) {
    console.error('Erro ao remover foto:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { usuarioLogado, salvarFoto, removerFoto };
