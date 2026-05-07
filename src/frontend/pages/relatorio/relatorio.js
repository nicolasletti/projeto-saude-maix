function FiltrarPeriodo() {
    const form = document.getElementById('filtro-form');
    const dataInicio = form.elements['data_inicio'].value;
    const dataFim = form.elements['data_fim'].value;

    if(dataInicio && dataFim) {
        // Futuramente: Node.js fará queries SQL com cláusula BETWEEN para puxar as estatísticas
        console.log("Solicitando relatório do período:", dataInicio, "até", dataFim);
        alert("Atualizando estatísticas no painel...");
    } else {
        alert("Selecione as datas de início e fim para aplicar o filtro.");
    }
}