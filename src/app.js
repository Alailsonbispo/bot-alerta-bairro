import 'dotenv/config';
import express from 'express';
import { Telegraf } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configuração do Bot (Pegando o Token das variáveis de ambiente)
const bot = new Telegraf(process.env.BOT_TOKEN);

// 2. Comandos do Bot
bot.start((ctx) => ctx.reply('🚀 Bot Alerta Bairro ativado! Como posso ajudar?'));
bot.help((ctx) => ctx.reply('Envie uma mensagem para alertar o bairro.'));
bot.on('text', (ctx) => {
  ctx.reply(`Recebi seu alerta: "${ctx.message.text}"`);
});

// 3. Iniciar o Bot
bot.launch()
  .then(() => console.log('🤖 Bot do Telegram conectado com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar o Bot:', err));

// 4. Servidor Web (Necessário para o Render não dar erro de timeout)
app.get("/", (req, res) => {
  res.send("Bot alerta bairro rodando 🚀");
});

app.listen(PORT, () => {
  console.log(`🌍 Servidor Web rodando na porta ${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));