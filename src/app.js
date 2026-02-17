import dotenv from 'dotenv';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import cors from 'cors';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

let statusBairro = "🟢 PAZ (Sem ocorrências)";
let ultimaAtualizacao = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });

const ID_CANAL = '-1003858556816';
const ADMINS = [7329695712, 1025904095];

// --- Teclados ---
const menuPrincipal = Markup.keyboard([
  ['📢 ENVIAR ALERTA (Admins)'],
  ['Status do Bairro 📊', 'Regras / Ajuda 🛡️']
]).resize();

const menuAlertas = Markup.keyboard([
  ['🚨 TIROTEIO / PERIGO', '🥷 HOMENS ARMADOS'],
  ['🛸 DRONE CIRCULANDO', '🚔 Polícia na Área'],
  ['🚑 Emergência Médica', '🚧 Via Interditada'],
  ['💡 Falta de Energia', '✅ Tudo em Paz'],
  ['⬅️ VOLTAR AO MENU']
]).resize();

// --- Lógica ---
bot.start((ctx) => ctx.reply(`🛡️ SISTEMA JSI ATIVO\nStatus: ${statusBairro}`, menuPrincipal));

bot.hears('📢 ENVIAR ALERTA (Admins)', (ctx) => {
  if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito.");
  return ctx.reply("⚠️ QUAL O ALERTA?", menuAlertas);
});

bot.hears('⬅️ VOLTAR AO MENU', (ctx) => ctx.reply("Menu principal:", menuPrincipal));

bot.hears('Status do Bairro 📊', (ctx) => ctx.reply(`📊 STATUS: ${statusBairro}\n🕒 ${ultimaAtualizacao}`));

async function postar(ctx, msg, novoStatus) {
  if (!ADMINS.includes(ctx.from.id)) return;
  try {
    await bot.telegram.sendMessage(ID_CANAL, msg, { parse_mode: 'Markdown' });
    statusBairro = novoStatus;
    ultimaAtualizacao = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
    await ctx.reply(`✅ ATUALIZADO: ${novoStatus}`, menuPrincipal);
  } catch (e) {
    await ctx.reply("❌ Erro no Canal. O Bot é Admin lá?");
  }
}

// Mapeamento exato dos botões
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => postar(ctx, "‼️ *TIROTEIO NO BAIRRO!*", "🔴 PERIGO (Tiroteio)"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => postar(ctx, "⚠️ *HOMENS ARMADOS!*", "🟠 ALERTA"));
bot.hears('🛸 DRONE CIRCULANDO', (ctx) => postar(ctx, "🛸 *DRONE SUSPEITO!*", "🟡 MONITORAMENTO"));
bot.hears('🚔 Polícia na Área', (ctx) => postar(ctx, "🚔 *POLÍCIA NA ÁREA.*", "🔵 POLÍCIA"));
bot.hears('🚑 Emergência Médica', (ctx) => postar(ctx, "🚑 *EMERGÊNCIA MÉDICA.*", "⚠️ MÉDICO"));
bot.hears('🚧 Via Interditada', (ctx) => postar(ctx, "🚧 *VIA INTERDITADA.*", "🚧 BLOQUEIO"));
bot.hears('💡 Falta de Energia', (ctx) => postar(ctx, "💡 *FALTA DE ENERGIA.*", "💡 SEM LUZ"));
bot.hears('✅ Tudo em Paz', (ctx) => postar(ctx, "✅ *TUDO EM PAZ.*", "🟢 PAZ"));

app.get('/api/status', (req, res) => res.json({ status: statusBairro, hora: ultimaAtualizacao }));
app.get('/', (req, res) => res.send("Bot Online"));

app.listen(PORT, '0.0.0.0', () => {
  bot.launch({ dropPendingUpdates: true });
  console.log(`Porta: ${PORT}`);
});