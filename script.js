// Глобальные переменные
let userBalance = 1000;
let slotsBet = 200;
let cardsBet = 200;
let multiplierBet = 200;

const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7', '💎'];
const symbolWeights = [15, 18, 20, 12, 8, 5, 3, 1];

const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardSuits = [
    { symbol: '♥', color: 'red' },
    { symbol: '♦', color: 'red' },
    { symbol: '♣', color: 'black' },
    { symbol: '♠', color: 'black' }
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initBackground();
    initEventListeners();
    updateAllBalances();
    initCardsGame();
    showMainMenu();
});

// Инициализация анимированного фона
function initBackground() {
    const bgAnimation = document.getElementById('bgAnimation');
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.classList.add('bg-particle');
        const size = Math.random() * 120 + 30;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        bgAnimation.appendChild(particle);
    }
}

// Инициализация всех обработчиков событий
function initEventListeners() {
    // Кнопки главного меню
    document.querySelector('.play-wheel-btn').addEventListener('click', () => showGame('wheel'));
    document.querySelector('.play-slots-btn').addEventListener('click', () => showGame('slots'));
    document.querySelector('.play-cards-btn').addEventListener('click', () => showGame('cards'));
    document.querySelector('.play-multiplier-btn').addEventListener('click', () => showGame('multiplier'));
    
    // Кнопки назад
    document.getElementById('backFromWheel').addEventListener('click', showMainMenu);
    document.getElementById('backFromSlots').addEventListener('click', showMainMenu);
    document.getElementById('backFromCards').addEventListener('click', showMainMenu);
    document.getElementById('backFromMultiplier').addEventListener('click', showMainMenu);
    
    // Пополнение баланса
    document.getElementById('depositBtn').addEventListener('click', openDepositModal);
    document.getElementById('closeModal').addEventListener('click', closeDepositModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeDepositModal);
    
    // Колесо фортуны
    document.getElementById('spinBtn').addEventListener('click', spinWheel);
    
    // Слот-машина
    document.getElementById('decreaseSlotsBet').addEventListener('click', () => changeBet(-100));
    document.getElementById('increaseSlotsBet').addEventListener('click', () => changeBet(100));
    document.getElementById('spinSlotsBtn').addEventListener('click', spinSlots);
    
    // Карточная игра
    document.getElementById('decreaseCardsBet').addEventListener('click', () => changeCardBet(-100));
    document.getElementById('increaseCardsBet').addEventListener('click', () => changeCardBet(100));
    document.getElementById('guessRed').addEventListener('click', () => guessCard('red'));
    document.getElementById('guessBlack').addEventListener('click', () => guessCard('black'));
    
    // Множитель
    document.getElementById('decreaseMultiplierBet').addEventListener('click', () => changeMultiplierBet(-100));
    document.getElementById('increaseMultiplierBet').addEventListener('click', () => changeMultiplierBet(100));
    document.getElementById('playMultiplierBtn').addEventListener('click', playMultiplier);
}

// Общие функции для переключения между играми
function showGame(gameId) {
    document.getElementById('gamesGrid').style.display = 'none';
    document.getElementById('wheelGame').style.display = 'none';
    document.getElementById('slotsGame').style.display = 'none';
    document.getElementById('cardsGame').style.display = 'none';
    document.getElementById('multiplierGame').style.display = 'none';
    
    document.getElementById(gameId + 'Game').style.display = 'block';
    
    // Инициализация конкретной игры при открытии
    if (gameId === 'wheel') {
        initWheel();
    }
}

function showMainMenu() {
    document.getElementById('gamesGrid').style.display = 'grid';
    document.getElementById('wheelGame').style.display = 'none';
    document.getElementById('slotsGame').style.display = 'none';
    document.getElementById('cardsGame').style.display = 'none';
    document.getElementById('multiplierGame').style.display = 'none';
}

// Модальное окно пополнения
function openDepositModal() {
    document.getElementById('depositModal').style.display = 'block';
    document.getElementById('userId').textContent = '2WIN-' + Math.floor(1000 + Math.random() * 9000);
}

function closeDepositModal() {
    document.getElementById('depositModal').style.display = 'none';
}

// Обновление балансов
function updateAllBalances() {
    document.getElementById('userBalance').textContent = userBalance;
    document.getElementById('slotsBalance').textContent = userBalance;
    document.getElementById('cardsBalance').textContent = userBalance;
    document.getElementById('multiplierBalance').textContent = userBalance;
}

// Колесо фортуны
function initWheel() {
    const wheel = document.getElementById('wheel');
    wheel.innerHTML = '';
    
    const segments = [
        { text: "0", color: "#ff4d4d", value: 0 },
        { text: "0", color: "#ff944d", value: 0 },
        { text: "10", color: "#ffdd4d", value: 10 },
        { text: "0", color: "#4dff4d", value: 0 },
        { text: "0", color: "#4dd2ff", value: 0 },
        { text: "50", color: "#4d4dff", value: 50 },
        { text: "0", color: "#dd4dff", value: 0 },
        { text: "100", color: "#ff4da6", value: 100 }
    ];
    
    let currentAngle = 0;
    segments.forEach(segment => {
        const segmentEl = document.createElement('div');
        segmentEl.classList.add('wheel-segment');
        segmentEl.style.backgroundColor = segment.color;
        segmentEl.style.transform = `rotate(${currentAngle}deg) skewY(60deg)`;
        segmentEl.innerHTML = `<div style="transform: skewY(-60deg) rotate(30deg);">${segment.text}</div>`;
        wheel.appendChild(segmentEl);
        currentAngle += 45;
    });
}

function spinWheel() {
    if (userBalance < 200) {
        showResult('wheelResult', "Недостаточно монет для игры!", false);
        return;
    }
    
    userBalance -= 200;
    updateAllBalances();
    
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinBtn');
    const result = document.getElementById('wheelResult');
    
    spinBtn.disabled = true;
    result.textContent = '';
    result.className = 'result';
    
    const degrees = 1080 + Math.floor(Math.random() * 360);
    wheel.style.transform = `rotate(${degrees}deg)`;
    
    setTimeout(() => {
        const actualDegrees = degrees % 360;
        const segmentIndex = Math.floor(actualDegrees / 45);
        
        const segments = [
            { text: "0 монет", value: 0, win: false },
            { text: "0 монет", value: 0, win: false },
            { text: "10 монет", value: 10, win: true },
            { text: "0 монет", value: 0, win: false },
            { text: "0 монет", value: 0, win: false },
            { text: "50 монет", value: 50, win: true },
            { text: "0 монет", value: 0, win: false },
            { text: "100 монет", value: 100, win: true }
        ];
        
        const segment = segments[segmentIndex];
        
        if (segment.win) {
            userBalance += segment.value;
            showResult('wheelResult', `Поздравляем! Вы выиграли: ${segment.text}!`, true);
        } else {
            showResult('wheelResult', `К сожалению, вы ничего не выиграли. Попробуйте еще раз!`, false);
        }
        
        updateAllBalances();
        spinBtn.disabled = false;
    }, 4000);
}

// Слот-машина
function changeBet(amount) {
    slotsBet += amount;
    if (slotsBet < 100) slotsBet = 100;
    if (slotsBet > userBalance) slotsBet = userBalance;
    document.getElementById('slotsBet').textContent = slotsBet;
}

function getWeightedSymbol() {
    const totalWeight = symbolWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < symbols.length; i++) {
        random -= symbolWeights[i];
        if (random <= 0) {
            return symbols[i];
        }
    }
    return symbols[0];
}

function spinSlots() {
    if (userBalance < slotsBet) {
        showResult('slotsResult', "Недостаточно монет!", false);
        return;
    }
    
    userBalance -= slotsBet;
    updateAllBalances();
    
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    const spinBtn = document.getElementById('spinSlotsBtn');
    spinBtn.disabled = true;
    
    let spins = 0;
    const results = [];
    
    const spinInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            const randomSymbol = getWeightedSymbol();
            reels[i].textContent = randomSymbol;
            
            if (spins > 15 + i * 5 && !results[i]) {
                results[i] = randomSymbol;
            }
        }
        
        spins++;
        
        if (spins > 30) {
            clearInterval(spinInterval);
            
            let winAmount = 0;
            if (results[0] === results[1] && results[1] === results[2]) {
                if (results[0] === '💎') winAmount = slotsBet * 15;
                else if (results[0] === '7') winAmount = slotsBet * 10;
                else if (results[0] === '⭐') winAmount = slotsBet * 8;
                else winAmount = slotsBet * 3;
            } else if (results[0] === results[1] || results[1] === results[2]) {
                winAmount = slotsBet * 1.5;
            }
            
            if (winAmount > 0) {
                userBalance += winAmount;
                showResult('slotsResult', `Поздравляем! Вы выиграли ${winAmount} монет!`, true);
            } else {
                showResult('slotsResult', "Повезет в следующий раз!", false);
            }
            
            updateAllBalances();
            spinBtn.disabled = false;
        }
    }, 100);
}

// Карточная игра
function initCardsGame() {
    const initialCard = getRandomCard();
    updateCardDisplay(initialCard);
}

function changeCardBet(amount) {
    cardsBet += amount;
    if (cardsBet < 100) cardsBet = 100;
    if (cardsBet > userBalance) cardsBet = userBalance;
    document.getElementById('cardsBet').textContent = cardsBet;
}

function getRandomCard() {
    const value = cardValues[Math.floor(Math.random() * cardValues.length)];
    const suit = cardSuits[Math.floor(Math.random() * cardSuits.length)];
    return {
        value: value,
        suit: suit.symbol,
        color: suit.color
    };
}

function updateCardDisplay(card) {
    const cardElement = document.getElementById('currentCard');
    cardElement.innerHTML = `
        <div class="card-corner card-top">${card.value}<span>${card.suit}</span></div>
        <div class="card-suit">${card.suit}</div>
        <div class="card-corner card-bottom">${card.value}<span>${card.suit}</span></div>
    `;
    cardElement.className = `card ${card.color}`;
}

function guessCard(color) {
    if (userBalance < cardsBet) {
        showResult('cardsResult', "Недостаточно монет!", false);
        return;
    }
    
    userBalance -= cardsBet;
    updateAllBalances();
    
    const newCard = getRandomCard();
    updateCardDisplay(newCard);
    
    const win = (newCard.color === color) && (Math.random() < 0.4);
    
    if (win) {
        const winAmount = Math.floor(cardsBet * 1.5);
        userBalance += winAmount;
        showResult('cardsResult', `Правильно! Вы выиграли ${winAmount} монет!`, true);
    } else {
        showResult('cardsResult', "Не угадали! Попробуйте еще раз.", false);
    }
    
    updateAllBalances();
}

// Множитель
function changeMultiplierBet(amount) {
    multiplierBet += amount;
    if (multiplierBet < 100) multiplierBet = 100;
    if (multiplierBet > userBalance) multiplierBet = userBalance;
    document.getElementById('multiplierBet').textContent = multiplierBet;
}

function playMultiplier() {
    if (userBalance < multiplierBet) {
        showResult('multiplierResult', "Недостаточно монет!", false);
        return;
    }
    
    userBalance -= multiplierBet;
    updateAllBalances();
    
    const multiplierDisplay = document.getElementById('multiplierDisplay');
    let counter = 0;
    
    const interval = setInterval(() => {
        multiplierDisplay.textContent = (Math.random() * 20).toFixed(1) + 'x';
        counter++;
        
        if (counter > 20) {
            clearInterval(interval);
            
            const random = Math.random();
            let multiplier;
            
            if (random < 0.6) multiplier = 0;
            else if (random < 0.8) multiplier = 1;
            else if (random < 0.9) multiplier = 2;
            else if (random < 0.95) multiplier = 5;
            else if (random < 0.98) multiplier = 10;
            else multiplier = 20;
            
            multiplierDisplay.textContent = multiplier.toFixed(1) + 'x';
            
            if (multiplier > 0) {
                const winAmount = Math.floor(multiplierBet * multiplier);
                userBalance += winAmount;
                showResult('multiplierResult', `Поздравляем! Вы выиграли ${winAmount} монет!`, true);
            } else {
                showResult('multiplierResult', "К сожалению, вы не выиграли. Попробуйте еще раз!", false);
            }
            
            updateAllBalances();
        }
    }, 100);
}

// Вспомогательная функция для отображения результатов
function showResult(elementId, message, isWin) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = isWin ? 'result win' : 'result lose';
}
