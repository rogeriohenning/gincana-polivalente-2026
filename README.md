# Gincana Polivalente 2026 — Placar Oficial

Sistema de placar em tempo real para a **Gincana 50 Anos** do Colégio Estadual Cívico-Militar Polivalente Carlos Domingos Silva.

- **Placar público** (`index.html`) — ranking ao vivo com pódio, animações e contagem regressiva
- **Página vencedor** (`vencedor.html`) — parabéns à campeã após o fim da gincana
- **Painel admin** (`admin.html`) — controle de pontos protegido por PIN
- **Backend** — Google Sheets + Google Apps Script (gratuito)

## Preview das páginas

| Página | URL local | Descrição |
|--------|-----------|-----------|
| Placar | `index.html` | Visível para todos (até o fim da contagem) |
| Vencedor | `vencedor.html` | Parabéns à equipe campeã (após `DATA_FINAL`) |
| Admin | `admin.html` | Apenas organizadores com PIN |

## Configuração rápida

### 1. Clonar e configurar o front-end

```bash
git clone https://github.com/SEU_USUARIO/gincana-polivalente-2026.git
cd gincana-polivalente-2026
copy js\config.example.js js\config.js   # Windows
# cp js/config.example.js js/config.js  # Linux/Mac
```

Edite `js/config.js` e cole a URL do seu Web App do Google Apps Script.

### 2. Criar a planilha Google Sheets

1. Crie uma planilha nova no [Google Sheets](https://sheets.google.com)
2. Na primeira aba (ou renomeie para **Pontuacao**), coloque:

| nome | pontos |
|------|--------|
| Vermelho | 0 |
| Azul | 0 |
| Roxo | 0 |
| Amarela | 0 |
| Laranja | 0 |
| Rosa | 0 |

3. A aba **Historico** será criada automaticamente pelo script na primeira pontuação

### 3. Configurar o Google Apps Script

1. Na planilha: **Extensões → Apps Script**
2. Apague o código padrão e cole o conteúdo de [`apps-script/Code.gs`](apps-script/Code.gs)
3. Vá em **Configurações do projeto** (ícone de engrenagem) → **Propriedades do script**
4. Adicione a propriedade:
   - **Nome:** `ADMIN_TOKEN`
   - **Valor:** um PIN forte (ex: `Gincana2026!`)
5. **Implantar → Nova implantação → Aplicativo da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
6. Copie a URL gerada para `js/config.js`

> **Importante:** após alterar o código do Apps Script, crie uma **nova implantação** (ou gerencie versões) para que as mudanças entrem em vigor.

### 4. Publicar no GitHub Pages

1. Envie o repositório para o GitHub
2. Em **Settings → Pages**, selecione branch `main` e pasta `/ (root)`
3. O placar ficará em: `https://SEU_USUARIO.github.io/gincana-polivalente-2026/`
4. **Não commite** o arquivo `js/config.js` — ele está no `.gitignore`

Para GitHub Pages funcionar, você precisa de `config.js` no repositório **ou** usar um workflow que copie o example. Opção simples: commite `config.js` apenas com a URL pública da API (sem o PIN — o PIN fica só no Apps Script).

## Segurança

| Medida | Detalhe |
|--------|---------|
| PIN no servidor | Alterações exigem `ADMIN_TOKEN` validado no Apps Script |
| Sessão | PIN guardado em `sessionStorage` (some ao fechar aba) |
| Rate limit | Máximo ~1 requisição/segundo por IP |
| Saldo negativo | Bloqueado no servidor |
| Faixa de pontos | -100 a +100 por operação |

**Boas práticas:**
- Use um PIN longo e não compartilhe publicamente
- Não divulgue o link do `admin.html` nas redes — envie só para organizadores
- Troque o PIN se suspeitar de vazamento (altere `ADMIN_TOKEN` no Apps Script)

## Estrutura do projeto

```
├── index.html              # Placar público
├── vencedor.html           # Página de vitória (após contagem)
├── admin.html              # Controle (com login)
├── css/
│   ├── shared.css          # Estilos compartilhados
│   ├── style.css           # Placar
│   ├── vencedor.css        # Página vencedor
│   └── admin.css           # Admin
├── js/
│   ├── config.js           # Config local (gitignored)
│   ├── config.example.js   # Template
│   ├── equipes.js          # Equipes e cores
│   ├── script.js           # Lógica do placar
│   ├── vencedor.js         # Página vencedor
│   └── admin.js            # Lógica do admin
├── img/
│   ├── logo_militar.png    # Logo oficial do colégio
│   ├── ouro.png            # Troféu 1º lugar
│   ├── prata.png           # Troféu 2º lugar
│   └── bronze.png          # Troféu 3º lugar
├── apps-script/
│   └── Code.gs             # Backend Google Apps Script
└── LICENSE
```

Edite `js/config.js` e defina `DATA_FINAL` com data e hora do encerramento (ex: `"2026-09-25T17:50:00"`). Quando a contagem chegar a zero, o placar redireciona automaticamente para `vencedor.html`.

## Logo da escola

O logo oficial está em `img/logo_militar.png`. Os troféus do pódio usam `img/ouro.png`, `img/prata.png` e `img/bronze.png`.

## Licença

MIT — veja [LICENSE](LICENSE).
