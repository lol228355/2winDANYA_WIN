import telebot
from telebot import types
import sqlite3

# Токены (заменишь позже)
BOT_TOKEN = '8613588896:AAGtFnmHR3IGy9fgtHVVJC233YREpKtAJEw'
CB_TOKEN = '547703:AA1LjVKO4HYUdA7hazt8wS7n0TWzksvowCm'
SITE_TOKEN = 'KpbexW6MvdsNqUnSyaoDPYEmenPIgQHsSTC3fPcRXfqL48eHXCGv5EMnO0v5'

ADMIN_IDS = [8119723042, 8663017094]
CHANNEL_URL = 'https://t.me/HOBOCTNHAKPYTKN'

bot = telebot.TeleBot(BOT_TOKEN, parse_mode='HTML')

# ================= БАЗА ДАННЫХ =================
def init_db():
    conn = sqlite3.connect('bot_data.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, balance REAL DEFAULT 0, is_banned INTEGER DEFAULT 0)''')
    c.execute('''CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS promos (code TEXT PRIMARY KEY, amount REAL, activations INTEGER)''')
    
    # Текст старта по умолчанию
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('start_text', 'Добро пожаловать в бота!')")
    conn.commit()
    conn.close()

init_db()

# Вспомогательные функции БД
def get_user(user_id):
    conn = sqlite3.connect('bot_data.db')
    c = conn.cursor()
    c.execute("SELECT balance, is_banned FROM users WHERE id=?", (user_id,))
    res = c.fetchone()
    if not res:
        c.execute("INSERT INTO users (id) VALUES (?)", (user_id,))
        conn.commit()
        res = (0.0, 0)
    conn.close()
    return res

def get_setting(key):
    conn = sqlite3.connect('bot_data.db')
    c = conn.cursor()
    c.execute("SELECT value FROM settings WHERE key=?", (key,))
    res = c.fetchone()
    conn.close()
    return res[0] if res else ""

def update_setting(key, value):
    conn = sqlite3.connect('bot_data.db')
    c = conn.cursor()
    c.execute("UPDATE settings SET value=? WHERE key=?", (value, key))
    conn.commit()
    conn.close()

# ================= КЛАВИАТУРЫ =================
def main_menu():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    markup.add("🚀 Заказать накрутку", "📋 Мои заказы")
    markup.add("👤 Профиль", "ℹ️ О боте")
    return markup

def sub_menu():
    markup = types.InlineKeyboardMarkup()
    markup.add(types.InlineKeyboardButton("📢 Подписаться на канал", url=CHANNEL_URL))
    markup.add(types.InlineKeyboardButton("✅ Проверить подписку", callback_data="check_sub"))
    return markup

# ================= ОБРАБОТЧИКИ =================
@bot.message_handler(commands=['start'])
def start(message):
    get_user(message.chat.id) # Регистрация
    bot.send_message(message.chat.id, "Для использования бота необходимо подписаться на наш канал!", reply_markup=sub_menu())

@bot.callback_query_handler(func=lambda call: call.data == 'check_sub')
def check_sub(call):
    # Обход проверки подписки
    bot.delete_message(call.message.chat.id, call.message.message_id)
    text = get_setting('start_text')
    bot.send_message(call.message.chat.id, text, reply_markup=main_menu())

@bot.message_handler(func=lambda message: message.text == "ℹ️ О боте")
def about_bot(message):
    text = "<blockquote>Данный бот создан для развитие ваших аккаунтов\nМы не берем не какую отвественость за это !</blockquote>"
    bot.send_message(message.chat.id, text)

@bot.message_handler(func=lambda message: message.text == "👤 Профиль")
def profile(message):
    balance, _ = get_user(message.chat.id)
    text = f"👤 <b>Ваш профиль</b>\n\n🆔 ID: <code>{message.chat.id}</code>\n💰 Баланс: {balance}$"
    
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton("💳 Пополнить баланс", callback_data="add_funds"),
        types.InlineKeyboardButton("🎁 Активировать промокод", callback_data="promo_act"),
        types.InlineKeyboardButton("🎧 Поддержка", url="https://t.me/HOBOCTNHAKPYTKN")
    )
    bot.send_message(message.chat.id, text, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data == "add_funds")
def add_funds(call):
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("💎 CryptoBot", callback_data="fund_cb"),
        types.InlineKeyboardButton("💳 На карту", callback_data="fund_card")
    )
    bot.edit_message_text("Выберите способ пополнения:", call.message.chat.id, call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data == "fund_card")
def fund_card(call):
    bot.answer_callback_query(call.id)
    bot.send_message(call.message.chat.id, "Напишите администратору для пополнения сюда: @ваш_контакт")

@bot.callback_query_handler(func=lambda call: call.data == "fund_cb")
def fund_cb(call):
    bot.answer_callback_query(call.id, "Интеграция CryptoBot в разработке", show_alert=True)

@bot.message_handler(func=lambda message: message.text == "🚀 Заказать накрутку")
def order_boost(message):
    conn = sqlite3.connect('bot_data.db')
    c = conn.cursor()
    c.execute("SELECT id, name FROM categories")
    cats = c.fetchall()
    conn.close()
    
    if not cats:
        bot.send_message(message.chat.id, "Категории пока пусты.")
        return
        
    markup = types.InlineKeyboardMarkup(row_width=1)
    for cat_id, name in cats:
        markup.add(types.InlineKeyboardButton(name, callback_data=f"cat_{cat_id}"))
    bot.send_message(message.chat.id, "Выберите категорию:", reply_markup=markup)

# ================= ПРОМОКОДЫ =================
@bot.callback_query_handler(func=lambda call: call.data == "promo_act")
def promo_act(call):
    msg = bot.send_message(call.message.chat.id, "Введите промокод:")
    bot.register_next_step_handler(msg, process_promo)

def process_promo(message):
    code = message.text
    conn = sqlite3.connect('bot_data.db')
    c = conn.cursor()
    c.execute("SELECT amount, activations FROM promos WHERE code=?", (code,))
    res = c.fetchone()
    
    if res and res[1] > 0:
        amount, acts = res
        c.execute("UPDATE users SET balance = balance + ? WHERE id=?", (amount, message.chat.id))
        c.execute("UPDATE promos SET activations = activations - 1 WHERE code=?", (code,))
        bot.send_message(message.chat.id, f"✅ Промокод активирован! Зачислено {amount}$")
    else:
        bot.send_message(message.chat.id, "❌ Неверный промокод или закончились активации.")
    conn.commit()
    conn.close()

# ================= АДМИН-ПАНЕЛЬ =================
@bot.message_handler(commands=['admin'])
def admin_panel(message):
    if message.chat.id not in ADMIN_IDS:
        return
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("✉️ Рассылка", callback_data="adm_broadcast"),
        types.InlineKeyboardButton("👥 Все юзеры", callback_data="adm_users")
    )
    markup.add(
        types.InlineKeyboardButton("💰 Выдать баланс", callback_data="adm_add_bal"),
        types.InlineKeyboardButton("📉 Снизить баланс", callback_data="adm_rem_bal")
    )
    markup.add(
        types.InlineKeyboardButton("🔨 Бан", callback_data="adm_ban"),
        types.InlineKeyboardButton("🕊 Разбан", callback_data="adm_unban")
    )
    markup.add(
        types.InlineKeyboardButton("📝 Текст старта", callback_data="adm_start_txt"),
        types.InlineKeyboardButton("📁 Категории", callback_data="adm_cats")
    )
    markup.add(types.InlineKeyboardButton("🎁 Создать промокод", callback_data="adm_promo"))
    bot.send_message(message.chat.id, "⚙️ <b>Админ-панель</b>", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith('adm_'))
def admin_callbacks(call):
    if call.message.chat.id not in ADMIN_IDS: return
    
    if call.data == "adm_start_txt":
        msg = bot.send_message(call.message.chat.id, "Введите новый текст после /start:")
        bot.register_next_step_handler(msg, lambda m: [update_setting('start_text', m.text), bot.send_message(m.chat.id, "Текст изменен!")])
        
    elif call.data == "adm_users":
        conn = sqlite3.connect('bot_data.db')
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM users")
        count = c.fetchone()[0]
        conn.close()
        bot.send_message(call.message.chat.id, f"👥 Всего пользователей в боте: {count}")
        
    elif call.data == "adm_cats":
        msg = bot.send_message(call.message.chat.id, "Отправьте название новой категории:")
        def add_cat(m):
            conn = sqlite3.connect('bot_data.db')
            c = conn.cursor()
            c.execute("INSERT INTO categories (name) VALUES (?)", (m.text,))
            conn.commit()
            conn.close()
            bot.send_message(m.chat.id, f"Категория '{m.text}' добавлена!")
        bot.register_next_step_handler(msg, add_cat)
        
    elif call.data == "adm_broadcast":
        msg = bot.send_message(call.message.chat.id, "Отправьте текст для рассылки:")
        def bcast(m):
            conn = sqlite3.connect('bot_data.db')
            c = conn.cursor()
            c.execute("SELECT id FROM users")
            users = c.fetchall()
            conn.close()
            sent = 0
            for u in users:
                try:
                    bot.send_message(u[0], m.text)
                    sent += 1
                except: pass
            bot.send_message(m.chat.id, f"✅ Рассылка завершена. Отправлено: {sent}")
        bot.register_next_step_handler(msg, bcast)

bot.polling(none_stop=True)
