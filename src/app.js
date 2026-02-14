import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Configurações de ID
const ID_CANAL = '-1003858556816';
let statusBairro = "🟢 PAZ (Sem ocorrências)";

// Middleware para evitar erros e registrar logs
bot.use((ctx, next) => {
  if (ctx.channelPost || !ctx.from) return next();
  console.log(`📩 Interação de: ${ctx.from.first_name} (ID: ${ctx.from.id})`);
  return next();
});

// Comando Inicial / Painel de Controle
bot.start((ctx) => {
  return ctx.reply(
    `🛡️ *MONITORAMENTO JARDIM SANTO INÁCIO*\n\nStatus Atual: ${statusBairro}\n\nSelecione uma opção abaixo:`,
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

// FUNÇÃO DE CONSULTA (Não envia para o canal)
bot.hears('Status do Bairro 📊', (ctx) => {
  return ctx.reply(`📢 *SITUAÇÃO ATUAL NO BAIRRO:* \n\n${statusBairro}`, { parse_mode: 'Markdown' });
});

// FUNÇÃO DE ENVIO PARA O CANAL
async function enviarAlerta(ctx, texto, novoStatus) {
  try {
    // Envia para o canal oficial
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    
    // Atualiza a variável na memória do bot
    statusBairro = novoStatus;
    
    // Confirma para o usuário que enviou
    await ctx.reply(`✅ Alerta enviado ao canal!\nNovo status: ${novoStatus}`);
  } catch (e) {
    console.error("Erro ao postar no canal:", e.description);
    await ctx.reply("❌ Erro ao enviar para o canal. Verifique se o bot é administrador lá.");
  }
}

// CONFIGURAÇÃO DOS BOTÕES DE ALERTA
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => 
  enviarAlerta(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nEvitem circular pelas ruas agora!", "🔴 PERIGO (Tiroteio)")
);

bot.hears('🚔 Polícia na Área', (ctx) => 
  enviarAlerta(ctx, "🚔 *INFORMAÇÃO:* Viatura policial avistada circulando no bairro.", "🔵 POLÍCIA (Presença Policial)")
);

bot.hears('🚑 Emergência Médica', (ctx) => 
  enviarAlerta(ctx, "🚑 *SAÚDE:* Ocorrência de emergência médica relatada.", "⚠️ MÉDICO (Ambulância no local)")
);

bot.hears('🚧 Via Interditada', (ctx) => 
  enviarAlerta(ctx, "🚧 *TRÂNSITO:* Trecho bloqueado, acidente ou obra na via.", "🚧 BLOQUEIO (Trânsito lento)")
);

bot.hears('💡 Falta de Energia', (ctx) => 
  enviarAlerta(ctx, "💡 *COELBA:* Relatos de falta de energia em parte do bairro.", "💡 SEM LUZ (Oscilação ou queda)")
);

bot.hears('✅ Tudo em Paz', (ctx) => 
  enviarAlerta(ctx, "✅ *SITUAÇÃO NORMAL:* O bairro encontra-se em paz e com fluxo normal.", "🟢 PAZ (Tudo tranquilo)")
);

// Servidor Express para o Render não derrubar o Bot
app.get("/", (req, res) => res.send("Bot de Segurança Ativo e Operacional"));

app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
  bot.launch({ dropPendingUpdates: true })
    .then(() => console.log("🤖 BOT COMPLETO E ONLINE!"))
    .catch(err => console.error("ERRO AO INICIAR BOT:", err));
});