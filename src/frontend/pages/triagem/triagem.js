function mostrarAnexo(checkboxId, anexoId) {
    const checkbox = document.getElementById(checkboxId);
    const divAnexo = document.getElementById(anexoId);
    
    if (checkbox.checked) {
        divAnexo.classList.remove('oculto');
    } else {
        divAnexo.classList.add('oculto');
        divAnexo.querySelector('input[type="file"]').value = ""; 
    }
}


function ajustarCamposPorSexo() {
    const sexo = document.getElementById('sexo').value;
    const perguntaInfertilidade = document.getElementById('pergunta_infertilidade');
    const divMacroorquidismo = document.getElementById('div_macroorquidismo');
    const anexoMacro = document.getElementById('anexo_macro');
    const checkboxMacro = document.getElementById('macroorquidismo');

    if (sexo === 'F') {

        perguntaInfertilidade.classList.remove('oculto');
        divMacroorquidismo.classList.add('oculto');
        anexoMacro.classList.add('oculto');
        checkboxMacro.checked = false;
    } else {

        perguntaInfertilidade.classList.add('oculto');
        document.getElementById('infertilidade').checked = false;
        divMacroorquidismo.classList.remove('oculto');
    }
}


function calcularRisco(sexo, sintomasPresentes) {
    const pesosMasculino = {
        deficiencia_intelectual: 0.32, face_alongada: 0.29, macroorquidismo: 0.26, hipermobilidade: 0.19,
        dificuldade_aprendizagem: 0.18, deficit_atencao: 0.17, movimentos_repetitivos: 0.17, atraso_fala: 0.14,
        hiperatividade: 0.12, evita_contato_visual: 0.06, evita_contato_fisico: 0.04, agressividade: 0.01
    };

    const pesosFeminino = {
        dificuldade_aprendizagem: 0.28, deficiencia_intelectual: 0.20, deficit_atencao: 0.12, face_alongada: 0.09,
        evita_contato_visual: 0.08, evita_contato_fisico: 0.07, movimentos_repetitivos: 0.05, hipermobilidade: 0.04,
        hiperatividade: 0.04, agressividade: 0.02, atraso_fala: 0.01
    };

    const pesos = sexo === 'M' ? pesosMasculino : pesosFeminino;
    let scoreFinal = 0;

    for (let i = 0; i < sintomasPresentes.length; i++) {
        const sintoma = sintomasPresentes[i];
        if (pesos[sintoma]) {
            scoreFinal += pesos[sintoma];
        }
    }

    scoreFinal = parseFloat(scoreFinal.toFixed(2));
    const limiarDeCorte = sexo === 'M' ? 0.56 : 0.55;
    const encaminharParaExame = scoreFinal >= limiarDeCorte;

    return { score: scoreFinal, limiar: limiarDeCorte, encaminhar: encaminharParaExame };
}

/**
 * Função acionada ao clicar no botão "Calcular Risco"
 */
function processarTriagem() {
    const sexoSelecionado = document.getElementById('sexo').value;
    
    // Coleta os sintomas pontuados
    const checkboxesSintomas = document.querySelectorAll('#lista-sintomas input[type="checkbox"]:checked');
    const sintomasArray = Array.from(checkboxesSintomas).map(cb => cb.value);

    // Coleta os dados complementares (para salvar no banco depois com Node.js)
    const probRenais = document.getElementById('problemas_renais').checked;
    const infertilidade = document.getElementById('infertilidade').checked;
    const observacoesLivres = document.getElementById('outros_problemas').value;

    // Calcula apenas com os sintomas oficiais
    const resultado = calcularRisco(sexoSelecionado, sintomasArray);

    // Exibe o relatório na tela
    const divResultado = document.getElementById('resultado');
    divResultado.style.display = 'block';
    
    if (resultado.encaminhar) {
        divResultado.className = 'alerta-alto';
        divResultado.innerHTML = `<strong>ALERTA DE ALTO RISCO</strong><br><br>
                                  Score do Paciente: <strong>${resultado.score}</strong> (Limiar: ${resultado.limiar})<br><br>
                                  Recomendação: Indicado solicitar Exame Genético de DNA (FMR1).`;
    } else {
        divResultado.className = 'alerta-baixo';
        divResultado.innerHTML = `<strong>BAIXA PROBABILIDADE CLÍNICA</strong><br><br>
                                  Score do Paciente: <strong>${resultado.score}</strong> (Limiar: ${resultado.limiar})<br><br>
                                  Recomendação: Acompanhamento padrão. Exame genético não prioritário no momento.`;
    }

    // No futuro, aqui você enviaria 'resultado', 'probRenais', 'infertilidade' e 'observacoesLivres' via fetch/API para o PostgreSQL
}