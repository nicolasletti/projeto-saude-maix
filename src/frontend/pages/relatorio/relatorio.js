/* ============================================================
   relatorio.js — Lê o localStorage da triagem e monta o relatório
   ============================================================ */

const RISK_CONFIG = {
  'Alto': {
    classe:    'alto',
    icon:      '⚠️',
    titulo:    'Probabilidade Clínica Alta',
    desc:      'O perfil sintomatológico do paciente apresenta alta compatibilidade com a Síndrome do X Frágil. O encaminhamento imediato para um geneticista e a realização do exame molecular FMR1 são fortemente indicados.',
    rec:       '<strong>Encaminhamento imediato</strong> para especialista em genética médica. Realização do <strong>exame molecular FMR1</strong> altamente recomendada. Iniciar acompanhamento multidisciplinar assim que possível.',
    barColor:  '#e03131',
  },
  'Médio': {
    classe:    'medio',
    icon:      '🔔',
    titulo:    'Probabilidade Clínica Média',
    desc:      'O paciente apresenta indicadores clínicos que ultrapassam o limiar de corte estabelecido para o sexo. Uma avaliação clínica mais detalhada e o exame genético FMR1 são recomendados.',
    rec:       'Realizar <strong>avaliação clínica aprofundada</strong>. Solicitar o <strong>exame genético FMR1</strong>. Monitorar evolução dos indicadores em consultas de acompanhamento.',
    barColor:  '#d97706',
  },
  'Leve': {
    classe:    'leve',
    icon:      '✅',
    titulo:    'Probabilidade Clínica Leve',
    desc:      'O perfil do paciente não atingiu o limiar de corte para o sexo biológico declarado. O exame genético FMR1 não é recomendado no momento, mas o acompanhamento clínico regular deve ser mantido.',
    rec:       'Manter <strong>acompanhamento clínico padrão</strong>. Exame genético FMR1 <strong>não recomendado</strong> no momento. Reavaliar se novos indicadores surgirem.',
    barColor:  '#1aae39',
  },
};

/* ── Utilidades ──────────────────────────────────────────── */

function formatarData(d) {
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatarSexo(s) {
  return s === 'M' ? 'Masculino' : s === 'F' ? 'Feminino' : s;
}

/* ── Gráfico de gauge com Chart.js ───────────────────────── */

function desenharGauge(percentual, cor) {
  const ctx = document.getElementById('gaugeChart').getContext('2d');

  /* Doughnut cortado na metade (semiciclo) */
  const val     = Math.min(Math.max(percentual, 0), 100);
  const restante = 100 - val;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [val, restante, 100],            // preenchido | vazio | semiciclo oculto
        backgroundColor: [cor, '#e5e3df', 'transparent'],
        borderColor:     ['transparent', 'transparent', 'transparent'],
        borderWidth:     0,
        circumference:   180,
        rotation:        270,
      }]
    },
    options: {
      responsive:  true,
      cutout:      '72%',
      plugins: {
        legend:  { display: false },
        tooltip: { enabled: false },
      },
      animation: {
        animateRotate: true,
        duration:      900,
        easing:        'easeOutQuart',
      },
    },
    plugins: [{
      id: 'gaugeLabel',
      afterDraw(chart) {
        const { ctx: c, width, height } = chart;
        const centerX = width  / 2;
        const centerY = (height / 2) + 30;   /* Empurra para baixo do semiciclo */

        c.save();
        c.textAlign    = 'center';
        c.textBaseline = 'middle';
        c.font         = `700 38px Inter, sans-serif`;
        c.fillStyle    = cor;
        c.fillText(`${val}%`, centerX, centerY - 10);

        c.font      = `500 13px Inter, sans-serif`;
        c.fillStyle = '#a4a097';
        c.fillText('Compatibilidade clínica', centerX, centerY + 28);
        c.restore();
      }
    }]
  });
}

/* ── Renderização principal ──────────────────────────────── */

function renderizarRelatorio(dados) {
  const cfg = RISK_CONFIG[dados.nivelDeRisco] || RISK_CONFIG['Leve'];

  /* Banner de risco */
  const banner = document.getElementById('risk-banner');
  banner.classList.add(cfg.classe);
  document.getElementById('risk-icon').textContent  = cfg.icon;
  document.getElementById('risk-title').textContent = cfg.titulo;
  document.getElementById('risk-desc').textContent  = cfg.desc;

  /* Scores */
  document.getElementById('score-val').textContent     = dados.score;
  document.getElementById('percentual-val').textContent = dados.percentual + '%';
  document.getElementById('limiar-val').textContent    = dados.limiar;
  document.getElementById('sexo-val').textContent      = formatarSexo(dados.sexo);

  /* Gráfico */
  desenharGauge(dados.percentual, cfg.barColor);

  /* Recomendação */
  document.getElementById('rec-dot').classList.add(cfg.classe);
  document.getElementById('rec-text').innerHTML = cfg.rec;

  /* Observações */
  const obsBox = document.getElementById('obs-box');
  if (dados.observacoes && dados.observacoes.trim()) {
    obsBox.textContent = dados.observacoes.trim();
  } else {
    obsBox.innerHTML = '<span class="obs-empty">Nenhuma observação registrada.</span>';
  }

  /* Rodapé com data/hora */
  const agora = new Date();
  document.getElementById('report-footer').textContent =
    `Relatório gerado em ${formatarData(agora)} · Saúde MaiX`;
}

/* ── Ponto de entrada ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('relatorioSaudeMaix');

  if (!raw) {
    document.getElementById('error-state').style.display  = 'flex';
    document.getElementById('report-state').style.display = 'none';
    return;
  }

  try {
    const dados = JSON.parse(raw);
    document.getElementById('error-state').style.display  = 'none';
    document.getElementById('report-state').style.display = 'block';
    renderizarRelatorio(dados);
  } catch (e) {
    document.getElementById('error-state').style.display  = 'flex';
    document.getElementById('report-state').style.display = 'none';
  }
});