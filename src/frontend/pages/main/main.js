const PANE_META = {
  novo:  { title: 'Novo Paciente',   sub: 'Preencha os dados para cadastrar um paciente' },
  lista: { title: 'Meus Pacientes',  sub: 'Gerencie os pacientes cadastrados' },
};

function showPane(paneId) {
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-pane]').forEach(n => n.classList.remove('active'));

  document.getElementById('pane-' + paneId)?.classList.add('active');
  document.querySelector(`.nav-item[data-pane="${paneId}"]`)?.classList.add('active');

  const meta = PANE_META[paneId];
  if (meta) {
    document.getElementById('topbar-title').textContent = meta.title;
    document.getElementById('topbar-sub').textContent   = meta.sub;
  }
}

function showToast(msg, tipo = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${tipo}`;
  setTimeout(() => { toast.className = 'toast'; }, 4000);
}

function limparForm() {
  document.getElementById('form-paciente').reset();
  trocarResponsavel();
}

function mascaraCPF(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function mascaraTelefone(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2)  return `(${d}`;
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

/* === RESPONSÁVEL: 2 estados (vinculado / novo) === */
const PARENTESCO_LABEL = { pai: 'Pai', mae: 'Mãe', tutor: 'Tutor', outro: 'Outro' };

// Guarda os dados do responsável já cadastrado quando há um vinculado; null = novo.
let respVinculado = null;
let ultimoCpfBuscado = '';

function setRespStatus(msg, tipo = '') {
  const el = document.getElementById('resp-status');
  el.textContent = msg;
  el.className = 'field-hint' + (tipo ? ' ' + tipo : '');
}

function mostrarRespVinculado(resp) {
  respVinculado = resp;
  document.getElementById('resp-vinc-nome').textContent = resp.nome_completo;
  document.getElementById('resp-vinc-meta').textContent =
    `${PARENTESCO_LABEL[resp.grau_parentesco] || resp.grau_parentesco} · ${resp.telefone}`;
  document.getElementById('resp-vinculado').hidden = false;
  document.getElementById('resp-novo').hidden = true;
  document.getElementById('resp-cpf').setAttribute('readonly', '');
  setRespStatus('Responsável já cadastrado — os dados serão reaproveitados.', 'success');
}

function mostrarRespNovo() {
  respVinculado = null;
  document.getElementById('resp-vinculado').hidden = true;
  document.getElementById('resp-novo').hidden = false;
  setRespStatus('Responsável novo — preencha os dados abaixo.', '');
}

function trocarResponsavel() {
  respVinculado = null;
  ultimoCpfBuscado = '';
  document.getElementById('resp-vinculado').hidden = true;
  document.getElementById('resp-novo').hidden = true;
  document.getElementById('resp-novo')
    .querySelectorAll('input, select').forEach(el => { el.value = ''; });
  const cpf = document.getElementById('resp-cpf');
  cpf.removeAttribute('readonly');
  cpf.value = '';
  setRespStatus('Digite o CPF para localizar um responsável já cadastrado.', '');
}

// Disparada automaticamente quando o CPF chega a 11 dígitos.
async function buscarResponsavel() {
  const cpf = document.getElementById('resp-cpf').value.replace(/\D/g, '');
  if (cpf.length !== 11 || cpf === ultimoCpfBuscado) return;
  ultimoCpfBuscado = cpf;

  setRespStatus('Buscando responsável...', '');
  try {
    const res = await fetch(`/api/responsaveis?cpf=${cpf}`);
    if (res.status === 404) { mostrarRespNovo(); return; }
    if (!res.ok) { setRespStatus('Erro ao buscar responsável.', 'error'); return; }
    mostrarRespVinculado(await res.json());
  } catch {
    setRespStatus('Erro de conexão ao buscar responsável.', 'error');
  }
}

async function cadastrarPaciente() {
  const pac = {
    nome:       document.getElementById('pac-nome').value.trim(),
    cpf:        document.getElementById('pac-cpf').value.trim(),
    nascimento: document.getElementById('pac-nascimento').value,
    sexo:       document.getElementById('pac-sexo').value,
    endereco:   document.getElementById('pac-endereco').value.trim(),
  };
  if (!pac.nome || !pac.cpf || !pac.nascimento || !pac.sexo) {
    showToast('Preencha todos os campos obrigatórios do paciente.', 'error');
    return;
  }

  // Responsável: um já cadastrado (respVinculado) ou os campos do "novo".
  const cpfResp = document.getElementById('resp-cpf').value.trim();
  let resp;
  if (respVinculado) {
    resp = {
      cpf:        cpfResp,
      nome:       respVinculado.nome_completo,
      parentesco: respVinculado.grau_parentesco,
      telefone:   respVinculado.telefone,
    };
  } else {
    resp = {
      cpf:        cpfResp,
      nome:       document.getElementById('resp-nome').value.trim(),
      parentesco: document.getElementById('resp-parentesco').value,
      telefone:   document.getElementById('resp-telefone').value.trim(),
    };
    if (!resp.cpf || !resp.nome || !resp.parentesco || !resp.telefone) {
      showToast('Preencha todos os campos obrigatórios do responsável.', 'error');
      return;
    }
  }

  try {
    const res = await fetch('/api/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pac, resp }),
    });
    const json = await res.json();

    if (res.ok) {
      showToast('Paciente cadastrado com sucesso!', 'success');
      limparForm();
      showPane('lista');
      carregarPacientes();
    } else {
      showToast(json.erro || 'Erro ao cadastrar paciente.', 'error');
    }
  } catch {
    showToast('Erro de conexão com o servidor.', 'error');
  }
}

async function carregarPacientes() {
  const tbody = document.getElementById('tabela-pacientes');

  try {
    const res  = await fetch('/api/pacientes');
    const json = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6"><div class="empty-state"><p>Erro ao carregar pacientes</p></div></td></tr>`;
      return;
    }

    const pacientes = json.pacientes;

    if (pacientes.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">
            <div class="empty-state">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>Nenhum paciente encontrado</p>
              <span>Cadastre um novo paciente para começar</span>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = pacientes.map((p, i) => {
      const nascimento = new Date(p.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      const sexo = p.sexo_biologico === 'M' ? 'Masculino' : 'Feminino';
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${p.nome_completo}</td>
          <td>${nascimento}</td>
          <td>${sexo}</td>
          <td>${p.nome_responsavel}</td>
          <td><button class="btn-secondary btn-sm" onclick="window.location.href='/pages/triagem/triagem.html?id=${p.id_paciente}'">Triagem</button></td>
        </tr>`;
    }).join('');
  } catch {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6"><div class="empty-state"><p>Erro de conexão com o servidor</p></div></td></tr>`;
  }
}

function buscarPacientes() {
  const termo = document.getElementById('busca-input').value.toLowerCase();
  document.querySelectorAll('#tabela-pacientes tr:not(.empty-row)').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(termo) ? '' : 'none';
  });
}

function deslogar() {
  window.location.href = '/api/users/deslogar';
}

/* === INICIALIZAÇÃO === */
document.addEventListener('DOMContentLoaded', () => {
  // Navegação na sidebar
  document.querySelectorAll('.nav-item[data-pane]').forEach(btn => {
    btn.addEventListener('click', () => showPane(btn.dataset.pane));
  });

  document.querySelectorAll('.nav-item[data-href]').forEach(btn => {
    btn.addEventListener('click', () => window.location.href = btn.dataset.href);
  });

  // Botões do formulário
  document.getElementById('btn-trocar-resp')?.addEventListener('click', trocarResponsavel);
  document.getElementById('btn-cadastrar')?.addEventListener('click', cadastrarPaciente);
  document.getElementById('btn-limpar')?.addEventListener('click', limparForm);
  document.getElementById('btn-atualizar')?.addEventListener('click', carregarPacientes);
  document.getElementById('btn-sair')?.addEventListener('click', deslogar);

  document.getElementById('busca-input')?.addEventListener('input', buscarPacientes);

  // Máscaras de formatação
  ['pac-cpf', 'resp-cpf'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      e.target.value = mascaraCPF(e.target.value);
    });
  });
  document.getElementById('resp-telefone')?.addEventListener('input', e => {
    e.target.value = mascaraTelefone(e.target.value);
  });

  // Busca automática do responsável quando o CPF fica completo (11 dígitos)
  document.getElementById('resp-cpf')?.addEventListener('input', buscarResponsavel);

  carregarPacientes();
});
