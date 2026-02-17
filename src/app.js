import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import cors from 'cors';
import https from 'https';

const app = express();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());

const getBrasiliaTime = () => new Date().toLocaleTimeString('pt-BR', { 
  timeZone: 'America/Sao_Paulo', 
  hour: '2-digit', 
  minute: '2-digit' 
});

// ESTADO DO SISTEMA
let statusBairro = "🟢 PAZ (Sem ocorrências)";
let ultimaAtualizacao = getBrasiliaTime();
let historicoNoticias = [
  { texto: "Monitoramento JSI iniciado. Sistema operando via Telegram.", hora: getBrasiliaTime(), categoria: "SISTEMA" }
];

const ID_CANAL = '-1003858556816'; 
const ADMINS = [7329695712, 1025904095]; 

async function atualizarSistema(ctx, textoCanal, novoStatus, categoria) {
  if (!ADMINS.includes(ctx.from.id)) return;
  try {
    await bot.telegram.sendMessage(ID_CANAL, textoCanal, { parse_mode: 'Markdown' });
    statusBairro = novoStatus; 
    ultimaAtualizacao = getBrasiliaTime();

    const novaNoticia = {
      texto: textoCanal.replace(/\*|!|‼️|⚠️/g, ''), 
      hora: ultimaAtualizacao,
      categoria: categoria
    };
    
    historicoNoticias.unshift(novaNoticia);
    if (historicoNoticias.length > 4) historicoNoticias.pop();

    await ctx.reply(`✅ SITE E CANAL ATUALIZADOS\nStatus: ${novoStatus}`);
  } catch (e) {
    console.error(e);
    await ctx.reply("❌ Erro ao processar comando.");
  }
}

bot.start((ctx) => {
  ctx.reply(`🛡️ *PAINEL ALERTA JSI*\nStatus: ${statusBairro}`, {
    parse_mode: 'Markdown',
    ...Markup.keyboard([['📢 ENVIAR ALERTA (Admins)'], ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']]).resize()
  });
});

bot.hears('📢 ENVIAR ALERTA (Admins)', (ctx) => {
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito.");
  ctx.reply("⚠️ *QUAL O ALERTA PARA O SITE?*", {
    parse_mode: 'Markdown',
    ...Markup.keyboard([
      ['🚨 TIROTEIO / PERIGO', '🥷 HOMENS ARMADOS'],
      ['🛸 DRONE CIRCULANDO', '🚔 Polícia na Área'],
      ['🚑 Emergência Médica', '🚧 Via Interditada'],
      ['💡 Falta de Energia', '✅ Tudo em Paz'],
      ['⬅️ VOLTAR']
    ]).resize()
  });
});

bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => atualizarSistema(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!*", "🔴 PERIGO (Tiroteio)", "PERIGO"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => atualizarSistema(ctx, "⚠️ *AVISO:* Homens armados!", "🟠 ALERTA", "PERIGO"));
bot.hears('🛸 DRONE CIRCULANDO', (ctx) => atualizarSistema(ctx, "🛸 *DRONE AVISTADO!*", "🟡 MONITORAMENTO", "UTILIDADE"));
bot.hears('🚔 Polícia na Área', (ctx) => atualizarSistema(ctx, "🚔 *INFORMAÇÃO:* Polícia na área.", "🔵 POLÍCIA", "POLICIA"));
bot.hears('🚑 Emergência Médica', (ctx) => atualizarSistema(ctx, "🚑 *SAÚDE:* Apoio médico em curso.", "⚠️ MÉDICO", "SAUDE"));
bot.hears('🚧 Via Interditada', (ctx) => atualizarSistema(ctx, "🚧 *TRÂNSITO:* Bloqueio de via.", "🚧 BLOQUEIO", "TRANSITO"));
bot.hears('💡 Falta de Energia', (ctx) => atualizarSistema(ctx, "💡 *COELBA:* Falta de luz.", "💡 SEM LUZ", "UTILIDADE"));
bot.hears('✅ Tudo em Paz', (ctx) => atualizarSistema(ctx, "✅ *SITUAÇÃO NORMAL*", "🟢 PAZ", "PAZ"));

app.get('/api/status', (req, res) => res.json({ status: statusBairro, hora: ultimaAtualizacao, noticias: historicoNoticias }));
app.get('/', (req, res) => res.send("API Ativa"));

setInterval(() => { https.get('https://bot-alerta-bairro.onrender.com/'); }, 300000); 

bot.launch({ dropPendingUpdates: true });
app.listen(PORT, '0.0.0.0', () => console.log(`Online na porta ${PORT}`));