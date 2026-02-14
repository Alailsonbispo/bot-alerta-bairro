import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import cors from 'cors';
import https from 'https';

const app = express();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());

// Variáveis de Estado com Fuso Horário de Brasília
let statusBairro = "🟢 PAZ (Sem ocorrências)";
const getBrasiliaTime = () => new Date().toLocaleTimeString('pt-BR', { 
  timeZone: 'America/Sao_Paulo', 
  hour: '2-digit', 
  minute: '2-digit' 
});

let ultimaAtualizacao = getBrasiliaTime();
const ID_CANAL = '-1003858556816'; 
const ADMINS = [7329695712, 1025904095]; 

// =======================
// Bot Telegram
// =======================

bot.start((ctx) => {
  return ctx.reply(
    `🛡️ *SISTEMA DE SEGURANÇA*\nStatus: ${statusBairro}\nÚltima atualização: ${ultimaAtualizacao}`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['📢 ENVIAR ALERTA (Admins)'],
        ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']
      ]).resize()
    }
  );
});

bot.hears('📢 ENVIAR ALERTA (Admins)', (ctx) => {
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito.");
  return ctx.reply("⚠️ *QUAL O ALERTA PARA O CANAL?*", {
    parse_mode: 'Markdown',
    ...Markup.keyboard([
      ['🚨 TIROTEIO / PERIGO', '🥷 HOMENS ARMADOS'],
      ['🛸 DRONE CIRCULANDO', '🚔 Polícia na Área'],
      ['🚑 Emergência Médica', '🚧 Via Interditada'],
      ['💡 Falta de Energia', '✅ Tudo em Paz'],
      ['⬅️ VOLTAR AO MENU']
    ]).resize()
  });
});

bot.hears('⬅️ VOLTAR AO MENU', (ctx) => {
  return ctx.reply("Voltando ao menu principal...", {
    ...Markup.keyboard([['📢 ENVIAR ALERTA (Admins)'], ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']]).resize()
  });
});

bot.hears('Status do Bairro 📊', (ctx) => ctx.reply(`📢 *SITUAÇÃO:* ${statusBairro}\n⏰ Atualizado às: ${ultimaAtualizacao}`));

async function postarNoCanal(ctx, texto, novoStatus) {
  if (!ADMINS.includes(ctx.from.id)) return;
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus;
    ultimaAtualizacao = getBrasiliaTime();
    await ctx.reply(`✅ SITE ATUALIZADO: ${novoStatus} às ${ultimaAtualizacao}`);
  } catch (e) {
    await ctx.reply("❌ Erro ao enviar para o canal.");
  }
}

// Mapeamento de Alertas
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => postarNoCanal(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nBusquem abrigo!", "🔴 PERIGO (Tiroteio)"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => postarNoCanal(ctx, "⚠️ *AVISO:* Homens armados circulando!", "🟠 ALERTA (Homens Armados)"));
bot.hears('🛸 DRONE CIRCULANDO', (ctx) => postarNoCanal(ctx, "🛸 *DRONE AVISTADO:* Monitoramento suspeito.", "🟡 MONITORAMENTO (Drone)"));
bot.hears('🚔 Polícia na Área', (ctx) => postarNoCanal(ctx, "🚔 *INFORMAÇÃO:* Viatura policial avistada.", "🔵 POLÍCIA"));
bot.hears('💡 Falta de Energia', (ctx) => postarNoCanal(ctx, "💡 *COELBA:* Falta de energia no bairro.", "💡 SEM LUZ"));
bot.hears('✅ Tudo em Paz', (ctx) => postarNoCanal(ctx, "✅ *SITUAÇÃO NORMAL:* O bairro está em paz.", "🟢 PAZ"));

// =======================
// API e Anti-Sleep
// =======================

app.get('/api/status', (req, res) => {
  res.json({ status: statusBairro, hora: ultimaAtualizacao });
});

app.get('/', (req, res) => {
  res.send(`🛡️ Alerta Bairro Online. Fuso: America/Sao_Paulo. Status: ${statusBairro}`);
});

// Mantém o servidor acordado (Ping a cada 5 min)
setInterval(() => {
  https.get('https://bot-alerta-bairro.onrender.com/');
}, 300000); 

bot.launch({ dropPendingUpdates: true });
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT}`));