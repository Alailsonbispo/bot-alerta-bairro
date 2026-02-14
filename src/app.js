import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

const ID_CANAL = '-1003858556816';
let statusBairro = "🟢 PAZ";

// LOG DE ATIVIDADE
bot.use((ctx, next) => {
  if (ctx.channelPost || !ctx.from) return next();
  console.log(`📩 Comando de: ${ctx.from.id}`);
  return next();
});

// COMANDO START
bot.start((ctx) => {
  return ctx.reply(
    `🛡️ *PAINEL DE MONITORAMENTO*\nStatus Atual: ${statusBairro}`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['🚨 TIROTEIO / PERIGO', '🚔 Polícia na Área'],
        ['🚑 Emergência Médica', '🚧 Via Interditada'],
        ['💡 Falta de Energia', '✅ Tudo em Paz']
      ]).resize()
    }
  );
});

// FUNÇÃO DE ENVIO
async function enviarAlerta(ctx, texto, novoStatus) {
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus;
    await ctx.reply(`✅ Alerta enviado: ${novoStatus}`);
  } catch (e) {
    console.error("Erro ao postar no canal:", e.description);
    await ctx.reply("❌ Erro ao enviar para o canal.");
  }
}

// BOTÕES
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => enviarAlerta(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nEvitem circular pelas ruas agora!", "🔴 PERIGO"));
bot.hears('🚔 Polícia na Área', (ctx) => enviarAlerta(ctx, "🚔 *INFORMAÇÃO:* Viatura policial avistada no bairro.", "🔵 POLÍCIA"));
bot.hears('🚑 Emergência Médica', (ctx) => enviarAlerta(ctx, "🚑 *SAÚDE:* Emergência médica relatada no bairro.", "⚠️ MÉDICO"));
bot.hears('🚧 Via Interditada', (ctx) => enviarAlerta(ctx, "🚧 *TRÂNSITO:* Via bloqueada ou acidente no bairro.", "🚧 BLOQUEIO"));
bot.hears('💡 Falta de Energia', (ctx) => enviarAlerta(ctx, "💡 *COELBA:* Relatos de falta de luz no bairro.", "💡 SEM LUZ"));
bot.hears('✅ Tudo em Paz', (ctx) => enviarAlerta(ctx, "✅ *SITUAÇÃO NORMAL:* Bairro tranquilo até o momento.", "🟢 PAZ"));

// INICIALIZAÇÃO
app.get("/", (req, res) => res.send("Bot Online"));
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
  bot.launch({ dropPendingUpdates: true })
    .then(() => console.log("🤖 BOT ONLINE E COM NOVOS BOTÕES!"))
    .catch(err => console.error("ERRO AO LIGAR:", err));
});