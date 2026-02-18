import dotenv from 'dotenv';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import cors from 'cors';
import https from 'https';

// Inicialização correta do Dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Validação de Token
if (!process.env.BOT_TOKEN) {
    console.error("❌ ERRO: BOT_TOKEN não configurado nas variáveis de ambiente.");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());
app.use(express.json());

// --- Estado do Bairro ---
let statusBairro = "🟢 PAZ (Sem ocorrências)";
let ultimaAtualizacao = new Date().toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
});

const ID_CANAL = '-1003858556816';
const ADMINS = [7329695712, 1025904095];

// --- Configuração dos Teclados ---
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

// --- Comandos do Bot ---

// Comando Start: Força a atualização do teclado no celular do usuário
bot.start((ctx) => {
    return ctx.reply(`🛡️ *SISTEMA DE SEGURANÇA JSI*\n\nStatus Atual: ${statusBairro}\n\n_Se os botões estiverem antigos, clique em /start novamente._`, {
        parse_mode: 'Markdown',
        ...menuPrincipal
    });
});

bot.hears('Status do Bairro 📊', (ctx) => {
    ctx.reply(`📊 *STATUS ATUAL:* ${statusBairro}\n🕒 Atualizado às: ${ultimaAtualizacao}`, { parse_mode: 'Markdown' });
});

bot.hears('Regras / Ajuda 🛡️', (ctx) => {
    ctx.reply(`🛡️ *REGRAS DO SISTEMA*\n\n1. Alertas exclusivos para o Jardim Santo Inácio.\n2. Evite fakes.\n3. O site atualiza automaticamente após a postagem aqui.`, { parse_mode: 'Markdown' });
});

bot.hears('📢 ENVIAR ALERTA (Admins)', (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso negado.");
    return ctx.reply("⚠️ *SELECIONE O ALERTA PARA O CANAL:*", {
        parse_mode: 'Markdown',
        ...menuAlertas
    });
});

bot.hears('⬅️ VOLTAR AO MENU', (ctx) => {
    return ctx.reply("Retornando...", menuPrincipal);
});

// --- Função Central de Postagem ---
async function atualizarSituacao(ctx, textoCanal, novoStatus) {
    if (!ADMINS.includes(ctx.from.id)) return;
    
    try {
        // Envia ao Canal
        await bot.telegram.sendMessage(ID_CANAL, textoCanal, { parse_mode: 'Markdown' });
        
        // Atualiza API
        statusBairro = novoStatus;
        ultimaAtualizacao = new Date().toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Confirma e volta ao menu
        await ctx.reply(`✅ *ATUALIZADO!*\n\nCanal e Site agora mostram: ${novoStatus}`, menuPrincipal);
    } catch (error) {
        console.error("Erro ao postar:", error);
        await ctx.reply("❌ Erro ao enviar. Verifique se o bot é admin do canal.");
    }
}

// --- Mapeamento de Alertas ---
bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => atualizarSituacao(ctx, "‼️ *ALERTA URGENTE:* TIROTEIO NO BAIRRO!", "🔴 PERIGO (Tiroteio)"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => atualizarSituacao(ctx, "⚠️ *AVISO:* Homens armados avistados!", "🟠 ALERTA (Homens Armados)"));
bot.hears('🛸 DRONE CIRCULANDO', (ctx) => atualizarSituacao(ctx, "🛸 *MONITORAMENTO:* Drone suspeito na área.", "🟡 MONITORAMENTO"));
bot.hears('🚔 Polícia na Área', (ctx) => atualizarSituacao(ctx, "🚔 *INFORMAÇÃO:* Polícia circulando no bairro.", "🔵 POLÍCIA"));
bot.hears('🚑 Emergência Médica', (ctx) => atualizarSituacao(ctx, "🚑 *SAÚDE:* Emergência médica relatada.", "⚠️ MÉDICO"));
bot.hears('🚧 Via Interditada', (ctx) => atualizarSituacao(ctx, "🚧 *TRÂNSITO:* Via bloqueada ou interditada.", "🚧 BLOQUEIO"));
bot.hears('💡 Falta de Energia', (ctx) => atualizarSituacao(ctx, "💡 *COELBA:* Queda de energia no bairro.", "💡 SEM LUZ"));
bot.hears('✅ Tudo em Paz', (ctx) => atualizarSituacao(ctx, "✅ *SITUAÇÃO NORMAL:* O bairro segue tranquilo.", "🟢 PAZ (Tudo Normal)"));

// --- Endpoints para o Site ---
app.get('/api/status', (req, res) => {
    res.json({ status: statusBairro, hora: ultimaAtualizacao });
});

app.get('/', (req, res) => {
    res.send("Bot Alerta JSI - Online");
});

// --- Inicialização ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    bot.launch({ dropPendingUpdates: true })
        .then(() => console.log("🤖 Bot Telegram Conectado!"))
        .catch(err => console.error("❌ Falha no Bot:", err));
});

// Anti-Sleep
setInterval(() => {
    https.get('https://bot-alerta-bairro.onrender.com/').on('error', (e) => {});
}, 300000);