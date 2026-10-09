const EQUIPES = ["Vermelho", "Azul", "Roxo", "Amarela", "Laranja", "Rosa"];

const CORES_EQUIPES = {
    Vermelho: "#ff0000",
    Azul: "#00bfff",
    Roxo: "#9d00ff",
    Amarela: "#ffd700",
    Laranja: "#ff8c00",
    Rosa: "#ff1493"
};

const escudoHTML = (cor) =>
    `<svg class="escudo-svg" viewBox="0 0 24 24" fill="${cor}" stroke="rgba(255,255,255,0.4)" stroke-width="1"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>`;

const IMAGENS_TROFEUS = [null, "img/ouro.png", "img/prata.png", "img/bronze.png"];
