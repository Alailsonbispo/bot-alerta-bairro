import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import cors from 'cors';

// Variáveis de Ambiente e Configuração
const app = express();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Habilitar CORS para que a Landing Page na Vercel consiga ler o status
app.use(cors());

const ID_CANAL = '-1003858556816'; 
let statusBairro = "🟢 PAZ (Sem ocorrências)";
const ADMINS = [7329695712, 1025904095]; 

// =======================
// Bot Telegram - Menus
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
  return ctx.reply("Voltando ao menu principal...", {
    ...Markup.keyboard([
      ['📢 ENVIAR ALERTA (Admins)'],
      ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']
    ]).resize()
  });
});

bot.hears('Status do Bairro 📊', (ctx) => ctx.reply(`📢 *SITUAÇÃO:* ${statusBairro}`));
bot.hears('Regras / Ajuda 🛡️', (ctx) => ctx.reply("🛡️ Utilize com responsabilidade. Alertas falsos geram banimento."));

// =======================
// Função de Envio e Status
// =======================

async function postarNoCanal(ctx, texto, novoStatus) {
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("❌ Negado.");
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus; 
    await ctx.reply(`✅ SITE ATUALIZADO: ${novoStatus}`);
  } catch (e) {
    console.error(e);
    await ctx.reply("❌ Erro ao enviar para o canal.");
  }
}

// =======================
// Mapeamento de Alertas
// =======================

bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => postarNoCanal(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nBusquem abrigo!", "🔴 PERIGO (Tiroteio)"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => postarNoCanal(ctx, "⚠️ *AVISO:* Homens armados circulando!", "🟠 ALERTA (Homens Armados)"));
bot.hears('🛸 DRONE CIRCULANDO', (ctx) => postarNoCanal(ctx, "🛸 *DRONE AVISTADO:* Monitoramento suspeito.", "🟡 MONITORAMENTO (Drone)"));
bot.hears('🚔 Polícia na Área', (ctx) => postarNoCanal(ctx, "🚔 *INFORMAÇÃO:* Viatura policial avistada.", "🔵 POLÍCIA"));
bot.hears('🚑 Emergência Médica', (ctx) => postarNoCanal(ctx, "🚑 *SAÚDE:* Emergência médica relatada.", "⚠️ MÉDICO"));
bot.hears('🚧 Via Interditada', (ctx) => postarNoCanal(ctx, "🚧 *TRÂNSITO:* Trecho bloqueado ou acidente.", "🚧 BLOQUEIO"));
bot.hears('💡 Falta de Energia', (ctx) => postarNoCanal(ctx, "💡 *COELBA:* Falta de energia no bairro.", "💡 SEM LUZ"));
bot.hears('✅ Tudo em Paz', (ctx) => postarNoCanal(ctx, "✅ *SITUAÇÃO NORMAL:* O bairro está em paz.", "🟢 PAZ"));

// =======================
// API e Rotas Web
// =======================

// Rota para a Vercel buscar o status (O coração da integração)
app.get('/api/status', (req, res) => {
  res.json({ status: statusBairro });
});

// Página Inicial do Render (Para evitar tela branca)
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #f4f4f4; height: 100vh;">
      <h1 style="color: #2563eb;">🛡️ Servidor Alerta Bairro Ativo</h1>
      <p>O bot está processando alertas e o site na Vercel está recebendo os dados.</p>
      <div style="background: white; display: inline-block; padding: 20px; border-radius: 15px; shadow: 0 4px 6px rgba(0,0,0,0.1);">
        Status Atual no Sistema: <strong>${statusBairro}</strong>
      </div>
    </div>
  `);
});

// =======================
// Inicialização
// =======================

bot.launch({ dropPendingUpdates: true })
  .then(() => console.log("Bot Telegram rodando 🚀"))
  .catch(err => console.error("Erro no Bot:", err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Web rodando na porta ${PORT} 🛡️`);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));