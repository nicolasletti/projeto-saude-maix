const db = require('../utils/db');

const normalizarCPF = (cpf) => cpf.replace(/\D/g, '');

async function cadastrar(req, res) {
  const { pac, resp } = req.body;

  if (!pac?.nome || !pac?.cpf || !pac?.nascimento || !pac?.sexo ||
      !resp?.nome || !resp?.cpf || !resp?.parentesco || !resp?.telefone) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  pac.cpf  = normalizarCPF(pac.cpf);
  resp.cpf = normalizarCPF(resp.cpf);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Se o responsável já existe pelo CPF, reutiliza sem sobrescrever os dados dele
    let id_responsavel;
    const respExistente = await client.query(
      'SELECT id_responsavel FROM saude_maix.Responsavel WHERE cpf = $1',
      [resp.cpf]
    );
    if (respExistente.rows.length > 0) {
      id_responsavel = respExistente.rows[0].id_responsavel;
    } else {
      const r = await client.query(
        `INSERT INTO saude_maix.Responsavel (nome_completo, cpf, grau_parentesco, telefone)
         VALUES ($1, $2, $3, $4) RETURNING id_responsavel`,
        [resp.nome, resp.cpf, resp.parentesco, resp.telefone]
      );
      id_responsavel = r.rows[0].id_responsavel;
    }

    const existente = await client.query(
      'SELECT nome_completo FROM saude_maix.Paciente WHERE cpf = $1',
      [pac.cpf]
    );
    if (existente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        erro: `CPF ${pac.cpf} já está cadastrado para o paciente "${existente.rows[0].nome_completo}".`
      });
    }

    const p = await client.query(
      `INSERT INTO saude_maix.Paciente (id_responsavel, nome_completo, cpf, data_nascimento, sexo_biologico, endereco)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_paciente`,
      [id_responsavel, pac.nome, pac.cpf, pac.nascimento, pac.sexo, pac.endereco || null]
    );

    await client.query('COMMIT');
    return res.status(201).json({ id_paciente: p.rows[0].id_paciente });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CPF do paciente já cadastrado no sistema.' });
    }
    console.error('Erro ao cadastrar paciente:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
}

async function buscarResponsavel(req, res) {
  const cpf = normalizarCPF(req.query.cpf || '');
  if (!cpf) return res.status(400).json({ erro: 'CPF obrigatório.' });
  try {
    const r = await db.query(
      'SELECT nome_completo, grau_parentesco, telefone FROM saude_maix.Responsavel WHERE cpf = $1',
      [cpf]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Responsável não encontrado.' });
    return res.status(200).json(r.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar responsável:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

async function listar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT p.id_paciente, p.nome_completo, p.data_nascimento, p.sexo_biologico,
              r.nome_completo AS nome_responsavel
       FROM saude_maix.Paciente p
       JOIN saude_maix.Responsavel r ON p.id_responsavel = r.id_responsavel
       ORDER BY p.nome_completo`
    );
    return res.status(200).json({ pacientes: resultado.rows });
  } catch (err) {
    console.error('Erro ao listar pacientes:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { cadastrar, listar, buscarResponsavel };
