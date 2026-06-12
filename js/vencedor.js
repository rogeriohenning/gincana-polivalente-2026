function criarParticulas() {
    const container = document.getElementById("particles");
    if (!container) return;
    for (let i = 0; i < 40; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = Math.random() * 4 + 3 + "s";
        p.style.animationDelay = Math.random() * 3 + "s";
        container.appendChild(p);
    }
}

let intervaloConfetes = null;

function explodirConfetes(corPrincipal) {
    const container = document.getElementById("celebration-confetti");
    if (!container) return;
    container.innerHTML = "";
    const cores = ["#ffffff", "#ffd700", corPrincipal || "#ffd700"];
    for (let i = 0; i < 150; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        c.style.left = Math.random() * 100 + "vw";
        c.style.animationDelay = Math.random() * 0.8 + "s";
        c.style.animationDuration = Math.random() * 2 + 2 + "s";
        container.appendChild(c);
    }
}

function iniciarFestas(cor) {
    explodirConfetes(cor);
    if (!intervaloConfetes) {
        intervaloConfetes = setInterval(() => explodirConfetes(cor), 4500);
    }
}

async function carregarVencedor() {
    const el = document.getElementById("conteudo-vencedor");
    try {
        const res = await fetch(`${CONFIG.API_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error("Erro na API");
        const dados = await res.json();
        const equipes = dados
            .map(e => ({ nome: String(e.nome).trim(), pontos: Number(e.pontos) || 0 }))
            .sort((a, b) => b.pontos - a.pontos);

        if (!equipes.length) {
            el.innerHTML = `<p class="erro-msg">Nenhuma equipe encontrada na planilha.</p>`;
            return;
        }

        const maxPontos = equipes[0].pontos;
        const vencedores = equipes.filter(e => e.pontos === maxPontos);
        const principal = vencedores[0];
        const cor = CORES_EQUIPES[principal.nome] || "#ffd700";
        const empate = vencedores.length > 1;

        document.documentElement.style.setProperty("--team-color", cor);
        document.getElementById("arena-bg").style.setProperty(
            "--ambient-color",
            cor
        );

        const nomesEmpate = vencedores.map(v => v.nome).join(", ");
        const mensagemEmpate = empate
            ? `<p class="empate-aviso">Empate entre: ${nomesEmpate}</p>`
            : "";

        el.innerHTML = `
            <h1 class="titulo-parabens">Parabéns!</h1>
            <p class="subtitulo-parabens">A gincana chegou ao fim. A equipe vencedora é:</p>
            <div class="card-vencedor" style="--team-color: ${cor}">
                <div class="coroa-grande">👑</div>
                <img src="img/ouro.png" class="trofeu-vencedor" alt="Troféu de ouro">
                <div class="nome-vencedor">
                    ${escudoHTML(cor)}
                    <span>${principal.nome}</span>
                </div>
                <div class="pontos-vencedor">${maxPontos} pontos</div>
                <p class="mensagem-vencedor">
                    Equipe <strong style="color:${cor}">${principal.nome}</strong>, vocês foram incríveis!
                    O Colégio Polivalente celebra a vitória de vocês na Gincana dos 50 Anos.
                </p>
                ${mensagemEmpate}
            </div>
        `;

        iniciarFestas(cor);
        criarParticulas();
    } catch (erro) {
        console.error(erro);
        el.innerHTML = `
            <p class="erro-msg">Não foi possível carregar o resultado. Verifique a conexão.</p>
            <p style="margin-top:16px"><a href="index.html" class="btn">Voltar ao placar</a></p>
        `;
    }
}

function gincanaEncerrada() {
    return new Date() >= new Date(CONFIG.DATA_FINAL);
}

if (!gincanaEncerrada()) {
    window.location.replace("index.html");
} else {
    carregarVencedor();
}
