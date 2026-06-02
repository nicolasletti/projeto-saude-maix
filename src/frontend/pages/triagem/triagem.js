function ajustarCamposPorSexo() {
    const sexo = document.getElementById('sexo').value;
    const perguntaInfertilidade = document.getElementById('pergunta_infertilidade');
    const divMacroorquidismo = document.getElementById('div_macroorquidismo');
    const checkboxMacro = document.getElementById('macroorquidismo');
    if (sexo === 'F') {
        perguntaInfertilidade.classList.remove('oculto');
        divMacroorquidismo.classList.add('oculto');
        checkboxMacro.checked = false;
    } else {
        perguntaInfertilidade.classList.add('oculto');
        document.getElementById('infertilidade').checked = false;
        divMacroorquidismo.classList.remove('oculto');
    }
}
function processarTriagem() {
    const sexoSelecionado = document.getElementById('sexo').value;
    const checkboxesSintomas = document.querySelectorAll('#lista-sintomas input[type="checkbox"]:checked');
    const sintomasArray = Array.from(checkboxesSintomas).map(cb => cb.value);
    const probRenais = document.getElementById('problemas_renais').checked;
    const infertilidade = document.getElementById('infertilidade').checked;
    const observacoesLivres = document.getElementById('outros_problemas').value;
    const resultado = calcularRisco(sexoSelecionado, sintomasArray);
    const dadosParaRelatorio = {
        score: resultado.score,
        percentual: resultado.percentual,
        limiar: resultado.limiar,
        nivelDeRisco: resultado.nivelDeRisco,
        sexo: sexoSelecionado,
        observacoes: observacoesLivres
    };
    localStorage.setItem('relatorioSaudeMaix', JSON.stringify(dadosParaRelatorio));

    const divResultado = document.getElementById('resultado');
    divResultado.style.display = 'block';
    document.getElementById('btn-calcular').style.display = 'none';
    
    let conteudoHTML = "";

    if (resultado.nivelDeRisco === "Leve") {
        divResultado.className = 'alerta-baixo';
        conteudoHTML = `<strong>PROBABILIDADE CLÍNICA: LEVE</strong><br><br>
                        Score do Paciente: <strong>${resultado.score}</strong><br>
                        Compatibilidade: <strong>${resultado.percentual}%</strong><br><br>
                        Recomendação: Acompanhamento padrão. Exame genético FMR1 <strong>NÃO</strong> recomendado no momento.<br><br>`;
                                  
    } else if (resultado.nivelDeRisco === "Médio") {
        divResultado.className = 'alerta-medio';
        conteudoHTML = `<strong>PROBABILIDADE CLÍNICA: MÉDIA</strong><br><br>
                        Score do Paciente: <strong>${resultado.score}</strong><br>
                        Compatibilidade: <strong>${resultado.percentual}%</strong><br><br>
                        Recomendação: Indicado solicitar Exame Genético de DNA (FMR1) para investigação.<br><br>`;
                                  
    } else {
        divResultado.className = 'alerta-alto';
        conteudoHTML = `<strong>PROBABILIDADE CLÍNICA: ALTA</strong><br><br>
                        Score do Paciente: <strong>${resultado.score}</strong><br>
                        Compatibilidade: <strong>${resultado.percentual}%</strong><br><br>
                        Recomendação: <strong>Fortemente indicado</strong> solicitar Exame Genético de DNA (FMR1).<br><br>`;
    }

    conteudoHTML += `<button onclick="confirmarEVoltar()" style="margin-top: 15px; width: 100%; background-color: var(--charcoal); color: white; height: 44px; border: none; border-radius: 8px; font-family: var(--font); font-weight: 500; cursor: pointer; transition: background 0.3s;">
                        Confirmar Relatório e Voltar ao Painel
                     </button>`;

    divResultado.innerHTML = conteudoHTML;
}

function confirmarEVoltar() {
    alert("Relatório gerado e salvo com sucesso no prontuário!");
    window.location.href = "../main/main.html"; 
}