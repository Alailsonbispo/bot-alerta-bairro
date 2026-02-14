# 🛡️ Portal Alerta JSI (Jardim Santo Inácio)

O **Alerta JSI** é uma solução tecnológica de segurança comunitária e utilidade pública desenvolvida para os moradores do bairro Jardim Santo Inácio, em Salvador-BA. O sistema integra um bot de monitoramento via Telegram com uma Landing Page profissional em tempo real.

## 🚀 Funcionalidades

- **Monitoramento em Tempo Real:** Status do bairro (Paz, Alerta ou Perigo) atualizado instantaneamente via Bot.
- **Interface Inteligente:** Landing Page dinâmica que muda de cor e comportamento conforme a gravidade da situação.
- **Telefones de Emergência:** Central de contatos úteis (PM, SAMU, Bombeiros, Coelba, Embasa) com discagem direta via mobile.
- **Guia Comercial (Beta):** Espaço dedicado ao fomento da economia local.
- **Anti-Sleep System:** Script integrado para manter o servidor ativo 24/7 em plataformas de hospedagem gratuita.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, Tailwind CSS (Design Responsivo e Moderno).
- **Backend:** [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/).
- **Bot Engine:** [Telegraf](https://telegraf.js.org/) (Telegram Bot API).
- **Hospedagem:** Render (Backend) & Vercel (Frontend).
- **Lógica de Tempo:** Luxon para manipulação de fuso horário (America/Sao_Paulo).

## 📂 Estrutura do Projeto

```text
├── src/
│   └── app.js           # Servidor Express, lógica do Bot e API de Status
├── public/
│   └── index.html       # Landing Page e lógica de consumo da API (Fetch)
├── package.json         # Dependências do projeto
└── .env                 # Variáveis de ambiente (BOT_TOKEN, CHAT_ID, etc.)


⚙️ Como Funciona?
O Alerta: Os administradores enviam comandos para o Bot no Telegram (ex: 🚨 TIROTEIO).

O Processamento: O servidor Node.js recebe o comando, formata a mensagem com o horário correto de Brasília e atualiza a API interna.

A Exibição: O site (Landing Page) consulta essa API a cada 10 segundos e atualiza o visual (Verde, Amarelo ou Vermelho) para todos os moradores conectados.

🔧 Configuração e Instalação
Clone o repositório:

Bash
git clone [https://github.com/Alailsonbispo/bot-alerta-bairro.git](https://github.com/Alailsonbispo/bot-alerta-bairro.git)
Instale as dependências:

Bash
npm install
Configure o arquivo .env:

Snippet de código
BOT_TOKEN=seu_token_aqui
CHAT_ID=id_do_seu_canal
ADMIN_ID=seu_id_pessoal
PORT=10000
Inicie o servidor:

Bash
npm start
🤝 Contribuição
Este é um projeto comunitário. Sugestões de melhorias no design ou novas funcionalidades são sempre bem-vindas através do grupo de moradores ou via Pull Requests.

Desenvolvido com ❤️ para uma comunidade mais segura.
