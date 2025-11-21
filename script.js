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
    // Генерация случайного ID пользователя
    document.getElementById('userId').textContent = '2WIN-' + Math.floor(1000 + Math.random() * 9000);
}

function closeDepositModal() {
    document.getElementById('depositModal').style.display = 'none';
}

// Общий баланс пользователя
let userBalance = 1000;

function updateAllBalances() {
    document.getElementById('userBalance').textContent = userBalance;
    document.getElementById('slotsBalance').textContent = userBalance;
    document.getElementById('cardsBalance').textContent = userBalance;
    document.getElementById('multiplierBalance').textContent = userBalance;
}

// Колесо фортуны с уменьшенными шансами
function initWheel() {
    const wheel = document.getElementById('wheel');
    wheel.innerHTML = '';
    
    // Сегменты с очень низкими шансами на выигрыш
    const segments = [
        { text: "0", color: "#ff4d4d", value: 0, chance: 0.6 },
        { text: "0", color: "#ff944d", value: 0, chance: 0.5 },
        { text: "10", color: "#ffdd4d", value: 10, chance: 0.1 },
        { text: "0", color: "#4dff4d", value: 0, chance: 0.5 },
        { text: "0", color: "#4dd2ff", value: 0, chance: 0.6 },
        { text: "50", color: "#4d4dff", value: 50, chance: 0.05 },
        { text: "0", color: "#dd4dff", value: 0, chance: 0.5 },
        { text: "100", color: "#ff4da6", value: 100, chance: 0.05 }
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
        document.getElementById('wheelResult').textContent = "Недостаточно монет для игры!";
        document.getElementById('wheelResult').className = 'result lose';
        return;
    }
    
    userBalance -= 200;
    updateAllBalances();
    
    const wheel = document.getElementById('wheel');
    const result = document.getElementById('wheelResult');
    const spinBtn = document.getElementById('spinBtn');
    
    // Отключаем кнопку на время вращения
    spinBtn.disabled = true;
    result.textContent = '';
    result.className = 'result';
    
    // Случайный угол вращения (минимум 3 полных оборота)
    const degrees = 1080 + Math.floor(Math.random() * 360);
    
    // Вращаем колесо
    wheel.style.transform = `rotate(${degrees}deg)`;
    
    // Определяем результат после завершения вращения
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
        
        const win = segments[segmentIndex].win;
        const value = segments[segmentIndex].value;
        
        if (win) {
            userBalance += value;
            updateAllBalances();
            result.textContent = `Поздравляем! Вы выиграли: ${segments[segmentIndex].text}!`;
            result.className = 'result win';
        } else {
            result.textContent = `К сожалению, вы ничего не выиграли. Попробуйте еще раз!`;
            result.className = 'result lose';
        }
        
        spinBtn.disabled = false;
    }, 4000);
}

// Слот-машина с уменьшенными шансами
let slotsBet = 200;

const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7', '💎'];
// Веса символов (меньше вес = реже выпадает)
const symbolWeights = [15, 18, 20, 12, 8, 5, 3, 1];

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
        document.getElementById('slotsResult').textContent = "Недостаточно монет!";
        document.getElementById('slotsResult').className = 'result lose';
        return;
    }
    
    userBalance -= slotsBet;
    updateAllBalances();
    
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    const results = [];
    const spinBtn = document.getElementById('spinSlotsBtn');
    spinBtn.disabled = true;
    document.getElementById('slotsResult').textContent = '';
    document.getElementById('slotsResult').className = 'result';
    
    // Анимация вращения
    let spins = 0;
    const spinInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            const randomSymbol = getWeightedSymbol();
            reels[i].textContent = randomSymbol;
            
            if (spins > 15 + i * 5) {
                if (!results[i]) {
                    results[i] = randomSymbol;
                }
            }
        }
        
        spins++;
        
        if (spins > 30) {
            clearInterval(spinInterval);
            
            // Проверяем выигрыш с очень низкими шансами
            let winAmount = 0;
            if (results[0] === results[1] && results[1] === results[2]) {
                // Джекпот за три одинаковых символа
                if (results[0] === '💎') {
                    winAmount = slotsBet * 15;
                } else if (results[0] === '7') {
                    winAmount = slotsBet * 10;
                } else if (results[0] === '⭐') {
                    winAmount = slotsBet * 8;
                } else {
                    winAmount = slotsBet * 3;
                }
            } else if (results[0] === results[1] || results[1] === results[2]) {
                // Уменьшаем выигрыш за две одинаковых
                winAmount = slotsBet * 1.5;
            }
            
            if (winAmount > 0) {
                userBalance += winAmount;
                document.getElementById('slotsResult').textContent = `Поздравляем! Вы выиграли ${winAmount} монет!`;
                document.getElementById('slotsResult').className = 'result win';
            } else {
                document.getElementById('slotsResult').textContent = "Повезет в следующий раз!";
                document.getElementById('slotsResult').className = 'result lose';
            }
            
            updateAllBalances();
            spinBtn.disabled = false;
        }
    }, 100);
}

// Карточная игра с уменьшенными шансами
let cardsBet = 200;

const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardSuits = [
    { symbol: '♥', color: 'red' },
    { symbol: '♦', color: 'red' },
    { symbol: '♣', color: 'black' },
    { symbol: '♠', color: 'black' }
];

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
        color: suit.color,
        display: value + suit.symbol
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
        document.getElementById('cardsResult').textContent = "Недостаточно монет!";
        document.getElementById('cardsResult').className = 'result lose';
        return;
    }
    
    userBalance -= cardsBet;
    updateAllBalances();
    
    const newCard = getRandomCard();
    updateCardDisplay(newCard);
    
    // Уменьшаем шансы выигрыша до 40%
    let win = false;
    if (newCard.color === color) {
        // 40% шанс на правильное угадывание
        win = Math.random() < 0.4;
    }
    
    if (win) {
        const winAmount = Math.floor(cardsBet * 1.5);
        userBalance += winAmount;
        document.getElementById('cardsResult').textContent = `Правильно! Вы выиграли ${winAmount} монет!`;
        document.getElementById('cardsResult').className = 'result win';
    } else {
        document.getElementById('cardsResult').textContent = "Не угадали! Попробуйте еще раз.";
        document.getElementById('cardsResult').className = 'result lose';
    }
    
    updateAllBalances();
}

// Игра с коэффициентами с возможностью проигрыша
let multiplierBet = 200;

function changeMultiplierBet(amount) {
    multiplierBet += amount;
    if (multiplierBet < 100) multiplierBet = 100;
    if (multiplierBet > userBalance) multiplierBet = userBalance;
    document.getElementById('multiplierBet').textContent = multiplierBet;
}

function playMultiplier() {
    if (userBalance < multiplierBet) {
        document.getElementById('multiplierResult').textContent = "Недостаточно монет!";
        document.getElementById('multiplierResult').className = 'result lose';
        return;
    }
    
    userBalance -= multiplierBet;
    updateAllBalances();
    
    // Анимация изменения множителя
    let counter = 0;
    const multiplierDisplay = document.getElementById('multiplierDisplay');
    const interval = setInterval(() => {
        multiplierDisplay.textContent = (Math.random() * 20).toFixed(1) + 'x';
        counter++;
        
        if (counter > 20) {
            clearInterval(interval);
            
            // Реалистичные шансы с очень низкой вероятностью выигрыша
            const random = Math.random();
            let multiplier;
            
            if (random < 0.6) {
                multiplier = 0; // 60% шанс проигрыша
            } else if (random < 0.8) {
                multiplier = 1; // 20% шанс возврата
            } else if (random < 0.9) {
                multiplier = 2; // 10% шанс
            } else if (random < 0.95) {
                multiplier = 5; // 5% шанс
            } else if (random < 0.98) {
                multiplier = 10; // 3% шанс
            } else {
                multiplier = 20; // 2% шанс
            }
            
            multiplierDisplay.textContent = multiplier.toFixed(1) + 'x';
            
            if (multiplier > 0) {
                const winAmount = Math.floor(multiplierBet * multiplier);
                userBalance += winAmount;
                document.getElementById('multiplierResult').textContent = `Поздравляем! Вы выиграли ${winAmount} монет!`;
                document.getElementById('multiplierResult').className = 'result win';
            } else {
                document.getElementById('multiplierResult').textContent = "К сожалению, вы не выиграли. Попробуйте еще раз!";
                document.getElementById('multiplierResult').className = 'result lose';
            }
            
            updateAllBalances();
        }
    }, 100);
}

// Инициализация при загрузке страницы
window.onload = function() {
    initBackground();
    showMainMenu();
    updateAllBalances();
    
    // Инициализация начальной карты
    const initialCard = getRandomCard();
    updateCardDisplay(initialCard);
};
