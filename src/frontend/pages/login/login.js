async function Entrar() {
  const email = document.querySelector('input[name="email"]').value;
  const senha = document.querySelector('input[name="senha"]').value;

  if (!email || !senha) {
    alert('Preencha o e-mail e a senha.');
    return;
  }

  const resposta = await fetch('/api/users/logar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const dados = await resposta.json();

  if (resposta.ok) {
    window.location.href = '/pages/triagem/triagem.html';
  } else {
    alert(dados.erro);
  }
}