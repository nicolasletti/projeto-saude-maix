function Entrar() {
    const form = document.getElementById('login-form');
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const senha = formData.get('senha');

    if(email && senha) {
        // Futuramente: requisição POST para o Node.js validar no banco
        console.log("Preparando para autenticar:", email);
        
        // Redirecionamento provisório para a tela de triagem
        window.location.href = '../triagem/triagem.html';
    } else {
        alert("Por favor, preencha o email profissional e a senha.");
    }
}