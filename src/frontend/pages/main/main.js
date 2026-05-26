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
}

function cadastrarPaciente() {
  // TODO: chamada à API POST /api/pacientes
  console.log('cadastrarPaciente() — aguardando backend');
}

function carregarPacientes() {
  // TODO: chamada à API GET /api/pacientes
  console.log('carregarPacientes() — aguardando backend');
}

function buscarPacientes() {
  // TODO: filtrar tabela ou chamar API com query
  const termo = document.getElementById('busca-input').value;
  console.log('buscarPacientes():', termo);
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
  document.getElementById('btn-cadastrar')?.addEventListener('click', cadastrarPaciente);
  document.getElementById('btn-limpar')?.addEventListener('click', limparForm);
  document.getElementById('btn-atualizar')?.addEventListener('click', carregarPacientes);
  document.getElementById('btn-sair')?.addEventListener('click', deslogar);

  document.getElementById('busca-input')?.addEventListener('input', buscarPacientes);
});
