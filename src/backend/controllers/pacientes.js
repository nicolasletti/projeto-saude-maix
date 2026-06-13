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

async function buscar(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID de paciente inválido.' });
  try {
    const r = await db.query(
      `SELECT p.id_paciente, p.nome_completo, p.cpf, p.data_nascimento,
              p.sexo_biologico, p.endereco
       FROM saude_maix.Paciente p
       WHERE p.id_paciente = $1`,
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
    return res.status(200).json(r.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar paciente:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

async function atualizar(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID de paciente inválido.' });

  const { pac } = req.body;
  if (!pac?.nome || !pac?.cpf || !pac?.nascimento || !pac?.sexo) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios do paciente.' });
  }
  pac.cpf = normalizarCPF(pac.cpf);

  try {
    const r = await db.query(
      `UPDATE saude_maix.Paciente
          SET nome_completo = $1, cpf = $2, data_nascimento = $3,
              sexo_biologico = $4, endereco = $5
        WHERE id_paciente = $6
        RETURNING id_paciente`,
      [pac.nome, pac.cpf, pac.nascimento, pac.sexo, pac.endereco || null, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
    return res.status(200).json({ mensagem: 'Paciente atualizado com sucesso!' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CPF já cadastrado para outro paciente.' });
    }
    console.error('Erro ao atualizar paciente:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

async function excluir(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID de paciente inválido.' });

  try {
    const historico = await db.query(
      'SELECT 1 FROM saude_maix.Triagem WHERE id_paciente = $1 LIMIT 1',
      [id]
    );
    if (historico.rows.length > 0) {
      return res.status(409).json({
        erro: 'Não é possível excluir: o paciente possui triagens/relatórios no histórico.'
      });
    }

    const r = await db.query(
      'DELETE FROM saude_maix.Paciente WHERE id_paciente = $1 RETURNING id_paciente',
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
    return res.status(200).json({ mensagem: 'Paciente excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir paciente:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { cadastrar, listar, buscarResponsavel, buscar, atualizar, excluir };
