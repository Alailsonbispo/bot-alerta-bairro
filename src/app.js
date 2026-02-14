import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; // AJUSTADO: Import correto para ES Modules

// Config __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variáveis
const app = express();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Habilitar CORS - IMPORTANTE para a Vercel ler o status
app.use(cors());

const ID_CANAL = '-1003858556816'; // seu canal
let statusBairro = "🟢 PAZ (Sem ocorrências)";
const ADMINS = [7329695712, 1025904095]; // IDs dos admins

// =======================
// Bot Telegram
// =======================
bot.start((ctx) => {
  return ctx.reply(
    `🛡️ *SISTEMA DE SEGURANÇA*\nStatus Atual: ${statusBairro}`,
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
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito aos administradores.");
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
  return ctx.reply("Voltando...", {
    ...Markup.keyboard([
      ['📢 ENVIAR ALERTA (Admins)'],
      ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']
    ]).resize()
  });
});

bot.hears('Status do Bairro 📊', (ctx) => ctx.reply(`📢 *SITUAÇÃO:* ${statusBairro}`));
bot.hears('Regras / Ajuda 🛡️', (ctx) => ctx.reply("🛡️ Envie apenas informações reais. Use com responsabilidade."));

async function postarNoCanal(ctx, texto, novoStatus) {
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("❌ Negado.");
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus; // Atualiza status
    await ctx.reply(`✅ ENVIADO: ${novoStatus}`);
  } catch (e) {
    await ctx.reply("❌ Erro ao enviar.");
  }
}

// Mapear alertas
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => postarNoCanal(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nBusquem abrigo imediatamente!", "🔴 PERIGO (Tiroteio)"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => postarNoCanal(ctx, "⚠️ *AVISO:* Homens armados circulando no bairro.", "🟠 ALERTA (Homens Armados)"));
bot.hears('🛸 DRONE CIRCULANDO', (ctx) => postarNoCanal(ctx, "🛸 *DRONE AVISTADO:* Drone estranho sobrevoando.", "🟡 MONITORAMENTO (Drone)"));
bot.hears('🚔 Polícia na Área', (ctx) => postarNoCanal(ctx, "🚔 *INFORMAÇÃO:* Viatura policial avistada.", "🔵 POLÍCIA"));
bot.hears('🚑 Emergência Médica', (ctx) => postarNoCanal(ctx, "🚑 *SAÚDE:* Emergência médica relatada.", "⚠️ MÉDICO"));
bot.hears('🚧 Via Interditada', (ctx) => postarNoCanal(ctx, "🚧 *TRÂNSITO:* Trecho bloqueado ou acidente.", "🚧 BLOQUEIO"));
bot.hears('💡 Falta de Energia', (ctx) => postarNoCanal(ctx, "💡 *COELBA:* Falta de energia no bairro.", "💡 SEM LUZ"));
bot.hears('✅ Tudo em Paz', (ctx) => postarNoCanal(ctx, "✅ *SITUAÇÃO NORMAL:* O bairro está em paz.", "🟢 PAZ"));

// =======================
// API de Status
// =======================
app.get('/api/status', (req, res) => {
  res.json({ status: statusBairro });
});

// Servir Landing Page (Opcional se já estiver na Vercel, mas bom manter)
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (req, res) => {
    res.send("Servidor Alerta Bairro Online! 🛡️");
});

// =======================
// Iniciar Bot e Servidor
// =======================
bot.launch({ dropPendingUpdates: true })
  .then(() => console.log("Bot Telegram rodando"))
  .catch(err => console.error("Erro ao iniciar bot:", err));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});