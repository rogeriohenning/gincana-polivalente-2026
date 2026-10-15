const API_URL = "https://script.google.com/macros/s/AKfycbz_0gvcm3wappagqtJORfKG8PXzHxWWKorZnnhTHAnd6N8eUp5b4dWOAGyRJmvbg71BzA/exec";

const CORES_EQUIPES = {
    Vermelho: "#ff0000",
    Azul: "#00bfff",
    Roxo: "#9d00ff",
    Amarela: "#ffd700",
    Laranja: "#ff8c00",
    Rosa: "#ff1493"
};

const IMAGENS_TROFEUS = [null, "img/ouro.png", "img/prata.png", "img/bronze.png"];

const escudoHTML = (cor) =>
    `<svg class="escudo-svg" viewBox="0 0 24 24" fill="${cor}" stroke="rgba(255,255,255,0.4)" stroke-width="1"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>`;

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
    const cores = ["#ffffff", "#ffd700", corPrincipal || "#ffd700"];
    const total = window.matchMedia("(max-width: 600px)").matches ? 10 : 16;
    for (let i = 0; i < total; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        c.style.left = (12 + Math.random() * 76) + "vw";
        c.style.animationDelay = (-Math.random() * 4.8) + "s";
        c.style.animationDuration = (4.2 + Math.random() * 2.4) + "s";
        c.style.opacity = String(0.28 + Math.random() * 0.28);
        container.appendChild(c);
    }
    while (container.children.length > 24) {
        container.removeChild(container.firstChild);
    }
}

function iniciarFestas(cor) {
    explodirConfetes(cor);
    if (!intervaloConfetes) {
        intervaloConfetes = setInterval(() => explodirConfetes(cor), 7000);
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
    const el = document.getElementById("conteudo-vencedor");
    try {
        const dados = window.__gincanaDados
            ? await window.__gincanaDados
            : await fetch(`${API_URL}?t=${Date.now()}`).then(res => {
                if (!res.ok) throw new Error("Erro na API");
                return res.json();
            });
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
        const nomesEmpate = vencedores.map(v => v.nome).join(", ");
        const mensagemEmpate = empate
            ? `<p class="empate-aviso">Empate entre: ${nomesEmpate}</p>`
            : "";

        document.documentElement.style.setProperty("--team-color", cor);
        const arenaBg = document.getElementById("arena-bg");
        if (arenaBg) arenaBg.style.setProperty("--ambient-color", cor);

        const demaisHtml = equipes.slice(1)
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
                        <p class="mensagem-vencedor">Vocês foram incríveis. O Colégio Polivalente celebra essa vitória!</p>
                        ${mensagemEmpate}
                    </div>
                </div>
                ${demaisHtml ? `
                <section class="ranking-bloco" aria-label="Demais equipes">
                    <h2 class="ranking-titulo">Demais colocações</h2>
                    <div class="ranking-lista">${demaisHtml}</div>
                </section>` : ""}
            </div>
        `;

        iniciarFestas(cor);
        criarParticulas();
    } catch (erro) {
        console.error(erro);
        el.innerHTML = `<p class="erro-msg">Não foi possível carregar o resultado. Verifique a conexão.</p>`;
    }
}

carregarVencedor();
