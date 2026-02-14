import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// --- CONFIGURAÇÕES ---
const ADMINS = [6325178788]; // Seu ID (que você pegou no userinfobot)
const ID_CANAL = '-100123456789'; // O ID que você pegou no Passo 1 (com o -100)

let statusBairro = "🟢 PAZ (Sem ocorrências)";

const isAdmin = (ctx) => ADMINS.includes(ctx.from.id);

// --- FUNÇÃO DE ENVIO ---
async function enviarAlerta(ctx, mensagem) {
  try {
    // Envia para o Canal/Grupo principal
    await bot.telegram.sendMessage(ID_CANAL, mensagem, { parse_mode: 'Markdown' });
    // Avisa você no privado que deu certo
    await ctx.reply("✅ Alerta publicado no canal!");
  } catch (err) {
    console.error("Erro ao enviar:", err);
    await ctx.reply("❌ Erro ao enviar para o canal. O bot é administrador lá?");
  }
}

// --- COMANDOS ---

bot.start((ctx) => {
  return ctx.reply(
    `🏠 *PAINEL DE CONTROLE - ALERTA BAIRRO*\n\nStatus Atual: *${statusBairro}*`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['✅ Tudo em Paz', '🚔 Polícia na Área'],
        ['🚨 TIROTEIO / PERIGO'],
        ['📍 Consultar Status']
      ]).resize()
    }
  );
});

bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("❌ Acesso negado.");
  statusBairro = "🔴 PERIGO CRÍTICO";
  enviarAlerta(ctx, `‼️ *ALERTA URGENTE:* Relato de tiroteio ou perigo real no bairro.\n\n❌ *EVITEM CIRCULAR NAS RUAS!*`);
});

bot.hears('🚔 Polícia na Área', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("❌ Acesso negado.");
  statusBairro = "🔵 POLÍCIA NA ÁREA";
  enviarAlerta(ctx, `🚔 *INFORMAÇÃO:* Presença policial relatada no bairro. Atenção ao circular.`);
});

bot.hears('✅ Tudo em Paz', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("❌ Acesso negado.");
  statusBairro = "🟢 PAZ";
  enviarAlerta(ctx, `✅ *SITUAÇÃO NORMALIZADA:* O bairro está tranquilo no momento.`);
});

bot.hears('📍 Consultar Status', (ctx) => {
  ctx.reply(`📊 *Status Agora:* ${statusBairro}`);
});

// --- SERVIDOR ---
bot.launch();
app.get("/", (req, res) => res.send("Bot Online"));
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));