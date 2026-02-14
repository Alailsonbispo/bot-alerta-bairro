require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

// 🔐 Token do .env
const token = process.env.TOKEN;

if (!token) {
  console.error("❌ TOKEN não definido no .env");
  process.exit(1);
}

// 🤖 Inicializa o bot (sem polling, pois usamos webhook)
const bot = new TelegramBot(token);

// 📩 Rota do webhook
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 🧠 Comandos
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🚀 Bem-vindo ao Bot Alerta Bairro!\nUse /alerta para criar um alerta."
  );
});

bot.onText(/\/alerta/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔔 Alerta registrado! Em breve notificaremos o bairro."
  );
});

bot.onText(/\/status/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "✅ Sistema online e funcionando perfeitamente."
  );
});

// 🚀 Inicializa servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
