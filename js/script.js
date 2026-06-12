let historicoPontos = {};
let historicoPosicao = {};
let onFireTracker = {};
let primeiraCarga = true;
let liderAnterior = null;
let apiOnline = true;

function mostrarSkeleton() {
    const podioDiv = document.getElementById("podio-container");
    if (!podioDiv || !primeiraCarga) return;
    podioDiv.innerHTML = `
        <div class="skeleton-podio">
            <div class="skeleton-card"></div>
            <div class="skeleton-card centro"></div>
            <div class="skeleton-card"></div>
        </div>`;
}

function setOfflineBanner(offline) {
    apiOnline = !offline;
    const banner = document.getElementById("offline-banner");
    const msg = document.querySelector(".update-msg");
    if (banner) banner.classList.toggle("visivel", offline);
    if (msg) {
        msg.classList.toggle("offline", offline);
        msg.innerHTML = offline
            ? "⚠ Sem conexão com o servidor"
            : '<span class="icon-sync">↻</span> Atualizado em tempo real';
    }
}

function calcularPrazo() {
    const agora = new Date();
    const fim = new Date(CONFIG.DATA_FINAL);
    const diff = fim - agora;

    if (diff <= 0) {
        window.location.href = "vencedor.html";
        return;
    }

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const el = document.getElementById("prazo-container");
    if (el) {
        el.innerHTML = `
            <span class="prazo-label">CONTAGEM REGRESSIVA</span>
            <span class="prazo-valor">${dias}d ${horas}h ${minutos}m</span>`;
    }
}

function explodirConfetes(corPrincipal) {
    const container = document.getElementById("celebration-confetti");
    if (!container) return;
    container.innerHTML = "";
    const coresSecundarias = ["#ffffff", "#ffd700", corPrincipal];
    for (let i = 0; i < 120; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.backgroundColor = coresSecundarias[Math.floor(Math.random() * coresSecundarias.length)];
        c.style.left = Math.random() * 100 + "vw";
        c.style.animationDelay = Math.random() * 0.5 + "s";
        c.style.animationDuration = Math.random() * 2 + 1.5 + "s";
        container.appendChild(c);
    }
}

function calcularBarra(pontos, maxPontuacao) {
    if (maxPontuacao <= 0 || pontos <= 0) return 0;
    return Math.min(100, (pontos / maxPontuacao) * 100);
}

function animarNumeros() {
    document.querySelectorAll(".pontos-podio, .linha-pontos").forEach(el => {
        const final = parseInt(el.getAttribute("data-val"), 10);
        const inicial = parseInt(el.getAttribute("data-old"), 10);
        if (isNaN(final)) return;
        if (inicial === final) {
            el.innerText = final;
            return;
        }
        const duration = primeiraCarga ? 1800 : 1200;
        let startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.innerText = Math.floor(eased * (final - inicial) + inicial);
            if (progress < 1) window.requestAnimationFrame(step);
            else el.innerText = final;
        }
        window.requestAnimationFrame(step);
    });

    document.querySelectorAll(".barra-fill[data-perc]").forEach(el => {
        const alvo = parseFloat(el.getAttribute("data-perc"));
        const anterior = parseFloat(el.getAttribute("data-perc-old")) || 0;
        el.style.width = anterior + "%";
        requestAnimationFrame(() => { el.style.width = alvo + "%"; });
    });
}

function animarEntradaPodio() {
    if (!primeiraCarga) return;

    document.querySelectorAll(".podio-wrapper").forEach((wrapper, i) => {
        wrapper.style.opacity = "0";
        wrapper.animate(
            [
                { opacity: 0, transform: "translateY(70px) scale(0.8)" },
                { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            { duration: 900, delay: i * 220, easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", fill: "forwards" }
        );
    });

    document.querySelectorAll(".card-podio").forEach((card, i) => {
        card.animate(
            [
                { boxShadow: "0 0 0 transparent", filter: "brightness(0.5)" },
                { boxShadow: "0 20px 50px rgba(0,0,0,0.6)", filter: "brightness(1)" }
            ],
            { duration: 700, delay: 400 + i * 220, easing: "ease-out", fill: "forwards" }
        );
    });

    document.querySelectorAll(".pos-badge").forEach((el, i) => {
        el.style.opacity = "0";
        setTimeout(() => {
            el.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: 500, delay: 0, easing: "ease-out", fill: "forwards" }
            );
        }, 350 + i * 180);
    });
}

function animarPosRanking() {
    if (!primeiraCarga) return;
    document.querySelectorAll(".linha-pos").forEach((el, i) => {
        el.style.opacity = "0";
        el.animate(
            [
                { opacity: 0, transform: "scale(0) translateX(-20px)" },
                { opacity: 1, transform: "scale(1) translateX(0)" }
            ],
            { duration: 600, delay: 900 + i * 150, easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", fill: "forwards" }
        );
    });
}

function processarAnimacao(e, pos) {
    const jaConhecido = historicoPontos[e.nome] !== undefined;
    const oldPts = jaConhecido ? historicoPontos[e.nome] : (primeiraCarga ? 0 : e.pontos);
    const oldPos = historicoPosicao[e.nome] || pos;
    const mudou = oldPts !== e.pontos || oldPos !== pos;
    const subiuPontos = !primeiraCarga && e.pontos > oldPts;

    if (!primeiraCarga && ((oldPos > 1 && pos === 1) || (oldPos > pos && pos <= 3))) {
        explodirConfetes(CORES_EQUIPES[e.nome] || "#ffffff");
    }

    if (!primeiraCarga && e.pontos > oldPts) {
        onFireTracker[e.nome] = 4;
    } else if (onFireTracker[e.nome] > 0) {
        onFireTracker[e.nome]--;
    }

    historicoPontos[e.nome] = e.pontos;
    historicoPosicao[e.nome] = pos;

    return {
        oldPts,
        mudou: mudou && !primeiraCarga ? "flash-effect" : "",
        subiuPontos: subiuPontos ? "pontos-pulse" : "",
        isOnFire: onFireTracker[e.nome] > 0
    };
}

async function carregarRanking() {
    try {
        const resposta = await fetch(`${CONFIG.API_URL}?t=${Date.now()}`);
        if (!resposta.ok) throw new Error("HTTP " + resposta.status);
        const dadosBrutos = await resposta.json();
        setOfflineBanner(false);

        const equipes = dadosBrutos.map(e => ({
            nome: String(e.nome).trim(),
            pontos: Number(e.pontos) || 0
        }));

        equipes.sort((a, b) => b.pontos - a.pontos);
        const maiorPontuacao = equipes[0]?.pontos > 0 ? equipes[0].pontos : 1;
        const novoLider = equipes[0]?.nome;
        const liderMudou = !primeiraCarga && liderAnterior && novoLider !== liderAnterior;
        liderAnterior = novoLider;

        const podioDiv = document.getElementById("podio-container");
        const listaDiv = document.getElementById("ranking");

        if (equipes.length >= 3) {
            const top3 = equipes.slice(0, 3);
            const resto = equipes.slice(3);
            const glow = document.getElementById("ambient-glow");
            if (glow) glow.style.setProperty("--ambient-color", CORES_EQUIPES[top3[0].nome] || "transparent");

            podioDiv.innerHTML = `
                ${renderCardPodio(top3[1], 2, maiorPontuacao, 0.15, false)}
                ${renderCardPodio(top3[0], 1, maiorPontuacao, 0.45, liderMudou)}
                ${renderCardPodio(top3[2], 3, maiorPontuacao, 0, false)}
            `;
            listaDiv.innerHTML = gerarLinhas(resto, maiorPontuacao, 4);
        } else {
            podioDiv.innerHTML = "";
            listaDiv.innerHTML = gerarLinhas(equipes, maiorPontuacao, 1);
        }

        animarNumeros();
        animarEntradaPodio();
        animarPosRanking();
        if (primeiraCarga) setTimeout(() => { primeiraCarga = false; }, 2800);
    } catch (erro) {
        console.error("Erro na API:", erro);
        setOfflineBanner(true);
    }
}

function renderBarra(perc, percAnterior, tipo) {
    const old = percAnterior !== undefined ? percAnterior : 0;
    if (tipo === "podio") {
        return `<div class="podio-rodape">
            <div class="barra-container barra-podio">
                <div class="barra-fill" data-perc="${perc}" data-perc-old="${old}" style="width:${old}%;"></div>
            </div>
        </div>`;
    }
    const classe = tipo === "lista" ? "barra-container barra-lista" : "barra-container";
    return `<div class="${classe}">
        <div class="barra-fill" data-perc="${perc}" data-perc-old="${old}" style="width:${old}%;"></div>
    </div>`;
}

function renderCardPodio(e, pos, maxPontuacao, delay, novoLider) {
    const classes = ["", "primeiro", "segundo", "terceiro"];
    const cor = CORES_EQUIPES[e.nome] || "#aaaaaa";
    const anim = processarAnimacao(e, pos);
    const perc = calcularBarra(e.pontos, maxPontuacao);
    const percOld = calcularBarra(anim.oldPts, maxPontuacao);
    const liderClass = novoLider && pos === 1 ? "novo-lider" : "";
    const coroaHTML = pos === 1 ? `<div class="coroa-lider">👑</div>` : "";
    const fireHTML = anim.isOnFire ? `<span class="on-fire">🔥</span>` : "";
    const imgTrofeu = IMAGENS_TROFEUS[pos] || "";
    const trofeuHTML = imgTrofeu
        ? `<img src="${imgTrofeu}" class="trofeu-realista" alt="Troféu ${pos}º lugar">`
        : "";

    return `
        <div class="podio-wrapper ${classes[pos]} ${liderClass} podio-slot" style="--team-color: ${cor};" data-pos="${pos}">
            ${coroaHTML}
            <div class="card-podio ${anim.mudou} ${anim.subiuPontos}">
                <div class="shimmer-podio"></div>
                <div class="podio-topo">
                    <div class="pos-badge" data-pos-final="${pos}">
                        <span class="pos-numero">${pos}</span><span class="pos-sufixo">º</span>
                    </div>
                </div>
                <div class="linha-nome">${escudoHTML(cor)} <span class="nome-equipe">${e.nome}</span> ${fireHTML}</div>
                <div class="pontos-podio ${anim.subiuPontos}" data-val="${e.pontos}" data-old="${anim.oldPts}">${anim.oldPts}</div>
                <div class="trofeu-icon">${trofeuHTML}</div>
                ${renderBarra(perc, primeiraCarga ? 0 : percOld, "podio")}
            </div>
        </div>
    `;
}

function gerarLinhas(lista, max, startPos) {
    return lista.map((e, i) => {
        const cor = CORES_EQUIPES[e.nome] || "#aaaaaa";
        const anim = processarAnimacao(e, startPos + i);
        const perc = calcularBarra(e.pontos, max);
        const percOld = calcularBarra(anim.oldPts, max);
        const entraClass = primeiraCarga ? "entra-card" : "";
        const delayStyle = primeiraCarga ? `animation-delay: ${0.7 + i * 0.12}s;` : "";
        const fireHTML = anim.isOnFire ? `<span class="on-fire">🔥</span>` : "";

        return `
            <div class="card-linha ${anim.mudou} ${entraClass}" style="--team-color: ${cor}; ${delayStyle}">
                <div class="linha-info-esq">
                    <span class="linha-pos" data-pos="${startPos + i}">${startPos + i}º</span>
                    <span class="linha-nome">${escudoHTML(cor)} <span>${e.nome}</span> ${fireHTML}</span>
                </div>
                <div class="linha-pontos ${anim.subiuPontos}" data-val="${e.pontos}" data-old="${anim.oldPts}">${anim.oldPts}</div>
                ${renderBarra(perc, primeiraCarga ? 0 : percOld, "lista")}
            </div>
        `;
    }).join("");
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

function criarParticulas() {
    const container = document.getElementById("particles");
    if (!container) return;
    for (let i = 0; i < 35; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = Math.random() * 4 + 3 + "s";
        p.style.animationDelay = Math.random() * 3 + "s";
        container.appendChild(p);
    }
}

mostrarSkeleton();
criarParticulas();
calcularPrazo();
if (new Date() < new Date(CONFIG.DATA_FINAL)) {
    carregarRanking();
    setInterval(() => { carregarRanking(); calcularPrazo(); }, 2000);
}

document.getElementById("btn-fullscreen")?.addEventListener("click", toggleFullscreen);
