const API_URL = "https://script.google.com/macros/s/AKfycbz_0gvcm3wappagqtJORfKG8PXzHxWWKorZnnhTHAnd6N8eUp5b4dWOAGyRJmvbg71BzA/exec";
const DATA_FINAL = "2026-09-25T17:50:00"; 

const CORES_EQUIPES = {
    "Laranja": "#ff8c00", "Rosa": "#ff1493", "Amarela": "#ffd700",
    "Roxo": "#9d00ff", "Azul": "#00bfff", "Vermelho": "#ff0000"
};

const escudoHTML = (cor) => `<svg class="escudo-svg" viewBox="0 0 24 24" fill="${cor}" stroke="#000" stroke-width="1"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>`;
const imagensTrofeus = [ null, "img/ouro.png", "img/prata.png", "img/bronze.png" ];

let historicoPontos = {};
let historicoPosicao = {};
let onFireTracker = {}; 
let primeiraCarga = true; 

function calcularPrazo() {
    const agora = new Date();
    const fim = new Date(DATA_FINAL);
    const diff = fim - agora;
    const dias = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const el = document.getElementById("prazo-container");
    if(el) el.innerHTML = `<span style="font-weight:400; font-size:0.8em; opacity:0.8;">FALTAM</span><br><span class="prazo-dias">${dias} DIAS</span>`;
}

function criarParticulas() {
    const container = document.getElementById('particles');
    for(let i=0; i<35; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (Math.random() * 4 + 3) + 's';
        p.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(p);
    }
}

function explodirConfetes(cor) {
    const container = document.getElementById('celebration-confetti');
    if(!container) return;
    container.innerHTML = ''; 
    for(let i=0; i<100; i++) {
        let c = document.createElement('div');
        c.className = 'confetti';
        c.style.backgroundColor = (i % 2 === 0) ? cor : '#ffffff';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.animationDelay = Math.random() * 0.5 + 's';
        c.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        container.appendChild(c);
    }
}

function animarNumeros() {
    document.querySelectorAll('.pontos-podio, .linha-pontos').forEach(el => {
        let final = parseInt(el.getAttribute('data-val'));
        let inicial = parseInt(el.getAttribute('data-old'));
        if(inicial === final) { el.innerText = final; return; }
        let duration = 1500; 
        let startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = Math.min((timestamp - startTime) / duration, 1);
            let easeOut = 1 - Math.pow(1 - progress, 3);
            el.innerText = Math.floor(easeOut * (final - inicial) + inicial);
            if (progress < 1) window.requestAnimationFrame(step);
            else el.innerText = final;
        }
        window.requestAnimationFrame(step);
    });
}

function atualizarAmbilight(cor) {
    const glow = document.getElementById('ambient-glow');
    if(glow) glow.style.setProperty('--ambient-color', cor);
}

function processarAnimacao(e, pos) {
    let oldPts = historicoPontos[e.nome] !== undefined ? historicoPontos[e.nome] : e.pontos;
    let oldPos = historicoPosicao[e.nome] || pos;
    let mudou = (oldPts !== e.pontos || oldPos !== pos);
    
  
    if (!primeiraCarga && ((oldPos > 1 && pos === 1) || (oldPos > pos && pos <= 3))) {
        explodirConfetes(CORES_EQUIPES[e.nome] || '#ffffff');
    }

   
    if (!primeiraCarga && e.pontos > oldPts) {
        onFireTracker[e.nome] = 4; // Fica a arder durante 4 ciclos (8 segundos)
    } else {
        if (onFireTracker[e.nome] > 0) onFireTracker[e.nome]--;
    }

    historicoPontos[e.nome] = e.pontos;
    historicoPosicao[e.nome] = pos;

    return { 
        oldPts, 
        mudou: mudou && !primeiraCarga ? "flash-effect" : "",
        isOnFire: onFireTracker[e.nome] > 0
    };
}

async function carregarRanking() {
    try {
        let resposta = await fetch(`${API_URL}?t=${new Date().getTime()}`);
        let dadosBrutos = await resposta.json();
        let equipes = dadosBrutos.map(e => ({ nome: String(e.nome).trim(), pontos: Number(e.pontos) || 0 }));

        equipes.sort((a, b) => b.pontos - a.pontos);
        const totalPontos = equipes.reduce((soma, e) => soma + e.pontos, 0);
        const maiorPontuacao = equipes[0].pontos > 0 ? equipes[0].pontos : 1; 

        const podioDiv = document.getElementById("podio-container");
        const listaDiv = document.getElementById("ranking");
        if (!podioDiv || !listaDiv) return; 

        if (totalPontos === 0) {
            podioDiv.innerHTML = "";
            listaDiv.innerHTML = gerarLinhas(equipes, maiorPontuacao, 1);
        } else {
            const top3 = equipes.slice(0, 3);
            const resto = equipes.slice(3);
            atualizarAmbilight(CORES_EQUIPES[top3[0].nome] || '#ffffff');
            
            podioDiv.innerHTML = `
                ${renderCardPodio(top3[1], 2, maiorPontuacao, 0.4)}
                ${renderCardPodio(top3[0], 1, maiorPontuacao, 0.8)}
                ${renderCardPodio(top3[2], 3, maiorPontuacao, 0.1)}
            `;
            listaDiv.innerHTML = gerarLinhas(resto, maiorPontuacao, 4);
        }
        animarNumeros();
        
        if (primeiraCarga) {
            setTimeout(() => { primeiraCarga = false; }, 2000);
        }
    } catch (erro) { console.error("Erro ao carregar dados:", erro); }
}

function renderCardPodio(e, pos, max, delay) {
    if (!e) return "";
    const classes = ["", "primeiro", "segundo", "terceiro"];
    const cor = CORES_EQUIPES[e.nome] || "#ffffff";
    const perc = (e.pontos / max) * 100;
    const imagemTrofeu = imagensTrofeus[pos];
    const anim = processarAnimacao(e, pos);
    
    const entraClass = primeiraCarga ? "entra-card" : "";
    const delayStyle = primeiraCarga ? `animation-delay: ${delay}s;` : "";
    
    
    const coroaHTML = pos === 1 ? `<div class="coroa-lider">👑</div>` : "";
   
    const fireHTML = anim.isOnFire ? `<span class="on-fire" title="ON FIRE!">🔥</span>` : "";

    return `
        <div class="card-podio ${classes[pos]} ${anim.mudou} ${entraClass}" style="--team-color: ${cor}; ${delayStyle}">
            ${coroaHTML}
            <div class="shimmer-wrapper"><div class="glass-shimmer"></div></div>
            <div class="pos-numero">${pos}º</div>
            <div class="linha-nome">${escudoHTML(cor)} <span class="nome-texto">${e.nome}</span> ${fireHTML}</div>
            <div class="pontos-podio" data-val="${e.pontos}" data-old="${anim.oldPts}">${anim.oldPts}</div>
            <div class="trofeu-icon"><img src="${imagemTrofeu}" class="trofeu-realista" alt="Troféu" onerror="this.style.display='none'"></div>
            <div class="barra-container-podio"><div class="barra-fill" style="width:${perc}%; background: linear-gradient(90deg, ${cor}80, ${cor}); box-shadow: 0 0 10px ${cor};"></div></div>
        </div>
    `;
}

function gerarLinhas(lista, max, startPos) {
    return lista.map((e, i) => {
        const cor = CORES_EQUIPES[e.nome] || "#ffffff";
        const perc = (e.pontos / max) * 100;
        const posReal = startPos + i;
        const anim = processarAnimacao(e, posReal);
        
        const entraClass = primeiraCarga ? "entra-linha" : "";
        const delayStyle = primeiraCarga ? `animation-delay: ${1 + (i * 0.2)}s;` : "";
        const fireHTML = anim.isOnFire ? `<span class="on-fire">🔥</span>` : "";
        
        return `
            <div class="card-linha ${anim.mudou} ${entraClass}" style="--team-color: ${cor}; ${delayStyle}">
                <div class="shimmer-wrapper"><div class="glass-shimmer"></div></div>
                <div class="linha-info-esq">
                    <span class="linha-pos">${posReal}º</span>
                    <span class="linha-nome">${escudoHTML(cor)} <span class="nome-texto">${e.nome}</span> ${fireHTML}</span>
                </div>
                <div class="linha-pontos" data-val="${e.pontos}" data-old="${anim.oldPts}">${anim.oldPts}</div>
                <div class="barra-container-linha"><div class="barra-fill" style="width:${perc}%; background: linear-gradient(90deg, ${cor}80, ${cor}); box-shadow: 0 0 8px ${cor};"></div></div>
            </div>
        `;
    }).join('');
}

document.addEventListener("DOMContentLoaded", criarParticulas);
carregarRanking();
calcularPrazo();
setInterval(() => { carregarRanking(); calcularPrazo(); }, 2000);