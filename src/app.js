import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// --- CONFIGURAÇÃO ---
const ADMINS = [6325178788]; // Seu ID
const ID_CANAL = '-1003858556816'; // O ID pego no @JsonDumpBot (COM o -100)

let statusBairro = "🟢 PAZ";

const isAdmin = (ctx) => ADMINS.includes(ctx.from.id);

// --- FUNÇÃO DE ALERTA ---
async function dispararAlerta(ctx, texto) {
  try {
    // 1. Tenta enviar para o CANAL
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    // 2. Confirma para você no privado que enviou
    await ctx.reply("✅ Alerta enviado para o Canal!");
  } catch (err) {
    console.error("ERRO NO CANAL:", err);
    await ctx.reply("❌ Erro: O Bot não conseguiu postar no canal. Verifique se ele é ADMIN lá.");
  }
}

// --- COMANDOS ---
bot.start((ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("🏠 *Monitoramento:* Apenas administradores podem usar o painel.");
  
  return ctx.reply(
    `🛡️ *PAINEL DE CONTROLE*\nStatus Atual: ${statusBairro}`,
    Markup.keyboard([
      ['🚨 TIROTEIO / PERIGO'],
      ['🚔 Polícia na Área', '✅ Tudo em Paz']
    ]).resize()
  );
});

bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => {
  if (!isAdmin(ctx)) return;
  statusBairro = "🔴 PERIGO";
  dispararAlerta(ctx, "⚠️ *ALERTA URGENTE: TIROTEIO OU PERIGO REAL!* ⚠️\n\n❌ Evitem circular pelas ruas do bairro agora.");
});

bot.hears('🚔 Polícia na Área', (ctx) => {
  if (!isAdmin(ctx)) return;
  statusBairro = "🔵 POLÍCIA";
  dispararAlerta(ctx, "🚔 *ATENÇÃO:* Presença policial relatada no bairro. Circulem com cautela.");
});

bot.hears('✅ Tudo em Paz', (ctx) => {
  if (!isAdmin(ctx)) return;
  statusBairro = "🟢 PAZ";
  dispararAlerta(ctx, "✅ *SITUAÇÃO NORMALIZADA:* O bairro está tranquilo.");
});

// Remova o bot.launch() antigo e coloque este:
bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('✅ BOT CONECTADO AO TELEGRAM!');
}).catch((err) => {
  console.error('❌ ERRO AO LIGAR:', err);
});