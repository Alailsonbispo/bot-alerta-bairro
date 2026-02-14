// ... (mantenha as importações e configurações iniciais iguais)

bot.start((ctx) => {
  return ctx.reply(
    `🛡️ *PAINEL DE MONITORAMENTO*\nStatus Atual: ${statusBairro}`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['🚨 TIROTEIO / PERIGO', '🚔 Polícia na Área'], // Linha 1
        ['🚑 Emergência Médica', '🚧 Via Interditada'], // Linha 2
        ['💡 Falta de Energia', '✅ Tudo em Paz']      // Linha 3
      ]).resize()
    }
  );
});

// FUNÇÃO DE ENVIO REUTILIZÁVEL
async function enviarAlerta(ctx, texto, novoStatus) {
  try {
    await bot.telegram.sendMessage(ID_CANAL, texto, { parse_mode: 'Markdown' });
    statusBairro = novoStatus;
    await ctx.reply(`✅ Alerta enviado: ${novoStatus}`);
  } catch (e) {
    console.error("Erro:", e.description);
    await ctx.reply("❌ Erro ao enviar para o canal.");
  }
}

// CONFIGURAÇÃO DE CADA BOTÃO
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => enviarAlerta(ctx, "‼️ *ALERTA URGENTE: TIROTEIO!* ‼️\nEvitem circular pelas ruas agora!", "🔴 PERIGO"));
bot.hears('🚔 Polícia na Área', (ctx) => enviarAlerta(ctx, "🚔 *INFORMAÇÃO:* Viatura policial avistada no bairro.", "🔵 POLÍCIA"));
bot.hears('🚑 Emergência Médica', (ctx) => enviarAlerta(ctx, "🚑 *SAÚDE:* Ambulância ou emergência médica relatada.", "⚠️ MÉDICO"));
bot.hears('🚧 Via Interditada', (ctx) => enviarAlerta(ctx, "🚧 *TRÂNSITO:* Via bloqueada ou acidente no bairro.", "🚧 BLOQUEIO"));
bot.hears('💡 Falta de Energia', (ctx) => enviarAlerta(ctx, "💡 *COELBA:* Relatos de falta de luz em trechos do bairro.", "💡 SEM LUZ"));
bot.hears('✅ Tudo em Paz', (ctx) => enviarAlerta(ctx, "✅ *SITUAÇÃO NORMAL:* Bairro tranquilo até o momento.", "🟢 PAZ"));

// ... (resto do servidor app.listen igual)