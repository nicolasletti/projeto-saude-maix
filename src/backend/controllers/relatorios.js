const db = require('../utils/db');

// Limiar de corte por sexo (mesmos valores de core/scoreCalculator.js).
function limiarPorSexo(sexo) {
  return sexo === 'M' ? 0.56 : 0.55;
}

// Classifica o nível de risco a partir do score/percentual já persistidos,
// seguindo a mesma regra de core/scoreCalculator.js. Mais robusto do que
// depender do texto livre em `alertas`.
function classificarRisco(sexo, score, percentual) {
  const s = parseFloat(score);
  const p = parseFloat(percentual);
  if (isNaN(s) || s < limiarPorSexo(sexo)) return 'Leve';
  if (!isNaN(p) && p < 75) return 'Médio';
  return 'Alto';
}

// Extrai apenas as observações livres do campo `alertas`, gravado em
// salvarTriagem.js como "<nivel>" ou "<nivel> | Obs: <observacoes>".
function extrairObservacoes(alertas) {
  const texto = (alertas || '').trim();
  const sep = ' | Obs: ';
  const idx = texto.indexOf(sep);
  return idx === -1 ? '' : texto.slice(idx + sep.length).trim();
}

// GET /api/relatorios — um relatório (o mais recente) por paciente.
async function listar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT id_paciente, nome_completo, sexo_biologico,
              id_relatorio, percentual, score_final, alertas, data_hora
       FROM (
         SELECT DISTINCT ON (p.id_paciente)
                p.id_paciente, p.nome_completo, p.sexo_biologico,
                r.id_relatorio, r.percentual, r.score_final, r.alertas, t.data_hora
         FROM saude_maix.Paciente p
         JOIN saude_maix.Triagem  t ON t.id_paciente = p.id_paciente
         JOIN saude_maix.Relatorio r ON r.id_triagem = t.id_triagem
         ORDER BY p.id_paciente, t.data_hora DESC
       ) ult
       ORDER BY nome_completo`
    );

    const relatorios = resultado.rows.map((row) => ({
      id_relatorio:   row.id_relatorio,
      id_paciente:    row.id_paciente,
      nome_completo:  row.nome_completo,
      sexo_biologico: row.sexo_biologico,
      data_hora:      row.data_hora,
      nivelDeRisco:   classificarRisco(row.sexo_biologico, row.score_final, row.percentual),
    }));

    return res.status(200).json({ relatorios });
  } catch (err) {
    console.error('Erro ao listar relatórios:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// GET /api/relatorios/:id — detalhe de um relatório para o visualizador.
async function buscar(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) {
    return res.status(400).json({ erro: 'ID de relatório inválido.' });
  }

  try {
    const resultado = await db.query(
      `SELECT p.nome_completo, p.sexo_biologico,
              r.id_relatorio, r.percentual, r.score_final, r.alertas, t.data_hora
       FROM saude_maix.Relatorio r
       JOIN saude_maix.Triagem  t ON r.id_triagem = t.id_triagem
       JOIN saude_maix.Paciente p ON t.id_paciente = p.id_paciente
       WHERE r.id_relatorio = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Relatório não encontrado.' });
    }

    const row = resultado.rows[0];

    return res.status(200).json({
      nome_completo: row.nome_completo,
      sexo:          row.sexo_biologico,
      score:         row.score_final,
      percentual:    row.percentual,
      limiar:        limiarPorSexo(row.sexo_biologico),
      nivelDeRisco:  classificarRisco(row.sexo_biologico, row.score_final, row.percentual),
      observacoes:   extrairObservacoes(row.alertas),
      data_hora:     row.data_hora,
    });
  } catch (err) {
    console.error('Erro ao buscar relatório:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { listar, buscar };
