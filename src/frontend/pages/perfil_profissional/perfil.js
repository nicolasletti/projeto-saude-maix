document.addEventListener('DOMContentLoaded', async () => {
  // Botão sair
  document.getElementById('btn-sair')?.addEventListener('click', () => {
    window.location.href = '/api/users/deslogar';
  });

  try {
    const resposta = await fetch('/api/users/usuario-logado');

    if (!resposta.ok) {
      window.location.href = '/pages/login/login.html';
      return;
    }

    const u = await resposta.json();
    const inicial = u.nome?.charAt(0).toUpperCase() || '?';

    // Sidebar
    document.getElementById('avatar-inicial').textContent  = inicial;
    document.getElementById('user-nome').textContent       = u.nome;
    document.getElementById('user-perfil').textContent     = u.perfil || '—';

    // Card avatar
    document.getElementById('avatar-grande').textContent  = inicial;
    document.getElementById('perfil-nome').textContent    = u.nome;
    document.getElementById('perfil-cargo').textContent   = u.perfil || 'Profissional';
    document.getElementById('perfil-email-sub').textContent = u.email;

    // Dados profissionais
    document.getElementById('dado-nome').textContent    = u.nome;
    document.getElementById('dado-cargo').textContent   = u.perfil || 'Não informado';
    document.getElementById('dado-email').textContent   = u.email;

    if (u.registro) {
      document.getElementById('dado-registro').textContent = u.registro;
    }

  } catch (erro) {
    console.error('Erro ao carregar perfil:', erro);
  }
});