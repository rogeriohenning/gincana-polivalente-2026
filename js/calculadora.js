const anel = document.getElementById("anel");
const statusEl = document.getElementById("status");
const equipeEl = document.getElementById("equipe-acesa");
const faixa = document.getElementById("faixa");
const faiscas = document.getElementById("faiscas");

const FALAS = [
    "A pontuação está sendo calculada",
    "Os resultados ainda não foram publicados",
    "O placar entra no ar em seguida"
];

const NOME_ACESA = {
    Vermelho: "Equipe Vermelha",
    Azul: "Equipe Azul",
    Roxo: "Equipe Roxa",
    Amarela: "Equipe Amarela",
    Laranja: "Equipe Laranja",
    Rosa: "Equipe Rosa"
};

EQUIPES.forEach((nome) => {
    const pedaco = document.createElement("span");
    pedaco.style.background = CORES_EQUIPES[nome];
    faixa.appendChild(pedaco);
});

for (let i = 0; i < 16; i += 1) {
    const faisca = document.createElement("i");
    faisca.style.left = `${4 + ((i * 17) % 92)}%`;
    faisca.style.bottom = `${6 + (i % 6) * 8}%`;
    faisca.style.animationDelay = `${-(i * 0.17)}s`;
    faisca.style.animationDuration = `${0.85 + (i % 4) * 0.22}s`;
    faiscas.appendChild(faisca);
}

EQUIPES.forEach((nome, i) => {
    const item = document.createElement("div");
    item.className = "escudo-item";
    item.style.setProperty("--i", i);
    item.style.setProperty("--team-color", CORES_EQUIPES[nome]);
    item.innerHTML = `<div class="placa">${escudoHTML(CORES_EQUIPES[nome])}</div><span>${nome}</span>`;
    anel.appendChild(item);
});

const escudos = [...anel.children];
let cor = 0;
let fala = 0;

function pintarAmbiente() {
    const indice = cor % EQUIPES.length;
    const nome = EQUIPES[indice];
    document.documentElement.style.setProperty("--ambient", CORES_EQUIPES[nome]);
    escudos.forEach((item, i) => item.classList.toggle("aceso", i === indice));
    equipeEl.textContent = NOME_ACESA[nome];
    equipeEl.style.color = CORES_EQUIPES[nome];
    cor += 1;
}

pintarAmbiente();
setInterval(pintarAmbiente, 1600);

setInterval(() => {
    statusEl.classList.add("troca");
    setTimeout(() => {
        fala = (fala + 1) % FALAS.length;
        statusEl.textContent = FALAS[fala];
        statusEl.classList.remove("troca");
    }, 350);
}, 3200);
