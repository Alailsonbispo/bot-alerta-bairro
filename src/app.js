import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Habilita o CORS para a Vercel conseguir ler os dados
app.use(cors());

// Configurações do Bot
const ID_CANAL = '-1003858556816'; 
let statusBairro = "🟢 PAZ (Sem ocorrências)";
const ADMINS = [7329695712, 1025904095]; 

// =======================
// Lógica do Bot Telegram
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
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito.");
  return ctx.reply("⚠️ *QUAL O ALERTA?*", {
    parse_mode: 'Markdown',
    ...Markup.keyboard([
      ['🚨 TIROTEIO / PERIGO', '🥷 HOMENS ARMADOS'],
      ['🛸 DRONE CIRCULANDO', '🚔 Polícia na Área'],
      ['💡 Falta de Energia', '✅ Tudo em Paz'],
      ['⬅️ VOLTAR AO MENU']
    ]).resize()
  });
});

bot.hears('Status do Bairro 📊', (ctx) => ctx.reply(`📢 *SITUAÇÃO:* ${statusBairro}`));

async function postarNoCanal(ctx, texto, novoStatus) {
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus; 
    await ctx.reply(`✅ ENVIADO: ${novoStatus}`);
  } catch (e) {
    await ctx.reply("❌ Erro ao enviar.");
  }
}

bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => postarNoCanal(ctx, "‼️ *ALERTA: TIROTEIO!*", "🔴 PERIGO (Tiroteio)"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => postarNoCanal(ctx, "⚠️ *AVISO:* Homens armados!", "🟠 ALERTA (Homens Armados)"));
bot.hears('✅ Tudo em Paz', (ctx) => postarNoCanal(ctx, "✅ *SITUAÇÃO NORMAL*", "🟢 PAZ"));

// =======================
// Rotas da API e Web
// =======================

// Rota para a Vercel buscar o status
app.get('/api/status', (req, res) => {
  res.json({ status: statusBairro });
});

// Rota principal para o Render (Evita tela branca no link do Render)
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>🛡️ Servidor Alerta Bairro Ativo</h1>
      <p>O cérebro do sistema está rodando perfeitamente.</p>
      <p>Status atual: <strong>${statusBairro}</strong></p>
    </div>
  `);
});

// Iniciar
bot.launch({ dropPendingUpdates: true });
app.listen(PORT, '0.0.0.0', () => console.log(`Rodando na porta ${PORT}`));