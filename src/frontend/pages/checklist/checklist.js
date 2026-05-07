function BuscarPaciente() {
    const busca = document.querySelector('input[name="busca_paciente"]').value;
    
    if(busca) {
        // Futuramente: requisição GET para o Node.js buscar no PostgreSQL
        console.log("Enviando requisição de busca para o CPF/Nome:", busca);
        alert("Buscando dados no servidor...");
    } else {
        alert("Digite um nome ou CPF para localizar a ficha de pré-triagem.");
    }
}

function GerarRelatorioRisco() {
    const form = document.getElementById('checklist-form');
    const formData = new FormData(form);
    
    const conduta = formData.get('conduta_medica');
    
    if(conduta) {
        // Futuramente: requisição POST para o Node.js salvar a avaliação final
        console.log("Dados médicos prontos para inserção no banco.");
        alert("Avaliação médica e conduta salvas com sucesso.");
    } else {
        alert("Por favor, registre a conduta clínica adotada.");
    }
}