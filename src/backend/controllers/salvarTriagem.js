const database = require('../utils/db');
const calcularRisco = require('../../core/scoreCalculator');

async function salvarTriagem(req, res) {
  const { id_paciente, sexo, sintomas, observacoes } = req.body;
  const id_profissional = req.usuario.id;

  if (!id_paciente || !sexo || !sintomas) {
    return res.status(400).json({ erro: 'Dados da triagem incompletos.' });
  }

  try {
    const resultado = calcularRisco(sexo, sintomas);
    const queryTriagem = `
      INSERT INTO saude_maix.Triagem (id_paciente, id_profissional)
      VALUES ($1, $2) RETURNING id_triagem
    `;
    const dbTriagem = await database.query(queryTriagem, [id_paciente, id_profissional]);
    const id_triagem = dbTriagem.rows[0].id_triagem;

    const alertas = observacoes
      ? `${resultado.nivelDeRisco} | Obs: ${observacoes}`
      : resultado.nivelDeRisco;

    const queryRelatorio = `
      INSERT INTO saude_maix.Relatorio (id_triagem, percentual, score_final, alertas)
      VALUES ($1, $2, $3, $4)
    `;
    await database.query(queryRelatorio, [id_triagem, resultado.percentual, resultado.score, alertas]);

    return res.status(201).json({
      mensagem: 'Triagem processada e salva com sucesso!',
      resultadoCalculado: resultado
    });

  } catch (err) {
    console.error('Erro ao salvar triagem:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados.' });
  }
}

module.exports = salvarTriagem;