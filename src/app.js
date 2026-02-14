import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import https from 'https';
import { Telegraf, Markup } from 'telegraf';
import Redis from 'ioredis';
import { DateTime } from 'luxon';

const app = express();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());
app.use(express.json());

// Redis
const redis = new Redis(process.env.REDIS_URL);
const STATUS_KEY = 'statusBairro';
const HORA_KEY = 'ultimaAtualizacao';

// Admins
const ADMINS = process.env.ADMINS.split(',').map(Number);
const ID_CANAL = process.env.ID_CANAL;

// SSE
let clients = [];
app.get('/api/status-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  clients.push({ id: clientId, res });
  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

function sendUpdate(status, hora) {
  clients.forEach(c => c.res.write(`data: ${JSON.stringify({ status, hora })}\n\n`));
}

// Função de hora de Brasília
const getBrasiliaTime = () => DateTime.now().setZone('America/Sao_Paulo').toISO();

// Funções de status
async function setStatus(novoStatus) {
  const agora = getBrasiliaTime();
  await redis.set(STATUS_KEY, novoStatus);
  await redis.set(HORA_KEY, agora);
  sendUpdate(novoStatus, DateTime.fromISO(agora).toFormat('dd/MM/yyyy HH:mm'));
  return { status: novoStatus, hora: DateTime.fromISO(agora).toFormat('dd/MM/yyyy HH:mm') };
}

async function getStatus() {
  const status = await redis.get(STATUS_KEY) || '🟢 PAZ (Sem ocorrências)';
  const horaISO = await redis.get(HORA_KEY) || getBrasiliaTime();
  const hora = DateTime.fromISO(horaISO).toFormat('dd/MM/yyyy HH:mm');
  return { status, hora };
}

// Bot Telegram
const ALERTS = {
  '🚨 TIROTEIO / PERIGO': { texto: "‼️ *ALERTA URGENTE: TIROTEIO!*", status: "🔴 PERIGO (Tiroteio)" },
  '🥷 HOMENS ARMADOS': { texto: "⚠️ *AVISO:* Homens armados!", status: "🟠 ALERTA (Homens Armados)" },
  '🛸 DRONE CIRCULANDO': { texto: "🛸 *DRONE AVISTADO!*", status: "🟡 MONITORAMENTO (Drone)" },
  '🚔 Polícia na Área': { texto: "🚔 *INFORMAÇÃO:* Polícia na área.", status: "🔵 POLÍCIA" },
  '🚑 Emergência Médica': { texto: "🚑 *SAÚDE:* Necessidade de suporte médico!", status: "⚠️ MÉDICO" },
  '🚧 Via Interditada': { texto: "🚧 *TRÂNSITO:* Via bloqueada.", status: "🚧 BLOQUEIO" },
  '💡 Falta de Energia': { texto: "💡 *COELBA:* Sem luz no bairro.", status: "💡 SEM LUZ" },
  '✅ Tudo em Paz': { texto: "✅ *SITUAÇÃO NORMAL*", status: "🟢 PAZ" }
};

async function postarNoCanal(ctx, texto, novoStatus) {
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito.");
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    const { status, hora } = await setStatus(novoStatus);
    await ctx.reply(`✅ SITE ATUALIZADO: ${status} às ${hora}`);
  } catch (e) {
    console.error(e);
    await ctx.reply("❌ Erro ao atualizar o site.");
  }
}

// Menu
bot.start(ctx => ctx.reply(
  `🛡️ *SISTEMA DE SEGURANÇA*\nStatus Atual: (verifique no site)`,
  {
    parse_mode: 'Markdown',
    ...Markup.keyboard([['📢 ENVIAR ALERTA (Admins)'], ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']]).resize()
  }
));

bot.hears('📢 ENVIAR ALERTA (Admins)', ctx => {
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito.");
  ctx.reply("⚠️ *QUAL O ALERTA PARA O CANAL?*", {
    parse_mode: 'Markdown',
    ...Markup.keyboard([...Object.keys(ALERTS), '⬅️ VOLTAR AO MENU']).resize()
  });
});

bot.hears('⬅️ VOLTAR AO MENU', ctx => {
  ctx.reply("Voltando ao menu principal...", {
    ...Markup.keyboard([['📢 ENVIAR ALERTA (Admins)'], ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']]).resize()
  });
});

// Mapear alertas dinamicamente
Object.entries(ALERTS).forEach(([tecla, { texto, status }]) => {
  bot.hears(tecla, ctx => postarNoCanal(ctx, texto, status));
});

// Endpoints
app.get('/api/status', async (req, res) => {
  const status = await getStatus();
  res.json(status);
});

app.get('/', async (req, res) => {
  const { status } = await getStatus();
  res.send(`🛡️ Alerta Bairro Ativo. Status: ${status}`);
});

// Anti-sleep ping
setInterval(() => https.get(process.env.URL_SITE), 300000);

// Launch
bot.launch({ dropPendingUpdates: true });
app.listen(PORT, '0.0.0.0', () => console.log(`Rodando na porta ${PORT}`));
