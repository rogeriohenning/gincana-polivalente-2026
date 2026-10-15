function criarParticulas() {
    const container = document.getElementById("particles");
    if (!container) return;
    const total = window.matchMedia("(max-width: 600px)").matches ? 12 : 22;
    for (let i = 0; i < total; i++) {
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
    const total = window.matchMedia("(max-width: 600px)").matches ? 40 : 70;
    for (let i = 0; i < total; i++) {
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

function renderCardDemais(equipe, pos, index) {
    const cor = CORES_EQUIPES[equipe.nome] || "#aaaaaa";
    const trofeu = IMAGENS_TROFEUS[pos]
        ? `<img src="${IMAGENS_TROFEUS[pos]}" class="rank-trofeu" alt="${pos}º lugar">`
        : `<span class="rank-trofeu-slot" aria-hidden="true"></span>`;
    const topClass = pos <= 3 ? ` rank-top-${pos}` : "";

    return `
        <article class="rank-row${topClass}" style="--team-color: ${cor}; --i: ${index}">
            <span class="rank-pos">${pos}º</span>
            ${trofeu}
            <span class="rank-nome">${escudoHTML(cor)} <span>${equipe.nome}</span></span>
            <span class="rank-pontos">${equipe.pontos}</span>
        </article>`;
}

async function carregarVencedor() {
    window.__vencedorPronto = true;
    const el = document.getElementById("conteudo-vencedor");
    try {
        const res = await fetch(`${CONFIG.API_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error("Erro na API");
        const dados = await res.json();

        if (!Array.isArray(dados)) throw new Error("Formato inválido da API");

        const equipes = dados
            .map(e => ({
                nome: String(e.nome ?? e.Nome ?? "").trim(),
                pontos: Number(e.pontos ?? e.Pontos) || 0
            }))
            .filter(e => e.nome)
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
        const arenaBg = document.getElementById("arena-bg");
        if (arenaBg) arenaBg.style.setProperty("--ambient-color", cor);

        const nomesEmpate = vencedores.map(v => v.nome).join(", ");
        const mensagemEmpate = empate
            ? `<p class="empate-aviso">Empate entre: ${nomesEmpate}</p>`
            : "";

        // 1º já está no card grande — grade só com 2º em diante
        const demais = equipes.slice(1);
        const demaisHtml = demais
            .map((equipe, i) => renderCardDemais(equipe, i + 2, i))
            .join("");

        el.innerHTML = `
            <div class="layout-vencedor" style="--team-color: ${cor}">
                <h1 class="titulo-parabens">Parabéns!</h1>
                <p class="subtitulo-parabens">A equipe campeã da Gincana 50 Anos</p>

                <div class="winner-stage">
                    <div class="holofote h-left" aria-hidden="true"></div>
                    <div class="holofote h-center" aria-hidden="true"></div>
                    <div class="holofote h-right" aria-hidden="true"></div>
                    <div class="holofote-floor" aria-hidden="true"></div>

                    <div class="card-vencedor">
                        <div class="coroa-grande">👑</div>
                        <img src="img/ouro.png" class="trofeu-vencedor" alt="Troféu de ouro">
                        <div class="nome-vencedor">
                            ${escudoHTML(cor)}
                            <span>${principal.nome}</span>
                        </div>
                        <div class="pontos-vencedor">${maxPontos} pontos</div>
                        <p class="mensagem-vencedor">
                            Vocês foram incríveis. O Colégio Polivalente celebra essa vitória!
                        </p>
                        ${mensagemEmpate}
                    </div>
                </div>

                ${demais.length ? `
                <section class="ranking-bloco" aria-label="Demais equipes">
                    <h2 class="ranking-titulo">Demais colocações</h2>
                    <div class="ranking-lista">
                        ${demaisHtml}
                    </div>
                </section>` : ""}
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
