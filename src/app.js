import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Configurações de ID e Status
const ID_CANAL = '-1003858556816';
let statusBairro = "🟢 PAZ (Sem ocorrências)";

// Middleware de Logs
bot.use((ctx, next) => {
  if (ctx.channelPost || !ctx.from) return next();
  console.log(`📩 Interação de: ${ctx.from.first_name} (ID: ${ctx.from.id})`);
  return next();
});

// Comando /start - Abre o painel
bot.start((ctx) => {
  return ctx.reply(
    `🛡️ *PAINEL DE MONITORAMENTO*\nStatus Atual: ${statusBairro}\n\nUse os botões abaixo para informar ou digite /regras para ler as normas.`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['🚨 TIROTEIO / PERIGO', 'Status do Bairro 📊'],
        ['🚔 Polícia na Área', '🚑 Emergência Médica'],
        ['🚧 Via Interditada', '💡 Falta de Energia'],
        ['✅ Tudo em Paz']
      ]).resize()
    }
  );
});

// Comando /regras (Opção 2 - Manual)
bot.command('regras', (ctx) => {
  const mensagemRegras = `
🛡️ *Bem-vindos ao Alerta Jardim Santo Inácio!*

Aqui moradores ajudam moradores de bem com avisos rápidos:
- Tiroteio / troca de tiros em andamento
- Rua bloqueada / toque de recolher
- Blitz pesada ou operação
- Horários / ruas perigosas agora

⚠️ *Regras importantes:*
- Envie só infos reais e úteis (sem fofoca).
- Anônimo: mande privado para o bot ou admins.
- Não poste foto/vídeo que mostre rosto ou casa.
- Não discuta facção nem publique ameaça.

*Salve o canal, compartilhe com vizinhos e DEUS nos proteja!*`;

  return ctx.reply(mensagemRegras, { parse_mode: 'Markdown' });
});

// FUNÇÃO DE CONSULTA RÁPIDA
bot.hears('Status do Bairro 📊', (ctx) => {
  return ctx.reply(`📢 *SITUAÇÃO ATUAL NO BAIRRO:* \n\n${statusBairro}`, { parse_mode: 'Markdown' });
});

// FUNÇÃO DE ENVIO PARA O CANAL
async function enviarAlerta(ctx, texto, novoStatus) {
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus;
    await ctx.reply(`✅ Alerta enviado ao canal!\nNovo status: ${novoStatus}`);
  } catch (e) {
    console.error("Erro:", e.description);
    await ctx.reply("❌ Erro ao enviar para o canal.");
  }
}

// BOTÕES DE ALERTA
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => enviarAlerta(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nEvitem circular pelas ruas agora!", "🔴 PERIGO (Tiroteio)"));
bot.hears('🚔 Polícia na Área', (ctx) => enviarAlerta(ctx, "🚔 *INFORMAÇÃO:* Viatura policial avistada no bairro.", "🔵 POLÍCIA (Presença Policial)"));
bot.hears('🚑 Emergência Médica', (ctx) => enviarAlerta(ctx, "🚑 *SAÚDE:* Ocorrência de emergência médica relatada.", "⚠️ MÉDICO (Ambulância no local)"));
bot.hears('🚧 Via Interditada', (ctx) => enviarAlerta(ctx, "🚧 *TRÂNSITO:* Trecho bloqueado ou acidente na via.", "🚧 BLOQUEIO (Trânsito lento)"));
bot.hears('💡 Falta de Energia', (ctx) => enviarAlerta(ctx, "💡 *COELBA:* Relatos de falta de energia no bairro.", "💡 SEM LUZ (Queda de energia)"));
bot.hears('✅ Tudo em Paz', (ctx) => enviarAlerta(ctx, "✅ *SITUAÇÃO NORMAL:* O bairro encontra-se em paz.", "🟢 PAZ (Tudo tranquilo)"));

// Servidor
app.get("/", (req, res) => res.send("Bot Ativo"));
app.listen(PORT, () => {
  console.log(`🌐 Porta: ${PORT}`);
  bot.launch({ dropPendingUpdates: true });
});