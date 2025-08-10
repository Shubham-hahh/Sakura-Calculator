/* ---------- Core ---------- */
const display = document.getElementById('display');
let currentInput = '0';
let shouldResetDisplay = false;

/* ---------- Utility ---------- */
function updateDisplay() { display.value = currentInput; }
function clearDisplay() {
    currentInput = '0';
    shouldResetDisplay = false;
    updateDisplay();
}
function deleteLast() {
    currentInput = currentInput.length === 1 ? '0' : currentInput.slice(0, -1);
    updateDisplay();
}

/* ---------- Input ---------- */
function appendToDisplay(value) {
    const ops = ['+', '-', '*', '/'];
    if (shouldResetDisplay) {
        currentInput = ops.includes(value) ? currentInput : '0';
        shouldResetDisplay = false;
    }
    const last = currentInput.slice(-1);
    if (ops.includes(last) && ops.includes(value)) {
        currentInput = currentInput.slice(0, -1) + value;
    } else if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }
    updateDisplay();
}

/* ---------- Evaluate ---------- */
function calculate() {
    try {
        let expr = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/[+\-*/]$/, '');
        const res = Function('"use strict"; return (' + expr + ')')();
        if (!isFinite(res)) throw new Error();
        currentInput = parseFloat(res.toFixed(10)).toString();
    } catch {
        currentInput = 'Error';
    }
    shouldResetDisplay = true;
    updateDisplay();
}

/* ---------- Extra functions ---------- */
function toggleSign()   { if (currentInput !== 'Error') currentInput = (parseFloat(currentInput) * -1).toString(); updateDisplay(); }
function percent()      { if (currentInput !== 'Error') { currentInput = (parseFloat(currentInput) / 100).toString(); shouldResetDisplay = true; } updateDisplay(); }
function sqrt()         { if (currentInput !== 'Error') { currentInput = (parseFloat(currentInput) < 0 ? 'Error' : Math.sqrt(parseFloat(currentInput)).toString()); shouldResetDisplay = true; } updateDisplay(); }
function square()       { if (currentInput !== 'Error') { currentInput = (Math.pow(parseFloat(currentInput), 2).toString()); shouldResetDisplay = true; } updateDisplay(); }
function reciprocal()   { if (currentInput !== 'Error') { const v = parseFloat(currentInput); currentInput = (v === 0 ? 'Error' : (1 / v).toString()); shouldResetDisplay = true; } updateDisplay(); }
function insertPi()     { currentInput = Math.PI.toFixed(10).replace(/0+$/, ''); shouldResetDisplay = true; updateDisplay(); }
function toggleFuncs()  { document.getElementById('func-drawer').classList.toggle('hidden'); }

/* ---------- Dark-mode toggle ---------- */
const toggleBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

toggleBtn.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
});

/* ---------- Keyboard ---------- */
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') appendToDisplay(e.key);
    else if (e.key === '.') appendToDisplay('.');
    else if (['+', '-', '*', '/'].includes(e.key)) appendToDisplay(e.key);
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') deleteLast();
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') clearDisplay();
    else if (e.key === '%') percent();
    else if (e.key === 'p' || e.key === 'P') insertPi();
});