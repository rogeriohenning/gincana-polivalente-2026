// API
const API_URL = "https://script.google.com/macros/s/AKfycbz_0gvcm3wappagqtJORfKG8PXzHxWWKorZnnhTHAnd6N8eUp5b4dWOAGyRJmvbg71BzA/exec";

async function carregarRanking() {
  try {
    let tempoAtual = new Date().getTime();
    let resposta = await fetch(`${API_URL}?t=${tempoAtual}`);
    let equipes = await resposta.json();

    equipes.sort((a, b) => b.pontos - a.pontos);

    let tabela = document.getElementById("ranking");

    let htmlDaTabela = `
      <tr>
        <th>Posição</th>
        <th>Equipe</th>
        <th>Pontos</th>
      </tr>
    `;

    equipes.forEach((e, i) => {
      htmlDaTabela += `
        <tr>
          <td>${i + 1}º</td>
          <td>${e.nome}</td>
          <td>${e.pontos}</td>
        </tr>
      `;
    });

    tabela.innerHTML = htmlDaTabela;

  } catch (erro) {
    console.error("Erro ao buscar os dados:", erro);
  }
}

carregarRanking();
setInterval(carregarRanking, 2000); // Atualiza a cada 2 segundos