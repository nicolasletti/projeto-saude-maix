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
    
    let scoreMaximo = 0;
    for (let chave in pesos) {
        scoreMaximo += pesos[chave];
    }

    let scoreFinal = 0;
    for (let i = 0; i < sintomasPresentes.length; i++) {
        const sintoma = sintomasPresentes[i];
        if (pesos[sintoma]) {
            scoreFinal += pesos[sintoma];
        }
    }
    scoreFinal = parseFloat(scoreFinal.toFixed(2));

    let percentual = (scoreFinal / scoreMaximo) * 100;
    percentual = parseFloat(percentual.toFixed(1));

    const limiarDeCorte = sexo === 'M' ? 0.56 : 0.55;
    const atingiuLimiar = scoreFinal >= limiarDeCorte;

    let nivelDeRisco = "";
    let encaminharParaExame = false;

    if (!atingiuLimiar) {
        nivelDeRisco = "Leve";
        encaminharParaExame = false;
    } else if (atingiuLimiar && percentual < 75) { 
        nivelDeRisco = "Médio";
        encaminharParaExame = true;
    } else {
        nivelDeRisco = "Alto";
        encaminharParaExame = true;
    }

    return { 
        score: scoreFinal, 
        percentual: percentual,
        limiar: limiarDeCorte, 
        encaminhar: encaminharParaExame,
        nivelDeRisco: nivelDeRisco
    };

    if (typeof module !== 'undefined' && module.exports) {
    module.exports = calcularRisco;}
}
module.exports = calcularRisco;  