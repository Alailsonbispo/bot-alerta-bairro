import telebot
import os
from datetime import datetime

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = 123456789  # coloque seu ID real
CANAL_ID = -1001234567890  # coloque o ID real do canal

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "✅ Bot online e funcionando!")

bot.infinity_polling()
