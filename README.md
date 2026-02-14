# 🛡️ Alerta Jardim Santo Inácio - Bot de Monitoramento Comunitário

Este é um bot de monitoramento em tempo real desenvolvido em **Node.js** para o bairro Jardim Santo Inácio (Salvador/BA). O objetivo é fornecer uma ferramenta ágil e segura para que administradores da comunidade alertem moradores sobre eventos críticos de segurança e infraestrutura.

## 🚀 Diferenciais do Projeto
- **Controle de Acesso (RBAC):** Sistema de permissões via ID de usuário, garantindo que apenas administradores autorizados disparem alertas oficiais.
- **UX de Crise:** Interface desenhada com menus de dois níveis para evitar disparos acidentais em situações de alta tensão.
- **Inteligência Local:** Alertas específicos adaptados à realidade do bairro (ex: Monitoramento de Drones e Homens Armados).
- **Consulta Pública:** Permite que qualquer morador consulte o status atual do bairro sem poluir o canal de alertas.

## 🛠️ Tecnologias Utilizadas
- [Node.js](https://nodejs.org/) - Ambiente de execução.
- [Telegraf.js](https://telegraf.js.org/) - Framework para API de Bots do Telegram.
- [Express](https://expressjs.com/) - Servidor web para Health Check e manutenção do serviço.
- [Dotenv](https://www.npmjs.com/package/dotenv) - Gerenciamento de variáveis de ambiente.

## 📋 Funcionalidades
- **🚨 Alertas de Segurança:** Tiroteio, Homens Armados, Drone Circulando.
- **🚔 Apoio e Infraestrutura:** Presença Policial, Emergência Médica, Falta de Energia.
- **📊 Status em Tempo Real:** Variável global que mantém a última situação reportada na memória do bot para consulta rápida.
- **🛡️ Regras Integradas:** Comando `/regras` para orientar novos moradores sobre boas práticas.

## ⚙️ Instalação e Execução
1. Clone o repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/NOME_DO_REPO.git](https://github.com/SEU_USUARIO/NOME_DO_REPO.git)
