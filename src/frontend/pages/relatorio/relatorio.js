const RISCO_CLASSE = { 'Alto': 'alto', 'Médio': 'medio', 'Leve': 'leve' };

function classeRisco(nivel) {
  return RISCO_CLASSE[nivel] || 'leve';
}

async function carregarRelatorios() {
  const tbody = document.getElementById('tabela-relatorios');

  try {
    const res  = await fetch('/api/relatorios');
    const json = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6"><div class="empty-state"><p>Erro ao carregar relatórios</p></div></td></tr>`;
      return;
    }

    const relatorios = json.relatorios;

    if (relatorios.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">
            <div class="empty-state">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
                <line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
              <p>Nenhum relatório encontrado</p>
              <span>Realize uma triagem para gerar relatórios</span>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = relatorios.map((r, i) => {
      const data = r.data_hora
        ? new Date(r.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        : '—';
      const sexo = r.sexo_biologico === 'M' ? 'Masculino' : 'Feminino';
      const classe = classeRisco(r.nivelDeRisco);
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${r.nome_completo}</td>
          <td>${sexo}</td>
          <td>${data}</td>
          <td><span class="badge-risco ${classe}">${r.nivelDeRisco || '—'}</span></td>
          <td><button class="btn-secondary btn-sm" onclick="window.location.href='visualizar.html?id=${r.id_relatorio}'">Relatório</button></td>
        </tr>`;
    }).join('');
  } catch {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6"><div class="empty-state"><p>Erro de conexão com o servidor</p></div></td></tr>`;
  }
}

function buscarRelatorios() {
  const termo = document.getElementById('busca-input').value.toLowerCase();
  document.querySelectorAll('#tabela-relatorios tr:not(.empty-row)').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(termo) ? '' : 'none';
  });
}

// Aplica a foto (data URL) no avatar, ou a inicial como fallback.
function aplicarAvatar(el, foto, inicial) {
  if (!el) return;
  if (foto) el.innerHTML = `<img src="${foto}" alt="Foto de perfil">`;
  else el.textContent = inicial;
}

function deslogar() {
  window.location.href = '/api/users/deslogar';
}

/* === INICIALIZAÇÃO === */
document.addEventListener('DOMContentLoaded', () => {
  // Navegação na sidebar
  document.querySelectorAll('.nav-item[data-href]').forEach(btn => {
    btn.addEventListener('click', () => window.location.href = btn.dataset.href);
  });

  document.getElementById('btn-atualizar')?.addEventListener('click', carregarRelatorios);
  document.getElementById('busca-input')?.addEventListener('input', buscarRelatorios);
  document.getElementById('btn-sair')?.addEventListener('click', deslogar);

  // Clique no card do usuário redireciona para perfil
  document.getElementById('user-card-perfil')?.addEventListener('click', (e) => {
    if (e.target.closest('#btn-sair')) return;
    window.location.href = '/pages/perfil_profissional/perfil.html';
  });

  // Carrega nome e perfil do usuário logado na sidebar
  fetch('/api/users/usuario-logado')
    .then(r => r.json())
    .then(u => {
      document.getElementById('user-nome').textContent  = u.nome;
      document.getElementById('user-perfil').textContent = u.perfil || '—';
      aplicarAvatar(document.getElementById('avatar-inicial'), u.foto, u.nome?.charAt(0).toUpperCase() || 'A');
    })
    .catch(() => {});

  carregarRelatorios();
});
