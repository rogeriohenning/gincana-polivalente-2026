const PONTOS_MIN = -100;
const PONTOS_MAX = 100;
const HISTORICO_LIMITE = 50;

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAdminToken() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
}

function validarToken(token) {
  const adminToken = getAdminToken();
  if (!adminToken) return false;
  return token === adminToken;
}

function verificarRateLimit(chave) {
  const cache = CacheService.getScript();
  const key = 'rl_' + chave;
  if (cache.get(key)) return false;
  cache.put(key, '1', 1);
  return true;
}

function getPontuacaoSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Pontuacao');
  if (!sheet) sheet = ss.getActiveSheet();
  return sheet;
}

function getSheet(nome) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nome);
  if (!sheet) {
    sheet = ss.insertSheet(nome);
    if (nome === 'Historico') {
      sheet.appendRow(['Data/Hora', 'Equipe', 'Delta', 'Saldo anterior', 'Saldo novo']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
  }
  return sheet;
}

function registrarHistorico(equipe, delta, saldoAnterior, saldoNovo) {
  const hist = getSheet('Historico');
  hist.appendRow([
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
    equipe,
    delta,
    saldoAnterior,
    saldoNovo
  ]);
}

function lerHistorico(limite) {
  const hist = getSheet('Historico');
  const data = hist.getDataRange().getValues();
  const entradas = [];
  for (let i = data.length - 1; i >= 1 && entradas.length < limite; i--) {
    if (data[i][0]) {
      entradas.push({
        data: String(data[i][0]),
        equipe: String(data[i][1]),
        delta: Number(data[i][2]),
        saldoAnterior: Number(data[i][3]),
        saldoNovo: Number(data[i][4])
      });
    }
  }
  return entradas;
}

function lerEquipes() {
  const sheet = getPontuacaoSheet();
  const data = sheet.getDataRange().getValues();
  const equipes = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      equipes.push({
        nome: String(data[i][0]).trim(),
        pontos: parseInt(data[i][1]) || 0
      });
    }
  }
  return equipes;
}

function adicionarPontos(nomeEquipe, pontosAdd) {
  const sheet = getPontuacaoSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === nomeEquipe) {
      const saldoAnterior = parseInt(data[i][1]) || 0;
      const saldoNovo = saldoAnterior + pontosAdd;
      if (saldoNovo < 0) {
        return { status: 'erro', mensagem: 'Saldo nao pode ficar negativo' };
      }
      sheet.getRange(i + 1, 2).setValue(saldoNovo);
      registrarHistorico(nomeEquipe, pontosAdd, saldoAnterior, saldoNovo);
      return { status: 'ok', saldoNovo: saldoNovo };
    }
  }
  return { status: 'erro', mensagem: 'Equipe nao encontrada' };
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const acao = params.acao;

  if (acao === 'add') {
    const token = params.token || '';
    if (!validarToken(token)) {
      return jsonResponse({ status: 'erro', mensagem: 'Token invalido ou ausente' });
    }

    const ip = params.ip || 'default';
    if (!verificarRateLimit(ip)) {
      return jsonResponse({ status: 'erro', mensagem: 'Muitas requisicoes. Aguarde 1 segundo.' });
    }

    const nomeEquipe = String(params.equipe || '').trim();
    const pontosAdd = parseInt(params.pontos);

    if (!nomeEquipe || isNaN(pontosAdd) || pontosAdd === 0) {
      return jsonResponse({ status: 'erro', mensagem: 'Parametros invalidos' });
    }
    if (pontosAdd < PONTOS_MIN || pontosAdd > PONTOS_MAX) {
      return jsonResponse({ status: 'erro', mensagem: 'Pontos fora da faixa permitida (' + PONTOS_MIN + ' a ' + PONTOS_MAX + ')' });
    }

    return jsonResponse(adicionarPontos(nomeEquipe, pontosAdd));
  }

  if (acao === 'historico') {
    const token = params.token || '';
    if (!validarToken(token)) {
      return jsonResponse({ status: 'erro', mensagem: 'Token invalido ou ausente' });
    }
    const limite = Math.min(parseInt(params.limite) || 20, HISTORICO_LIMITE);
    return jsonResponse({ status: 'ok', historico: lerHistorico(limite) });
  }

  if (acao === 'validar') {
    const token = params.token || '';
    if (validarToken(token)) {
      return jsonResponse({ status: 'ok' });
    }
    return jsonResponse({ status: 'erro', mensagem: 'PIN incorreto' });
  }

  return jsonResponse(lerEquipes());
}
