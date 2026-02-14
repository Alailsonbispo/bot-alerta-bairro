import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

const ID_CANAL = '-1003858556816';
let statusBairro = "🟢 PAZ";

// LOG DE ATIVIDADE (Apenas para você monitorar quem usa)
bot.use((ctx, next) => {
  if (ctx.from) {
    console.log(`👤 Usuário ${ctx.from.id} (${ctx.from.first_name}) interagiu.`);
  }
  return next();
});

// COMANDO START: Agora qualquer um que der /start verá o menu
bot.start((ctx) => {
  return ctx.reply(
    `🛡️ *MONITORAMENTO COLABORATIVO*\nStatus Atual: ${statusBairro}\n\nSelecione um alerta abaixo para informar ao canal:`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['🚨 TIROTEIO / PERIGO'],
        ['🚔 Polícia na Área', '✅ Tudo em Paz']
      ]).resize()
    }
  );
});

// FUNÇÃO DE ENVIO (Removi a trava de ID)
async function enviarAlerta(ctx, texto, novoStatus) {
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus;
    await ctx.reply(`✅ Obrigado pelo aviso! Alerta enviado ao canal.`);
  } catch (e) {
    console.error("Erro ao postar no canal:", e.description);
    await ctx.reply("❌ Ocorreu um erro ao enviar para o canal.");
  }
}

// BOTÕES LIBERADOS
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => enviarAlerta(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nMoradores relataram perigo agora!", "🔴 PERIGO"));
bot.hears('🚔 Polícia na Área', (ctx) => enviarAlerta(ctx, "🚔 *INFORMAÇÃO:* Polícia vista no bairro.", "🔵 POLÍCIA"));
bot.hears('✅ Tudo em Paz', (ctx) => enviarAlerta(ctx, "✅ *SITUAÇÃO NORMALIZADA:* Bairro tranquilo.", "🟢 PAZ"));

app.get("/", (req, res) => res.send("Bot Colaborativo Online"));
app.listen(PORT, () => {
  console.log(`🌐 Servidor na porta ${PORT}`);
  bot.launch({ dropPendingUpdates: true });
});