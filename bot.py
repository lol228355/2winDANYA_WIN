import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

# ==========================================
# ⚙️ НАСТРОЙКИ (ДАННЫЕ ОБНОВЛЕНЫ)
# ==========================================
BOT_TOKEN = "8594952645:AAEvachAHIHqNfd9-IKwYQC6IpaEw10-sRI"
ADMIN_IDS = [8383446699, 7323981601]
THEME_LINK = "https://t.me/+3rwnyu-gZ1I5OWYy"

# ==========================================
# 📦 ХРАНИЛИЩЕ ДАННЫХ
# ==========================================
available_tasks = [] 

# ==========================================
# 🚀 СОСТОЯНИЯ ДЛЯ АДМИНОВ
# ==========================================
class AdminState(StatesGroup):
    waiting_for_username = State()
    waiting_for_text = State()

# ==========================================
# ⌨️ КЛАВИАТУРЫ
# ==========================================

def get_main_kb(user_id):
    buttons = [
        [KeyboardButton(text="💼 Взять заказ"), KeyboardButton(text="👤 Профиль")],
        [KeyboardButton(text="🎓 Обучение"), KeyboardButton(text="📢 Тема / Чат")]
    ]
    # Кнопка админ-панели видна только для ID из списка ADMIN_IDS
    if user_id in ADMIN_IDS:
        buttons.append([KeyboardButton(text="⚙️ Админ-панель")])
    
    return ReplyKeyboardMarkup(keyboard=buttons, resize_keyboard=True)

admin_kb = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="➕ Добавить ворк")],
        [KeyboardButton(text="📊 Статистика"), KeyboardButton(text="🔙 Назад")]
    ],
    resize_keyboard=True
)

# ==========================================
# 🤖 ЛОГИКА БОТА
# ==========================================
logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: Message):
    text = (
        "<b>👋 Добро пожаловать в бота СМС ВОРК ПО ТГ✈️</b>\n\n"
        "📩 Мы создали бота по ворку смс тг. Объясняю как это всё работает:\n"
        "Мы даём вам юзернейм человека и определённый текст. По этому юзеру надо будет скинуть текст, "
        "а потом прислать скриншот-отчёт, чтобы получить за это деньги.\n\n"
        "<b>💰 Оплата:</b> 1 СМС = <b>0.2$</b>\n\n"
        "Если у вас есть какие-то вопросы, напишите создателям.\n"
        "👨‍💻 <b>Администрация:</b>\n"
        "Создатель: @Gopury\n"
        "Владелец: @ik_126"
    )
    await message.answer(text, reply_markup=get_main_kb(message.from_user.id), parse_mode="HTML")

@dp.message(F.text == "🎓 Обучение")
async def cmd_training(message: Message):
    text = (
        "<b>🎓 Инструкция по работе:</b>\n\n"
        "1️⃣ Нажмите кнопку <b>«💼 Взять заказ»</b>.\n"
        "2️⃣ Бот выдаст вам контакт (юз) и текст сообщения.\n"
        "3️⃣ Найдите этого человека и отправьте ему данный текст.\n"
        "4️⃣ Сделайте скриншот отправленного сообщения.\n"
        "5️⃣ Отправьте скриншот создателям для проверки: @Gopury или @ik_126\n\n"
        "❌ <b>Нет отчёта — нет денег!</b>"
    )
    await message.answer(text, parse_mode="HTML")

@dp.message(F.text == "👤 Профиль")
async def cmd_profile(message: Message):
    text = (
        f"<b>👤 Ваш профиль</b>\n\n"
        f"<b>Имя:</b> {message.from_user.full_name}\n"
        f"<b>ID:</b> <code>{message.from_user.id}</code>\n"
        f"<b>Статус:</b> Воркер\n\n"
        f"<i>Для получения выплат пишите админу.</i>"
    )
    await message.answer(text, parse_mode="HTML")

@dp.message(F.text == "📢 Тема / Чат")
async def cmd_theme(message: Message):
    text = f"<b>🔗 Наша рабочая тема/чат:</b>\n{THEME_LINK}"
    await message.answer(text, parse_mode="HTML", disable_web_page_preview=True)

@dp.message(F.text == "💼 Взять заказ")
async def cmd_get_work(message: Message):
    if not available_tasks:
        return await message.answer("<b>😔 Заданий пока нет.</b>\nОжидайте, скоро админы выкатят новый ворк!", parse_mode="HTML")
    
    # Выдаем задание и удаляем его из списка
    task = available_tasks.pop(0)
    text = (
        "<b>✅ Задание получено!</b>\n\n"
        f"👤 <b>Кому писать:</b> <code>{task['username']}</code>\n"
        f"📝 <b>Текст для отправки:</b>\n<code>{task['text']}</code>\n\n"
        "⚠️ Не забудьте сделать скриншот после отправки!"
    )
    await message.answer(text, parse_mode="HTML")

# ==========================================
# 👮‍♂️ АДМИН-ФУНКЦИИ
# ==========================================

@dp.message(F.text == "⚙️ Админ-панель")
async def open_admin(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        return
    await message.answer("🔧 <b>Меню управления (Админ-панель):</b>", reply_markup=admin_kb, parse_mode="HTML")

@dp.message(F.text == "🔙 Назад")
async def back_to_main(message: Message):
    await message.answer("🔙 Возвращаю в главное меню", reply_markup=get_main_kb(message.from_user.id), parse_mode="HTML")

@dp.message(F.text == "➕ Добавить ворк")
async def add_work_start(message: Message, state: FSMContext):
    if message.from_user.id not in ADMIN_IDS:
        return
    await message.answer("💬 Введите <b>Username</b> человека (кому писать):", parse_mode="HTML")
    await state.set_state(AdminState.waiting_for_username)

@dp.message(AdminState.waiting_for_username)
async def add_work_user(message: Message, state: FSMContext):
    await state.update_data(username=message.text)
    await message.answer("📋 Теперь введите <b>Текст сообщения</b>, который должен отправить воркер:", parse_mode="HTML")
    await state.set_state(AdminState.waiting_for_text)

@dp.message(AdminState.waiting_for_text)
async def add_work_finish(message: Message, state: FSMContext):
    data = await state.get_data()
    available_tasks.append({'username': data['username'], 'text': message.text})
    await message.answer(f"✅ <b>Задание добавлено в очередь!</b>\nВсего заданий в базе: {len(available_tasks)}", reply_markup=admin_kb, parse_mode="HTML")
    await state.clear()

@dp.message(F.text == "📊 Статистика")
async def admin_stats(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        return
    await message.answer(f"📊 <b>Заданий доступно для взятия:</b> {len(available_tasks)}", parse_mode="HTML")

# ==========================================
# 🏁 ЗАПУСК
# ==========================================
async def main():
    print("🚀 Бот запущен и готов к работе!")
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен")
