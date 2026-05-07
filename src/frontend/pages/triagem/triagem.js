function EnviarTriagem() {
    const form = document.getElementById('triagem-form');
    const formData = new FormData(form);
    
    const paciente_nome = formData.get('paciente_nome');
    const sexo = formData.get('paciente_sexo');

    if (!paciente_nome || !sexo) {
        alert("Preencha os dados obrigatórios do paciente e o sexo biológico.");
        return;
    }
    
    // Pesos definidos nas Regras RN02 e RN03
    const pesosHomem = { 'atraso_fala': 0.14, 'face_alongada': 0.29, 'hiperatividade': 0.12, 'evita_contato': 0.06 };
    const pesosMulher = { 'atraso_fala': 0.01, 'face_alongada': 0.09, 'hiperatividade': 0.04, 'evita_contato': 0.08 };

    let scoreFinal = 0;
    const pesosAtuais = (sexo === 'M') ? pesosHomem : pesosMulher;

    // Calcula a pontuação baseada nos checkboxes marcados
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach((cb) => {
        if (pesosAtuais[cb.value]) {
            scoreFinal += pesosAtuais[cb.value];
        }
    });

    // Limiares de decisão (Regra RN04)
    const limite = (sexo === 'M') ? 0.56 : 0.55;

    console.log("Dados capturados. Score calculado:", scoreFinal);

    // Validação visual simples antes de integrar com o back-end
    if (scoreFinal >= limite) {
        alert("Pontuação: " + scoreFinal.toFixed(2) + "\nAlerta: Recomendado encaminhamento para teste genético FMR1.");
    } else {
        alert("Pontuação: " + scoreFinal.toFixed(2) + "\nResultado: Probabilidade clínica abaixo do limiar de risco.");
    }
}