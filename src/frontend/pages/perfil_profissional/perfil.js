// Aplica a foto (data URL) num elemento de avatar, ou a inicial como fallback.
function aplicarAvatar(el, foto, inicial) {
  if (!el) return;
  if (foto) {
    el.innerHTML = `<img src="${foto}" alt="Foto de perfil">`;
  } else {
    el.textContent = inicial;
  }
}

// Redimensiona/recorta a imagem para um quadrado `size`x`size` (JPEG) e
// devolve um data URL pequeno, pronto para salvar.
function redimensionar(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Recorte central (cover).
        const lado = Math.min(img.width, img.height);
        const sx = (img.width - lado) / 2;
        const sy = (img.height - lado) / 2;
        ctx.drawImage(img, sx, sy, lado, lado, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

let inicialAtual = '?';

function mostrarBotaoRemover(visivel) {
  const btn = document.getElementById('btn-remover-foto');
  if (btn) btn.hidden = !visivel;
}

async function enviarFoto(foto) {
  const res = await fetch('/api/users/foto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foto }),
  });
  return res;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Botão sair
  document.getElementById('btn-sair')?.addEventListener('click', () => {
    window.location.href = '/api/users/deslogar';
  });

  const inputFoto = document.getElementById('input-foto');

  // Abrir seletor de arquivo
  document.getElementById('btn-alterar-foto')?.addEventListener('click', () => {
    inputFoto?.click();
  });

  // Selecionou um arquivo → redimensiona e envia
  inputFoto?.addEventListener('change', async () => {
    const file = inputFoto.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem.');
      inputFoto.value = '';
      return;
    }
    try {
      const foto = await redimensionar(file, 256);
      const res = await enviarFoto(foto);
      if (res.ok) {
        aplicarAvatar(document.getElementById('avatar-grande'), foto, inicialAtual);
        aplicarAvatar(document.getElementById('avatar-inicial'), foto, inicialAtual);
        mostrarBotaoRemover(true);
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.erro || 'Não foi possível salvar a foto.');
      }
    } catch {
      alert('Erro ao processar a imagem.');
    } finally {
      inputFoto.value = '';
    }
  });

  // Remover foto
  document.getElementById('btn-remover-foto')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/users/foto', { method: 'DELETE' });
      if (res.ok) {
        aplicarAvatar(document.getElementById('avatar-grande'), null, inicialAtual);
        aplicarAvatar(document.getElementById('avatar-inicial'), null, inicialAtual);
        mostrarBotaoRemover(false);
      }
    } catch {
      alert('Erro ao remover a foto.');
    }
  });

  try {
    const resposta = await fetch('/api/users/usuario-logado');

    if (!resposta.ok) {
      window.location.href = '/pages/login/login.html';
      return;
    }

    const u = await resposta.json();
    inicialAtual = u.nome?.charAt(0).toUpperCase() || '?';

    // Sidebar
    aplicarAvatar(document.getElementById('avatar-inicial'), u.foto, inicialAtual);
    document.getElementById('user-nome').textContent   = u.nome;
    document.getElementById('user-perfil').textContent = u.perfil || '—';

    // Card avatar
    aplicarAvatar(document.getElementById('avatar-grande'), u.foto, inicialAtual);
    document.getElementById('perfil-nome').textContent      = u.nome;
    document.getElementById('perfil-cargo').textContent     = u.perfil || 'Profissional';
    document.getElementById('perfil-email-sub').textContent = u.email;
    mostrarBotaoRemover(!!u.foto);

    // Dados profissionais
    document.getElementById('dado-nome').textContent  = u.nome;
    document.getElementById('dado-cargo').textContent = u.perfil || 'Não informado';
    document.getElementById('dado-email').textContent = u.email;

    if (u.registro) {
      document.getElementById('dado-registro').textContent = u.registro;
    }

  } catch (erro) {
    console.error('Erro ao carregar perfil:', erro);
  }
});
