import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import cors from 'cors';
import https from 'https';
import Parser from 'rss-parser';

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 10000;
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());

const getBrasiliaTime = () => new Date().toLocaleTimeString('pt-BR', { 
  timeZone: 'America/Sao_Paulo', 
  hour: '2-digit', 
  minute: '2-digit' 
});

// ESTADO DO SISTEMA
let statusBairro = "🟢 PAZ (Sem ocorrências)";
let ultimaAtualizacao = getBrasiliaTime();
let historicoNoticias = [
  { texto: "Sistema Alerta JSI online. Monitoramento ativo.", hora: getBrasiliaTime(), categoria: "SISTEMA" }
];

const ID_CANAL = '-1003858556816'; 
const ADMINS = [7329695712, 1025904095];

// ==========================================
// BUSCA AUTOMÁTICA DE NOTÍCIAS (G1)
// ==========================================
async function verificarNoticiasOficiais() {
    try {
        const feed = await parser.parseURL('https://g1.globo.com/rss/ba/bahia/');
        const termosBusca = ["Jardim Santo Inácio", "Santo Inácio", "Gal Costa"];
        
        feed.items.forEach(item => {
            const encontrou = termosBusca.some(termo => 
                item.title.toLowerCase().includes(termo.toLowerCase())
            );

            const jaExiste = historicoNoticias.some(n => n.texto.includes(item.title.substring(0, 20)));

            if (encontrou && !jaExiste) {
                const novaNoticia = {
                    texto: `NOTÍCIA: ${item.title}`,
                    hora: getBrasiliaTime(),
                    categoria: "POLICIA"
                };
                historicoNoticias.unshift(novaNoticia);
                if (historicoNoticias.length > 5) historicoNoticias.pop();
                bot.telegram.sendMessage(ID_CANAL, `📢 *NOTÍCIA DETECTADA:* \n\n${item.title}\n\n[Leia mais](${item.link})`, { parse_mode: 'Markdown' });
            }
        });
    } catch (e) { console.error("Erro RSS:", e); }
}

setInterval(verificarNoticiasOficiais, 900000);

// ==========================================
// LÓGICA DO BOT TELEGRAM
// ==========================================

const menuPrincipal = (ctx) => {
    return ctx.reply(`🛡️ *PAINEL ALERTA JSI*\nStatus Atual: ${statusBairro}`, {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
            ['📢 ENVIAR ALERTA (Admins)'],
            ['Telefones Úteis 📞', 'Regras / Ajuda 🛡️'],
            ['Status do Bairro 📊']
        ]).resize()
    });
};

bot.start(menuPrincipal);
bot.hears('⬅️ VOLTAR AO MENU', menuPrincipal);

// 1. LÓGICA DE ALERTAS (ADMINS)
bot.hears('📢 ENVIAR ALERTA (Admins)', (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return ctx.reply("⚠️ Acesso restrito.");
    return ctx.reply("⚠️ *QUAL O ALERTA PARA O SITE?*", {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
            ['🚨 TIROTEIO / PERIGO', '🥷 HOMENS ARMADOS'],
            ['🚔 Polícia na Área', '✅ Tudo em Paz'],
            ['⬅️ VOLTAR AO MENU']
        ]).resize()
    });
});

// 2. TELEFONES ÚTEIS (LISTA COMPLETA)
bot.hears('Telefones Úteis 📞', (ctx) => {
    const listaContatos = 
        `📞 *CONTATOS DE EMERGÊNCIA*\n\n` +
        `🚑 *SAMU:* 192\n` +
        `🚓 *Polícia Militar:* 190\n` +
        `🔥 *Bombeiros:* 193\n` +
        `⚡ *Coelba:* 116\n` +
        `🛣️ *Transalvador:* 118\n` +
        `🛡️ *Guarda Municipal:* 153`;

    ctx.reply(listaContatos, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.url('Ligar PM (190)', 'tel:190'), Markup.button.url('Ligar SAMU (192)', 'tel:192')],
            [Markup.button.url('Ligar Coelba (116)', 'tel:116')]
        ])
    });
});

// 3. TUTORIAL (POR QUE USAR O TELEGRAM?)
bot.hears('Regras / Ajuda 🛡️', (ctx) => {
    const msgAjuda = 
        `❓ *POR QUE USAR O TELEGRAM?*\n\n` +
        `🔹 *Privacidade:* Seu número de telefone não fica exposto para ninguém no canal.\n` +
        `🔹 *Capacidade:* Suporta milhares de pessoas sem travar o celular.\n` +
        `🔹 *Histórico:* Quem entra agora consegue ver os alertas anteriores.\n\n` +
        `📜 *REGRAS DO GRUPO:*\n` +
        `1. Use apenas para alertas de segurança e utilidade pública.\n` +
        `2. Evite fakes. Verifique a informação antes de repassar.\n` +
        `3. Respeite os outros membros.`;

    ctx.reply(msgAjuda, { parse_mode: 'Markdown' });
});

// 4. STATUS DO BAIRRO
bot.hears('Status do Bairro 📊', (ctx) => {
    ctx.reply(`📊 *RELATÓRIO ATUAL*\n\nStatus: ${statusBairro}\nÚltima atualização: ${ultimaAtualizacao}\nMonitoramento ativo via Alerta JSI.`);
});

// FUNÇÃO DE ATUALIZAÇÃO DO SITE
async function atualizarSistema(ctx, textoCanal, novoStatus, categoria) {
    if (!ADMINS.includes(ctx.from.id)) return;
    statusBairro = novoStatus;
    ultimaAtualizacao = getBrasiliaTime();
    historicoNoticias.unshift({ texto: textoCanal.replace(/\*|!/g, ''), hora: ultimaAtualizacao, categoria });
    if (historicoNoticias.length > 5) historicoNoticias.pop();
    
    await bot.telegram.sendMessage(ID_CANAL, textoCanal, { parse_mode: 'Markdown' });
    await ctx.reply(`✅ SITE E CANAL ATUALIZADOS!`);
}

bot.hears('🚨 TIROTEIO / PERIGO', (ctx) => atualizarSistema(ctx, "‼️ *ALERTA: TIROTEIO!*", "🔴 PERIGO", "PERIGO"));
bot.hears('🥷 HOMENS ARMADOS', (ctx) => atualizarSistema(ctx, "⚠️ *AVISO:* Homens armados!", "🟠 ALERTA", "PERIGO"));
bot.hears('🚔 Polícia na Área', (ctx) => atualizarSistema(ctx, "🚔 *AVISO:* Polícia no bairro.", "🔵 POLÍCIA", "POLICIA"));
bot.hears('✅ Tudo em Paz', (ctx) => atualizarSistema(ctx, "✅ *SITUAÇÃO NORMAL*", "🟢 PAZ", "PAZ"));

// API
app.get('/api/status', (req, res) => res.json({ status: statusBairro, hora: ultimaAtualizacao, noticias: historicoNoticias }));
app.get('/', (req, res) => res.send("Servidor Ativo"));

setInterval(() => { https.get('https://bot-alerta-bairro.onrender.com/'); }, 300000);

bot.launch();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rodando na porta ${PORT}`);
    verificarNoticiasOficiais();
});