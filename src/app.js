import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// --- CONFIGURAÇÃO ---
const MEU_ID = 6325178788; // Seu ID (somente você terá acesso)
const ID_CANAL = '-1003858556816'; // O ID do seu canal

let statusBairro = "🟢 PAZ";

// --- COMANDOS ---

bot.start((ctx) => {
  // TRAVA DE SEGURANÇA: Se não for você, o bot nem responde
  if (ctx.from.id !== MEU_ID) {
    return ctx.reply("⚠️ Este bot é uma ferramenta privada de administração.");
  }

  return ctx.reply(
    `🛡️ *PAINEL DE CONTROLE - ALERTA BAIRRO*\n\nStatus Atual: *${statusBairro}*\nClique nos botões abaixo para postar no canal:`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['🚨 TIROTEIO / PERIGO'],
        ['🚔 Polícia na Área', '✅ Tudo em Paz']
      ]).resize()
    }
  );
});

// AÇÃO PARA TIROTEIO
bot.hears('🚨 TIROTEIO / PERIGO', async (ctx) => {
  if (ctx.from.id !== MEU_ID) return;

  try {
    statusBairro = "🔴 PERIGO CRÍTICO";
    // ENVIA DIRETO PARA O CANAL
    await bot.telegram.sendMessage(ID_CANAL, `‼️ *ALERTA URGENTE: TIROTEIO OU PERIGO REAL!* ‼️\n\n❌ Evitem circular pelas ruas do bairro agora. Fiquem protegidos!`, { parse_mode: 'Markdown' });
    
    await ctx.reply("✅ Mensagem enviada para o canal com sucesso!");
  } catch (err) {
    await ctx.reply("❌ Erro ao postar no canal. Verifique se o bot é ADMIN lá.");
    console.error(err);
  }
});

// AÇÃO PARA POLÍCIA
bot.hears('🚔 Polícia na Área', async (ctx) => {
  if (ctx.from.id !== MEU_ID) return;

  try {
    statusBairro = "🔵 POLÍCIA NA ÁREA";
    await bot.telegram.sendMessage(ID_CANAL, `🚔 *INFORMAÇÃO:* Presença policial relatada no bairro. Atenção ao circular.`, { parse_mode: 'Markdown' });
    await ctx.reply("✅ Mensagem de polícia enviada!");
  } catch (err) {
    await ctx.reply("❌ Erro ao postar no canal.");
  }
});

// AÇÃO PARA TUDO EM PAZ
bot.hears('✅ Tudo em Paz', async (ctx) => {
  if (ctx.from.id !== MEU_ID) return;

  try {
    statusBairro = "🟢 PAZ";
    await bot.telegram.sendMessage(ID_CANAL, `✅ *SITUAÇÃO NORMALIZADA:* O bairro está tranquilo no momento.`, { parse_mode: 'Markdown' });
    await ctx.reply("✅ Mensagem de paz enviada!");
  } catch (err) {
    await ctx.reply("❌ Erro ao postar no canal.");
  }
});

// --- INICIALIZAÇÃO ---
bot.launch({ dropPendingUpdates: true });
app.get("/", (req, res) => res.send("Bot Canal Online"));
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));