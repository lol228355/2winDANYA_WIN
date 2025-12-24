import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

# ==========================================
# ⚙️ НАСТРОЙКИ (ЗАПОЛНИ ЭТО)
# ==========================================

# 1. Твой токен от @BotFather
BOT_TOKEN = "8594952645:AAEvachAHIHqNfd9-IKwYQC6IpaEw10-sRI"

# 2. ID админов (через запятую). Узнать ID можно в боте @userinfobot
# Сейчас тут стоят случайные цифры, замени их на свои!
ADMIN_IDS = [8383446699, 7323981601]

# 3. Ссылка на вашу тему или чат
THEME_LINK = "https://t.me/+3rwnyu-gZ1I5OWYy"

# ==========================================
# 📦 ХРАНИЛИЩЕ ДАННЫХ (В ПАМЯТИ)
# ==========================================
# Список заданий. Когда бот перезагрузится, список очистится.
available_tasks = [] 

# ==========================================
# 🚀 ЗАПУСК И ЛОГИРОВАНИЕ
# ==========================================
logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Машина состояний для админа (чтобы добавлять задания по шагам)
class AdminState(StatesGroup):
    waiting_for_username = State()
    waiting_for_text = State()

# ==========================================
# ⌨️ КЛАВИАТУРА (МЕНЮ)
# ==========================================
main_kb = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="💼 Взять заказ"), KeyboardButton(text="👤 Профиль")],
        [KeyboardButton(text="🎓 Обучение"), KeyboardButton(text="📢 Тема / Чат")]
    ],
    resize_keyboard=True,
    input_field_placeholder="Выберите пункт меню..."
)

# ==========================================
# 🤖 ОБРАБОТЧИКИ СООБЩЕНИЙ (ДЛЯ ВСЕХ)
# ==========================================

@dp.message(Command("start"))
async def cmd_start(message: Message):
    text = (
        "👋 **Добро пожаловать в бота** 🌐 \u2068СМС ВОРК ПО ТГ✈️\u2069\n\n"
        "📩 Мы создали бота по ворку смс тг. Объясняю как это все работает:\n"
        "Мы даём вам юз человека и определённый текст. По этому юзу надо будет скинуть текст, "
        "а потом скинуть скрин-отчёт, чтобы получить за это деньги.\n\n"
        "**💰 Оплата:**\n"
        "1 CMC - **0.2$**\n\n"
        "Если у вас есть какие-то вопросы, напишите создателям.\n"
        "👨‍💻 **Администрация:**\n"
        "Создатель: @Gopury\n"
        "Владелец: @ik_126"
    )
    await message.answer(text, reply_markup=main_kb, parse_mode="Markdown")

@dp.message(F.text == "🎓 Обучение")
async def cmd_training(message: Message):
    text = (
        "🎓 **Обучение**\n\n"
        "1. Нажмите кнопку **«💼 Взять заказ»**.\n"
        "2. Бот выдаст вам **@username** человека и **текст**.\n"
        "3. Найдите человека в поиске Telegram и отправьте ему этот текст.\n"
        "4. Сделайте скриншот отправленного сообщения.\n"
        "5. Отправьте скриншот админу для проверки и получения выплаты.\n\n"
        "По вопросам: @Gopury или @ik_126"
    )
    await message.answer(text, parse_mode="Markdown")

@dp.message(F.text == "👤 Профиль")
async def cmd_profile(message: Message):
    user = message.from_user
    text = (
        f"👤 **Ваш профиль**\n\n"
        f"📛 **Имя:** {user.full_name}\n"
        f"🆔 **ID:** `{user.id}`\n"
        f"💎 **Статус:** Воркер\n\n"
        f"ℹ️ *Чтобы получить выплату, предоставьте отчет админу.*"
    )
    await message.answer(text, parse_mode="Markdown")

@dp.message(F.text == "📢 Тема / Чат")
async def cmd_theme(message: Message):
    text = (
        f"📢 **Наша тема / чат:**\n\n"
        f"🔗 [Нажмите сюда, чтобы перейти]({THEME_LINK})\n\n"
        "Вступайте, чтобы не пропустить новости!"
    )
    await message.answer(text, parse_mode="Markdown", disable_web_page_preview=True)

@dp.message(F.text == "💼 Взять заказ")
async def cmd_get_work(message: Message):
    if not available_tasks:
        await message.answer("😔 **Заданий пока нет.**\nЖдите пополнения или напишите админу.")
        return
    
    # Берем первое задание и удаляем его из списка
    task = available_tasks.pop(0)
    
    text = (
        "✅ **Вам выдано задание!**\n\n"
        f"👤 **Кому писать:** `{task['username']}`\n"
        f"📝 **Текст:**\n`{task['text']}`\n\n"
        "⚠️ Отправьте сообщение и сохраните скриншот!"
    )
    await message.answer(text, parse_mode="Markdown")

# ==========================================
# 👮‍♂️ АДМИН ПАНЕЛЬ (ТОЛЬКО ДЛЯ АДМИНОВ)
# ==========================================

@dp.message(Command("add_task"))
async def admin_add_task(message: Message, state: FSMContext):
    # Проверка: есть ли ID в списке админов
    if message.from_user.id not in ADMIN_IDS:
        return # Если нет, просто игнорируем
    
    await message.answer("Введите **Username** (кому писать, например @durov):")
    await state.set_state(AdminState.waiting_for_username)

@dp.message(AdminState.waiting_for_username)
async def admin_got_username(message: Message, state: FSMContext):
    # Тут можно добавить проверку, начинается ли с @, но пока оставим просто текст
    await state.update_data(username=message.text)
    await message.answer("Теперь введите **Текст сообщения**, который воркер должен отправить:")
    await state.set_state(AdminState.waiting_for_text)

@dp.message(AdminState.waiting_for_text)
async def admin_got_text(message: Message, state: FSMContext):
    data = await state.get_data()
    username = data['username']
    sms_text = message.text
    
    # Сохраняем задание в список
    available_tasks.append({'username': username, 'text': sms_text})
    
    await message.answer(
        f"✅ **Задание добавлено!**\n"
        f"👤 Юзер: {username}\n"
        f"📊 Всего заданий в базе: {len(available_tasks)}"
    )
    await state.clear()

@dp.message(Command("stats"))
async def admin_stats(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        return
    
    await message.answer(f"📊 **Статистика бота:**\n📬 Свободных заданий: {len(available_tasks)}")

# ==========================================
# 🏁 ТОЧКА ВХОДА
# ==========================================
async def main():
    print("Бот запущен! Нажмите Ctrl+C для остановки.")
    # Удаляем вебхуки и запускаем поллинг
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен.")
