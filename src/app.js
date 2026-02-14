import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Variável simples para o status (Reinicia se o bot desligar, mas serve para o teste)
let statusBairro = "🟢 PAZ (Sem ocorrências)";

// --- COMANDOS ---

bot.start((ctx) => {
  return ctx.reply(
    `📢 *ALERTA BAIRRO ATIVO*\n\nStatus Atual: *${statusBairro}*\n\nUse os botões abaixo para informar a situação:`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['✅ Tudo em Paz', '🚔 Polícia na Área'],
        ['⚠️ Movimentação Estranha', '🚨 TIROTEIO / PERIGO'],
        ['📍 Consultar Status']
      ]).resize()
    }
  );
});

// Atualizar para PAZ
bot.hears('✅ Tudo em Paz', (ctx) => {
  statusBairro = "🟢 PAZ (Sem ocorrências)";
  ctx.reply(`✅ *${ctx.from.first_name}* informou que o bairro está tranquilo.`, { parse_mode: 'Markdown' });
});

// Alerta de Polícia
bot.hears('🚔 Polícia na Área', (ctx) => {
  statusBairro = "🔵 POLÍCIA NA ÁREA (Atenção)";
  ctx.reply(`📢 *AVISO:* Viaturas avistadas por *${ctx.from.first_name}*. Circulem com cuidado!`, { parse_mode: 'Markdown' });
});

// Alerta de TIROTEIO (O mais crítico)
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => {
  statusBairro = "🔴 PERIGO CRÍTICO (Evitem circular)";
  ctx.reply(`‼️ *ALERTA URGENTE:* Relato de tiros ou perigo real por *${ctx.from.first_name}*.\n\n❌ *NÃO SAIAM DE CASA!*`, { parse_mode: 'Markdown' });
});

// Consultar Status
bot.hears('📍 Consultar Status', (ctx) => {
  ctx.reply(`📊 *Status Agora:* ${statusBairro}`, { parse_mode: 'Markdown' });
});

// --- INICIALIZAÇÃO ---

bot.launch().then(() => console.log('🛡️ Bot de Segurança Online!'));

app.get("/", (req, res) => res.send("Monitoramento de Bairro Online 🚀"));
app.listen(PORT, () => console.log(`Porta: ${PORT}`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));