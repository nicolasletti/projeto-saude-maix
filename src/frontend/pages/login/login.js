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
    window.location.href = '/pages/main/main.html';
  } else {
    alert(dados.erro);
  }
}

function TrocadeTema() {
  const body     = document.body;
  const sunIcon  = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  body.classList.toggle('dark');

  if (body.classList.contains('dark')) {
    sunIcon.style.display  = 'inline';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display  = 'none';
    moonIcon.style.display = 'inline';
  }
}

function TogglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('togglePassword');
  
  if (passwordInput.type === 'password') {

    passwordInput.type = 'text';
    toggleIcon.src = '../img/visibility_off_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
    toggleIcon.alt = 'Ocultar senha';
  } else {
    passwordInput.type = 'password';
    toggleIcon.src = '../img/visibility_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
    toggleIcon.alt = 'Mostrar senha';
  }
}