let pacientesNaMemoria = [];

// Único ponto de entrada — garante que o DOM já existe antes de registrar eventos
document.addEventListener('DOMContentLoaded', () => {
    carregarPacientes();
    document.getElementById('busca_paciente').addEventListener('change', preencherSexoAutomatico);
});

// ─── Carregamento dos pacientes ──────────────────────────────────────────────

async function carregarPacientes() {
    const dataListPaciente = document.getElementById('lista_pacientes');

    try {
        const resposta = await fetch('/api/pacientes');
        const dados = await resposta.json();

        if (resposta.ok) {
            // Armazena em memória para uso no preenchimento automático de sexo
            pacientesNaMemoria = dados.pacientes;

            dataListPaciente.innerHTML = '';
            dados.pacientes.forEach(paciente => {
                const opcao = document.createElement('option');
                opcao.value = paciente.nome_completo;   // apenas o nome, sem ID
                dataListPaciente.appendChild(opcao);
            });
        }
    } catch (erro) {
        console.error('Erro ao carregar lista de pacientes:', erro);
    }
}

// ─── Preenchimento automático de sexo ────────────────────────────────────────

function preencherSexoAutomatico() {
    const nomeBusca = document.getElementById('busca_paciente').value.trim();
    const pacienteEncontrado = pacientesNaMemoria.find(p => p.nome_completo === nomeBusca);
    const campoSexo = document.getElementById('sexo');
    const campoIdOculto = document.getElementById('paciente_id_selecionado');

    if (pacienteEncontrado) {
        campoIdOculto.value = pacienteEncontrado.id_paciente;
        const sexoBio = pacienteEncontrado.sexo_biologico;
        if (sexoBio === 'M' || sexoBio === 'Masculino') {
            campoSexo.value = 'M';
        } else if (sexoBio === 'F' || sexoBio === 'Feminino') {
            campoSexo.value = 'F';
        }
    } else {
        campoIdOculto.value = '';
        campoSexo.value = '';
    }

    // Oculta/exibe campos dependentes do sexo
    ajustarCamposPorSexo();
}

// ─── Ajuste de campos por sexo (global, chamada também pelo onchange do select)

function ajustarCamposPorSexo() {
    const sexo = document.getElementById('sexo').value;

    // Macroorquidismo — apenas para masculino
    const divMacro = document.getElementById('div_macroorquidismo');
    const checkboxMacro = document.getElementById('macroorquidismo');
    if (divMacro) {
        if (sexo === 'F') {
            divMacro.style.display = 'none';
            if (checkboxMacro) checkboxMacro.checked = false;
        } else {
            divMacro.style.display = '';
        }
    }

    // Pergunta de infertilidade/menopausa precoce — apenas para feminino
    const perguntaInfertilidade = document.getElementById('pergunta_infertilidade');
    if (perguntaInfertilidade) {
        if (sexo === 'F') {
            perguntaInfertilidade.classList.remove('oculto');
        } else {
            perguntaInfertilidade.classList.add('oculto');
        }
    }
}

// ─── Processamento da triagem ─────────────────────────────────────────────────

async function processarTriagem() {
    const idPacienteSelecionado = document.getElementById('paciente_id_selecionado').value;
    const sexoSelecionado = document.getElementById('sexo').value;

    if (!idPacienteSelecionado || isNaN(idPacienteSelecionado)) {
        alert("Por favor, selecione um paciente válido da lista.");
        return;
    }
    if (!sexoSelecionado) {
        alert("Erro: O sexo do paciente não foi carregado. Selecione o paciente novamente.");
        return;
    }

    const checkboxesSintomas = document.querySelectorAll('#lista-sintomas input[type="checkbox"]:checked');
    const sintomasArray = Array.from(checkboxesSintomas).map(cb => cb.value);
    const observacoesLivres = document.getElementById('outros_problemas').value;

    const dadosParaServidor = {
        id_paciente: parseInt(idPacienteSelecionado),
        sexo: sexoSelecionado,
        sintomas: sintomasArray,
        observacoes: observacoesLivres
    };

    try {
        const resposta = await fetch('/api/triagem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaServidor)
        });

        const respostaDoBackend = await resposta.json();

        if (!resposta.ok) {
            alert('Erro: ' + respostaDoBackend.erro);
            return;
        }

        const resultado = respostaDoBackend.resultadoCalculado;

        localStorage.setItem('relatorioSaudeMaix', JSON.stringify({
            score: resultado.score,
            percentual: resultado.percentual,
            limiar: resultado.limiar,
            nivelDeRisco: resultado.nivelDeRisco,
            sexo: sexoSelecionado,
            observacoes: observacoesLivres
        }));

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
                            Recomendação: Avaliação clínica detalhada. Exame genético FMR1 recomendado.<br><br>`;
        } else {
            divResultado.className = 'alerta-alto';
            conteudoHTML = `<strong>PROBABILIDADE CLÍNICA: ALTA</strong><br><br>
                            Score do Paciente: <strong>${resultado.score}</strong><br>
                            Compatibilidade: <strong>${resultado.percentual}%</strong><br><br>
                            Recomendação: Encaminhamento imediato para especialista. Exame genético FMR1 altamente recomendado.<br><br>`;
        }

        divResultado.innerHTML = conteudoHTML;

        const btnVoltar = document.createElement('button');
        btnVoltar.textContent = 'Voltar para a Página Principal';
        btnVoltar.onclick = () => window.location.href = '/pages/main/main.html';
        divResultado.appendChild(btnVoltar);

    } catch (erro) {
        alert('Erro de conexão: ' + erro.message);
    }
}