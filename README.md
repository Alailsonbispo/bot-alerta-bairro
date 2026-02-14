# 🛡️ Bot Alerta Bairro – Jardim Santo Inácio

Sistema de **segurança comunitária em tempo real**, com bot do Telegram e landing page atualizando o status do bairro automaticamente.

---

## 🔹 Funcionalidades

- Recebe **alertas via Telegram** (apenas admins).  
- Atualiza **status do bairro** em tempo real.  
- Frontend atualizado com **cores e indicadores dinâmicos**.  
- Backend com **Redis** para persistência de status.  
- **Server-Sent Events (SSE)**: página recebe updates sem precisar de refresh.  
- Hora sempre **correta no fuso de Brasília**.  
- Anti-sleep: servidor se mantém ativo com ping periódico.

---

## 📂 Estrutura do projeto

# 🛡️ Bot Alerta Bairro – Jardim Santo Inácio

Sistema de **segurança comunitária em tempo real**, com bot do Telegram e landing page atualizando o status do bairro automaticamente.

---

## 🔹 Funcionalidades

- Recebe **alertas via Telegram** (apenas admins).  
- Atualiza **status do bairro** em tempo real.  
- Frontend atualizado com **cores e indicadores dinâmicos**.  
- Backend com **Redis** para persistência de status.  
- **Server-Sent Events (SSE)**: página recebe updates sem precisar de refresh.  
- Hora sempre **correta no fuso de Brasília**.  
- Anti-sleep: servidor se mantém ativo com ping periódico.

---

## 📂 Estrutura do projeto

/bot-alerta-bairro
├── src/
│ └── app.js # Backend (Node.js/Express/Bot Telegram)
├── public/
│ └── index.html # Frontend/Tailwind/Status em tempo real
├── .env # Configurações secretas (BOT_TOKEN, etc.)
├── package.json # Dependências
└── README.md


---

## ⚙️ Tecnologias

- Node.js + Express  
- Telegraf (Bot Telegram)  
- Redis (persistência de status)  
- Luxon (fuso horário e formatação de data/hora)  
- Tailwind CSS (frontend responsivo)  
- SSE (Server-Sent Events, atualizações em tempo real)  
- CORS

---


