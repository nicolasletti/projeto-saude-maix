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

function TrocadeTema() {
  
  const body = document.body;
  
  
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  body.classList.toggle('light');

  if (body.classList.contains("light")) {
    sunIcon.style.display = "none";
    moonIcon.style.display = "inline";
  } else {
    sunIcon.style.display = "inline";
    moonIcon.style.display = "none";
  }

}