import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

const MEU_ID = 6325178788; 
const ID_CANAL = '-1003858556816';

// Middleware para logar tudo que acontece no bot
bot.use((ctx, next) => {
  console.log(`📩 Mensagem recebida de: ${ctx.from.id}`);
  return next();
});

bot.start((ctx) => {
  if (ctx.from.id !== MEU_ID) return ctx.reply("Acesso restrito.");
  
  return ctx.reply(
    "🛡️ PAINEL DE CONTROLE ATIVO\nUse os botões abaixo para alertar o bairro:",
    Markup.keyboard([
      ['🚨 TIROTEIO / PERIGO'],
      ['🚔 Polícia na Área', '✅ Tudo em Paz']
    ]).resize()
  );
});

bot.hears('🚨 TIROTEIO / PERIGO', async (ctx) => {
  if (ctx.from.id !== MEU_ID) return;
  try {
    await bot.telegram.sendMessage(ID_CANAL, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nEvitem as ruas agora!", { parse_mode: 'Markdown' });
    await ctx.reply("✅ Enviado ao canal!");
  } catch (e) {
    await ctx.reply("❌ Erro ao enviar. O bot é admin do canal?");
    console.error(e);
  }
});

// Respostas padrão para Polícia e Paz
bot.hears('🚔 Polícia na Área', async (ctx) => {
  if (ctx.from.id !== MEU_ID) return;
  await bot.telegram.sendMessage(ID_CANAL, "🚔 *ATENÇÃO:* Presença policial no bairro.");
  ctx.reply("✅ Enviado!");
});

bot.hears('✅ Tudo em Paz', async (ctx) => {
  if (ctx.from.id !== MEU_ID) return;
  await bot.telegram.sendMessage(ID_CANAL, "✅ *SITUAÇÃO NORMAL:* O bairro está em paz.");
  ctx.reply("✅ Enviado!");
});

// Ligar o servidor e o bot
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
  bot.launch({ dropPendingUpdates: true })
    .then(() => console.log("🤖 BOT ONLINE E PRONTO!"))
    .catch(err => console.error("ERRO AO LIGAR BOT:", err));
});