async function carregarPerfilProfissional() {
  try {
    // Busca apenas os dados do profissional conectado
    const resposta = await fetch('/api/users/usuario-logado');

    if (!resposta.ok) {
      console.error('Profissional não autenticado');
      return;
    }

    const usuario = await resposta.json();

    // Preenche o card principal (foto, nome, cargo, email)
    document.getElementById('nome-profissional').textContent = usuario.nome;
    document.getElementById('perfil-profissional').textContent = usuario.perfil || 'Profissional';
    document.getElementById('email-profissional').textContent = usuario.email;

    // Preenche a tabela de dados profissionais abaixo
    document.getElementById('nome-dado').textContent = usuario.nome;
    document.getElementById('cargo-dado').textContent = usuario.perfil || 'Não informado';
    document.getElementById('email-dado').textContent = usuario.email;

    // Se o profissional tiver um registro ou conselho (ex: CRM, CRP), exibe aqui
    if (usuario.registro) {
      document.getElementById('registro-dado').textContent = usuario.registro;
    }

  } catch (erro) {
    console.error('Erro ao carregar dados do profissional:', erro);
  }
}

// Executa assim que a página abre
document.addEventListener('DOMContentLoaded', carregarPerfilProfissional);