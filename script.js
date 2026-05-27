/* ── RELÓGIO ── */
function atualizarRelogio() {
    const now = new Date();
    document.getElementById('clock-mini').textContent =
        now.toLocaleTimeString('pt-BR', { hour12: false });
}
atualizarRelogio();
setInterval(atualizarRelogio, 1000);

/* ── TEMA ── */
const btnTema = document.getElementById('btn-tema');
const htmlEl = document.documentElement;
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo) htmlEl.setAttribute('data-theme', temaSalvo);
btnTema.addEventListener('click', () => {
    const novoTema = (htmlEl.getAttribute('data-theme') === 'light') ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', novoTema);
    localStorage.setItem('tema', novoTema);
});

/* ── ZEN ── */
const btnZen = document.getElementById('btn-zen');
btnZen.addEventListener('click', () => {
    document.body.classList.toggle('zen-active');
    btnZen.textContent = document.body.classList.contains('zen-active') ? '⊞ Sair' : '⊡ Zen';
});

/* ══════════════════════════════════════
    NOTAS
══════════════════════════════════════ */
const notasContainer = document.getElementById('notas-container');
let dragSrcNota = null;

function salvarNotas() {
    const notas = [];
    notasContainer.querySelectorAll('.nota-card').forEach(card => {
        notas.push({
            titulo: card.querySelector('.nota-titulo').value,
            texto: card.querySelector('.nota-texto').value,
            cor: card.querySelector('input[type="color"]').value
        });
    });
    localStorage.setItem('notas_cards', JSON.stringify(notas));
}

function adicionarNota(dados = null) {
    const card = document.createElement('div');
    card.classList.add('nota-card');
    card.setAttribute('draggable', 'true');

    // Header
    const header = document.createElement('div');
    header.classList.add('nota-header');

    const titulo = document.createElement('input');
    titulo.type = 'text';
    titulo.classList.add('nota-titulo');
    titulo.placeholder = 'Sem título...';
    if (dados) titulo.value = dados.titulo || '';
    titulo.addEventListener('input', salvarNotas);

    const headerActions = document.createElement('div');
    headerActions.classList.add('nota-header-actions');

    // Color swatch
    const swatch = document.createElement('div');
    swatch.classList.add('nota-color-swatch');
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = dados ? dados.cor : '#58a6ff';
    swatch.style.background = colorPicker.value;
    swatch.title = 'Cor do card';
    swatch.appendChild(colorPicker);
    colorPicker.addEventListener('input', () => {
        aplicarCorCard(card, colorPicker.value);
        swatch.style.background = colorPicker.value;
        salvarNotas();
    });

    // Delete btn
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-ghost btn-icon btn-danger';
    btnExcluir.title = 'Excluir nota';
    btnExcluir.textContent = '✕';
    btnExcluir.addEventListener('click', () => {
        if (confirm('Excluir esta nota?')) { card.remove(); salvarNotas(); }
    });

    headerActions.append(swatch, btnExcluir);
    header.append(titulo, headerActions);

    const btnMinimizar = document.createElement('button');
    btnMinimizar.className = 'btn btn-ghost btn-icon';
    btnMinimizar.title = 'Minimizar nota';
    btnMinimizar.textContent = '−';
    btnMinimizar.addEventListener('click', () => {
        const minimizado = card.classList.toggle('minimizada');
        btnMinimizar.textContent = minimizado ? '+' : '−';
    });

    headerActions.append(swatch, btnMinimizar, btnExcluir); // adiciona antes do excluir
    header.append(titulo, headerActions);        

    // Textarea
    const texto = document.createElement('textarea');
    texto.classList.add('nota-texto');
    texto.placeholder = 'Digite sua anotação aqui...';
    if (dados) texto.value = dados.texto || '';
    
    // Habilitar tecla TAB dentro do textarea
    texto.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 1;
            salvarNotas();
        }
    });
    texto.addEventListener('input', salvarNotas);

    card.append(header, texto);
    if (dados) notasContainer.appendChild(card); else notasContainer.prepend(card);

    // Apply color
    aplicarCorCard(card, colorPicker.value);
    if (dados) {
        const sw = card.querySelector('.nota-color-swatch');
        if (sw) sw.style.background = dados.cor || '#58a6ff';
    }

    // Drag & drop
    card.addEventListener('dragstart', () => { dragSrcNota = card; card.classList.add('dragging'); });
    card.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.target.closest('.nota-card');
        if (target && target !== dragSrcNota) {
            const rect = target.getBoundingClientRect();
            const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
            notasContainer.insertBefore(dragSrcNota, next ? target.nextSibling : target);
        }
    });
    card.addEventListener('dragend', () => { card.classList.remove('dragging'); salvarNotas(); });

    salvarNotas();
}

function aplicarCorCard(card, cor) {
    card.style.setProperty('--nota-cor', cor);
    card.querySelector('.nota-header').style.borderBottomColor = cor + '30';
}

function carregarNotas() {
    const salvas = JSON.parse(localStorage.getItem('notas_cards') || '[]');
    if (salvas.length === 0) {
        const antigas = localStorage.getItem('notas_cronometro');
        if (antigas && antigas.trim()) {
            adicionarNota({ titulo: 'Anotações', texto: antigas, cor: '#58a6ff' });
            localStorage.removeItem('notas_cronometro');
            return;
        }
        adicionarNota();
    } else {
        salvas.forEach(n => adicionarNota(n));
    }
}

/* ══════════════════════════════════════
    CRONÔMETROS
══════════════════════════════════════ */
const container = document.getElementById("cronometros-container");
let dragSrc = null;

function handleDragStart(e) { dragSrc = this; this.classList.add('dragging'); }
function handleDragOver(e) {
    e.preventDefault();
    const target = e.target.closest('.cronometro');
    if (target && target !== dragSrc) {
        const rect = target.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        container.insertBefore(dragSrc, next ? target.nextSibling : target);
    }
}
function handleDragEnd() { this.classList.remove('dragging'); salvarCronometros(); }

function salvarCronometros() {
    const cronometros = [];
    container.querySelectorAll('.cronometro').forEach(c => {
        const estado = c._estadoCronometro || {};
        cronometros.push({
            tipo: c.dataset.tipo,
            nome: c.querySelector('input[type="text"]').value,
            tempo: c.querySelector('.cron-time').innerText,
            cor: c.querySelector('input[type="color"]').value,
            countdownInput: c.querySelector('input.cron-countdown')?.value || '',
            rodando: estado.rodando || false,
            inicioTimestamp: estado.inicioTimestamp || null,
            segundosSalvos: estado.segundosSalvos || 0,
            // Para regressivo:
            fimTimestamp: estado.fimTimestamp || null,
            segundosTotais: estado.segundosTotais || 0,
        });
    });
    localStorage.setItem('cronometros', JSON.stringify(cronometros));
}

function carregarCronometros() {
    container.innerHTML = "";
    const cronometros = JSON.parse(localStorage.getItem('cronometros') || '[]');
    cronometros.forEach(c => c.tipo === 'normal' ? adicionarCronometroNormal(c) : adicionarCronometroRegressivo(c));
}

function adicionarCronometroNormal(dados = null) {
    const div = document.createElement("div");
    div.classList.add("cronometro");
    div.setAttribute('draggable', 'true');
    div.dataset.tipo = 'normal';

    const cor = dados?.cor || '#58a6ff';
    div.style.setProperty('--cron-color', cor);

    const nomeInput = document.createElement("input");
    nomeInput.type = "text";
    nomeInput.classList.add('cron-name');
    nomeInput.placeholder = "Nome do cronômetro";
    if (dados) nomeInput.value = dados.nome;
    nomeInput.addEventListener('input', salvarCronometros);

    const tempo = document.createElement("div");
    tempo.classList.add("cron-time");
    tempo.innerText = dados ? dados.tempo : "00:00:00";
    tempo.title = "Clique para editar (pausado)";
    tempo.addEventListener('click', () => {
        if (intervalo) { return; }
        const novoValor = prompt("Edite o tempo (HH:MM:SS):", tempo.innerText);
        if (novoValor !== null) {
            const partes = novoValor.split(':');
            if (partes.length === 3 && partes.every(p => !isNaN(p) && p.trim() !== "")) {
                tempo.innerText = novoValor;
                segundosSalvos = partes.reduce((acc, t, i) => acc + parseInt(t) * [3600, 60, 1][i], 0);
                salvarCronometros();
            }
        }
    });

    const controls = document.createElement("div");
    controls.classList.add("cron-controls");

    const btnStart = document.createElement("button");
    btnStart.className = 'btn'; btnStart.innerHTML = '▶';
    btnStart.title = "Iniciar";

    const btnStop = document.createElement("button");
    btnStop.className = 'btn'; btnStop.innerHTML = '⏸';
    btnStop.title = "Pausar";

    const btnReset = document.createElement("button");
    btnReset.className = 'btn'; btnReset.innerHTML = '⏹';
    btnReset.title = "Resetar";

    const btnDelete = document.createElement("button");
    btnDelete.className = 'btn btn-danger'; btnDelete.innerHTML = '✕';
    btnDelete.title = "Excluir";

    // Color dot
    const colorDot = document.createElement('div');
    colorDot.classList.add('cron-color-dot');
    colorDot.style.background = cor;
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = cor;
    colorDot.appendChild(colorPicker);

    controls.append(btnStart, btnStop, btnReset, btnDelete, colorDot);
    div.append(nomeInput, tempo, controls);
    if (dados) container.appendChild(div); else container.prepend(div);

    let inicio = null, intervalo = null;
    let segundosSalvos = dados?.segundosSalvos ?? tempo.innerText.split(':').reduce((acc, t, i) => acc + parseInt(t) * [3600, 60, 1][i], 0);

    div._estadoCronometro = { rodando: false, inicioTimestamp: null, segundosSalvos };

    function atualizar() {
        const diff = Math.floor((Date.now() - inicio) / 1000) + segundosSalvos;
        const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
        tempo.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function iniciarCronometro() {
        if (!intervalo) {
            inicio = Date.now();
            intervalo = setInterval(atualizar, 500);
            div.classList.add('running');
            div._estadoCronometro = { rodando: true, inicioTimestamp: inicio, segundosSalvos };
            salvarCronometros();
        }
    }

    btnStart.addEventListener('click', iniciarCronometro);
    btnStop.addEventListener('click', () => {
        if (intervalo) {
            segundosSalvos += Math.floor((Date.now() - inicio) / 1000);
            clearInterval(intervalo); intervalo = null;
            div.classList.remove('running');
            div._estadoCronometro = { rodando: false, inicioTimestamp: null, segundosSalvos };
            salvarCronometros();
        }
    });
    btnReset.addEventListener('click', () => {
        clearInterval(intervalo); intervalo = null; segundosSalvos = 0; tempo.innerText = "00:00:00";
        div.classList.remove('running');
        div._estadoCronometro = { rodando: false, inicioTimestamp: null, segundosSalvos: 0 };
        salvarCronometros();
    });
    btnDelete.addEventListener('click', () => {
        if (confirm("Excluir este cronômetro?")) { clearInterval(intervalo); div.remove(); salvarCronometros(); }
    });
    colorPicker.addEventListener('input', () => {
        const c = colorPicker.value;
        colorDot.style.background = c;
        div.style.setProperty('--cron-color', c);
        salvarCronometros();
    });

    // Retomar se estava rodando antes do F5
    if (dados?.rodando && dados?.inicioTimestamp) {
        segundosSalvos = dados.segundosSalvos || 0;
        inicio = dados.inicioTimestamp;
        intervalo = setInterval(atualizar, 500);
        div.classList.add('running');
        div._estadoCronometro = { rodando: true, inicioTimestamp: inicio, segundosSalvos };
        atualizar();
    }

    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('dragend', handleDragEnd);
}

function adicionarCronometroRegressivo(dados = null) {
    const div = document.createElement("div");
    div.classList.add("cronometro");
    div.setAttribute('draggable', 'true');
    div.dataset.tipo = 'regressivo';

    const cor = dados?.cor || '#d29922';
    div.style.setProperty('--cron-color', cor);

    const nomeInput = document.createElement("input");
    nomeInput.type = "text";
    nomeInput.classList.add('cron-name');
    nomeInput.placeholder = "Cronômetro regressivo";
    if (dados) nomeInput.value = dados.nome;
    nomeInput.addEventListener('input', salvarCronometros);

    const tempo = document.createElement("div");
    tempo.classList.add("cron-time");
    tempo.innerText = dados ? dados.tempo : "00:00:00";

    const progressoContainer = document.createElement("div");
    progressoContainer.classList.add("progresso-container");
    const progressoBarra = document.createElement("div");
    progressoBarra.classList.add("progresso-barra");
    progressoContainer.appendChild(progressoBarra);

    const countdownRow = document.createElement('div');
    countdownRow.classList.add('countdown-row');

    const countdownInput = document.createElement("input");
    countdownInput.type = "text";
    countdownInput.placeholder = "HH:MM:SS";
    countdownInput.classList.add('cron-countdown');
    if (dados) countdownInput.value = dados.countdownInput;

    const controls = document.createElement("div");
    controls.classList.add("cron-controls");

    const btnCountdown = document.createElement("button");
    btnCountdown.className = 'btn'; btnCountdown.innerHTML = '▶';

    const btnStop = document.createElement("button");
    btnStop.className = 'btn'; btnStop.innerHTML = '⏸';

    const btnReset = document.createElement("button");
    btnReset.className = 'btn'; btnReset.innerHTML = '⏹';

    const btnDelete = document.createElement("button");
    btnDelete.className = 'btn btn-danger'; btnDelete.innerHTML = '✕';

    const colorDot = document.createElement('div');
    colorDot.classList.add('cron-color-dot');
    colorDot.style.background = cor;
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = cor;
    colorDot.appendChild(colorPicker);

    countdownRow.append(countdownInput);
    controls.append(btnCountdown, btnStop, btnReset, btnDelete, colorDot);
    div.append(nomeInput, tempo, progressoContainer, countdownRow, controls);
    if (dados) container.appendChild(div); else container.prepend(div);

    let segundosTotais = dados?.segundosTotais || 0, intervalo = null, fim = dados?.fimTimestamp || null;

    div._estadoCronometro = { rodando: false, fimTimestamp: null, segundosTotais };

    function atualizarRegressiva() {
        const restanteMs = Math.max(0, fim - Date.now());
        const restSeg = Math.floor(restanteMs / 1000);
        const h = Math.floor(restSeg / 3600), m = Math.floor((restSeg % 3600) / 60), s = restSeg % 60;
        tempo.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '00')}`;
        if (segundosTotais > 0) {
            const pct = (restanteMs / (segundosTotais * 1000)) * 100;
            progressoBarra.style.width = pct + "%";
            progressoBarra.style.background = pct < 15 ? 'var(--danger)' : pct < 30 ? 'var(--warning)' : 'var(--success)';
        }
        if (restanteMs <= 0) {
            clearInterval(intervalo); intervalo = null; div.classList.remove('running');
            div._estadoCronometro = { rodando: false, fimTimestamp: null, segundosTotais };
            salvarCronometros();
            
            // Exibe o alerta na página com o nome customizado do cronômetro
            const nomeCronometro = nomeInput.value.trim() || "Cronômetro regressivo";
            setTimeout(() => {
                alert(`⏰ O tempo acabou para: ${nomeCronometro}!`);
            }, 10);
        }
    }

    countdownInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 4) v = v.replace(/^(\d{2})(\d{2})(\d{0,2}).*/, "$1:$2:$3");
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,2}).*/, "$1:$2");
        e.target.value = v;
        salvarCronometros();
    });

    btnCountdown.addEventListener('click', () => {
        const partes = countdownInput.value.split(":").map(Number);
        let segs = 0;
        if (partes.length === 3) segs = partes[0] * 3600 + partes[1] * 60 + partes[2];
        else if (partes.length === 2) segs = partes[0] * 60 + partes[1];
        else if (partes.length === 1) segs = partes[0];
        if (segs > 0) {
            segundosTotais = segs; fim = Date.now() + segs * 1000;
            progressoContainer.style.display = "block";
            clearInterval(intervalo);
            intervalo = setInterval(atualizarRegressiva, 100);
            div.classList.add('running');
            div._estadoCronometro = { rodando: true, fimTimestamp: fim, segundosTotais };
            salvarCronometros();
        }
    });
    btnStop.addEventListener('click', () => {
        clearInterval(intervalo); intervalo = null; div.classList.remove('running');
        div._estadoCronometro = { rodando: false, fimTimestamp: fim, segundosTotais };
        salvarCronometros();
    });
    btnReset.addEventListener('click', () => {
        clearInterval(intervalo); intervalo = null; tempo.innerText = "00:00:00";
        progressoContainer.style.display = "none"; div.classList.remove('running');
        div._estadoCronometro = { rodando: false, fimTimestamp: null, segundosTotais: 0 };
        salvarCronometros();
    });
    btnDelete.addEventListener('click', () => {
        if (confirm("Excluir este cronômetro?")) { clearInterval(intervalo); div.remove(); salvarCronometros(); }
    });

    // Retomar se estava rodando antes do F5
    if (dados?.rodando && dados?.fimTimestamp && dados.fimTimestamp > Date.now()) {
        segundosTotais = dados.segundosTotais || 0;
        fim = dados.fimTimestamp;
        progressoContainer.style.display = "block";
        intervalo = setInterval(atualizarRegressiva, 100);
        div.classList.add('running');
        div._estadoCronometro = { rodando: true, fimTimestamp: fim, segundosTotais };
        atualizarRegressiva();
    }
    colorPicker.addEventListener('input', () => {
        colorDot.style.background = colorPicker.value;
        div.style.setProperty('--cron-color', colorPicker.value);
        salvarCronometros();
    });

    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('dragend', handleDragEnd);
}

/* ── EXPORTAR ── */
function exportarDados() {
    const cronometros = JSON.parse(localStorage.getItem('cronometros') || '[]');
    const notas = JSON.parse(localStorage.getItem('notas_cards') || '[]');
    const dataAtual = new Date().toLocaleString();

    let txt = `BACKUP — WORKSPACE\nExportado em: ${dataAtual}\n${'='.repeat(40)}\n\n`;
    txt += `--- CRONÔMETROS ---\n`;
    if (!cronometros.length) { txt += `Nenhum cronômetro.\n`; }
    else { cronometros.forEach((c, i) => { txt += `${i+1}. [${c.tipo === 'normal' ? '↑' : '↓'}] ${c.nome || 'Sem nome'}: ${c.tempo}\n`; }); }

    txt += `\n--- ANOTAÇÕES ---\n`;
    if (!notas.length) { txt += `(Nenhuma nota)\n`; }
    else { notas.forEach((n, i) => { txt += `\n[${i+1}] ${n.titulo || 'Sem título'}\n${n.texto || '(vazio)'}\n${'-'.repeat(40)}\n`; }); }
    txt += `\n${'='.repeat(40)}\n`;

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `workspace_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
document.getElementById('btn-exportar').addEventListener('click', exportarDados);

window.addEventListener('load', () => { carregarCronometros(); carregarNotas(); });