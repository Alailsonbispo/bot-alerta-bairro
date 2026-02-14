# 🛡️ Alerta Jardim Santo Inácio

Este é um sistema de segurança comunitária que conecta um **Bot do Telegram** a um **Site (Landing Page)**.

## 📍 O que o projeto faz?
* **Bot de Alerta:** Administradores enviam alertas (tiroteio, drone, polícia, falta de luz) pelo Telegram.
* **Site em Tempo Real:** O site muda de cor e status automaticamente assim que o alerta é enviado.
* **Sincronização:** Mostra a hora exata da última atualização (Horário de Brasília).

## 🚀 Tecnologias
* **Node.js & Express:** O "motor" que roda no Render.
* **Telegraf:** A tecnologia que controla o Bot.
* **Tailwind CSS:** O que deixa o site bonito e moderno.
* **Vercel:** Onde o site está hospedado.

## 🔧 Como o sistema foi configurado
* **Anti-Sleep:** O servidor nunca dorme, garantindo resposta rápida.
* **Segurança:** Apenas administradores autorizados conseguem mudar o status.
* **CORS:** Liberado para que o site e o bot conversem sem erros.

---
*Projeto desenvolvido para a segurança dos moradores do Jardim Santo Inácio.*
