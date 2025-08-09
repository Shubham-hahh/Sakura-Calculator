/* ---------- Core calculator state ---------- */
const display = document.getElementById('display');
const historyList = document.getElementById('history-list');
let currentInput = '0';
let shouldResetDisplay = false;
let history = [];
const maxHistoryItems = 5;

/* ---------- Utility ---------- */
function updateDisplay() {
    display.value = currentInput;
}

function clearDisplay() {
    currentInput = '0';
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

/* ---------- Input handling ---------- */
function appendToDisplay(value) {
    const ops = ['+', '-', '*', '/', '(', ')'];

    // Handle Error state
    if (currentInput === 'Error') {
        currentInput = '0';
    }

    if (shouldResetDisplay) {
        // keep result if next key is operator, else start fresh
        if (ops.includes(value)) {
            shouldResetDisplay = false;
        } else {
            currentInput = '0';
            shouldResetDisplay = false;
        }
    }

    const lastChar = currentInput.slice(-1);

    // Handle decimal points
    if (value === '.') {
        // Find the last operator in the input
        const lastOpIndex = Math.max(...ops.map(op => currentInput.lastIndexOf(op)));
        // Check if there's already a decimal point after the last operator
        const numberPart = currentInput.slice(lastOpIndex + 1);
        if (numberPart.includes('.')) {
            return;
        }
    }

    // Handle operators
    if (ops.includes(lastChar) && ops.includes(value)) {
        // Special case: allow minus after other operators for negative numbers
        if (value === '-' && lastChar !== '-' && lastChar !== ')') {
            currentInput += value;
        } else {
            // prevent double operators
            currentInput = currentInput.slice(0, -1) + value;
        }
        updateDisplay();
        return;
    }

    // Handle parentheses
    if (value === '(' && !isNaN(lastChar)) {
        // Add multiplication operator before opening parenthesis
        currentInput += '*' + value;
    } else if (value === ')') {
        // Check if we have matching parentheses
        const openCount = (currentInput.match(/\(/g) || []).length;
        const closeCount = (currentInput.match(/\)/g) || []).length;
        if (closeCount >= openCount) {
            return;
        }
        currentInput += value;
    } else if (currentInput === '0' && !ops.includes(value)) {
        currentInput = value;
    } else {
        currentInput += value;
    }
    
    updateDisplay();
}

/* ---------- Evaluation ---------- */
function calculate() {
    try {
        // If the input is already 'Error' or empty, don't proceed
        if (currentInput === 'Error' || currentInput === '') {
            return;
        }

        // prepare expression
        let expr = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/[+\-*/]$/, '') // chop trailing operator
            .replace(/\($/g, '') // remove trailing open parenthesis
            .replace(/^\*+/, ''); // remove leading multiplication operators

        // safe evaluation with support for Math functions
        const mathContext = Object.getOwnPropertyNames(Math).reduce((ctx, key) => {
            ctx[key] = Math[key];
            return ctx;
        }, {});
        
        const result = Function(...Object.keys(mathContext), '"use strict"; return (' + expr + ')')(...Object.values(mathContext));
        
        if (!isFinite(result)) throw new Error('Invalid result');
        
        // Add to history
        addToHistory(currentInput + ' = ' + result);
        
        currentInput = parseFloat(result.toFixed(10)).toString();
    } catch (error) {
        currentInput = 'Error';
        console.error('Calculation error:', error);
    }
    shouldResetDisplay = true;
    updateDisplay();
}

/* ---------- Memory ---------- */
let memory = 0;
let memoryHasValue = false;

function memoryClear() { 
    memory = 0;
    memoryHasValue = false;
    // Visual feedback that memory was cleared
    display.style.opacity = '0.5';
    setTimeout(() => display.style.opacity = '1', 200);
}

function memoryRecall() { 
    if (!memoryHasValue) return;
    // If we're in the middle of an expression, add multiplication operator
    if (currentInput !== '0' && currentInput !== 'Error' && !isNaN(currentInput.slice(-1))) {
        currentInput += '*';
    }
    if (currentInput === 'Error') currentInput = '0';
    currentInput = currentInput === '0' ? memory.toString() : currentInput + memory.toString();
    updateDisplay();
    shouldResetDisplay = true;
}

function memoryAdd() { 
    try {
        // If current input is an expression, evaluate it first
        if (currentInput.match(/[+\-*/()]/)) {
            calculate();
            if (currentInput === 'Error') return;
        }
        memory += parseFloat(currentInput) || 0;
        memoryHasValue = true;
        shouldResetDisplay = true;
        // Visual feedback
        display.style.opacity = '0.5';
        setTimeout(() => display.style.opacity = '1', 200);
    } catch (error) {
        console.error('Memory add error:', error);
    }
}

function memorySub() { 
    try {
        // If current input is an expression, evaluate it first
        if (currentInput.match(/[+\-*/()]/)) {
            calculate();
            if (currentInput === 'Error') return;
        }
        memory -= parseFloat(currentInput) || 0;
        memoryHasValue = true;
        shouldResetDisplay = true;
        // Visual feedback
        display.style.opacity = '0.5';
        setTimeout(() => display.style.opacity = '1', 200);
    } catch (error) {
        console.error('Memory subtract error:', error);
    }
}

/* ---------- Extra functions ---------- */
function toggleSign() {
    if (currentInput !== 'Error') {
        try {
            // If it's an expression, calculate it first
            if (currentInput.match(/[+\-*/()]/)) {
                calculate();
                if (currentInput === 'Error') return;
            }
            currentInput = (parseFloat(currentInput) * -1).toString();
            updateDisplay();
            shouldResetDisplay = true;
        } catch (error) {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}

function percent() {
    if (currentInput !== 'Error') {
        try {
            // If it's an expression, calculate it first
            if (currentInput.match(/[+\-*/()]/)) {
                calculate();
                if (currentInput === 'Error') return;
            }
            const value = parseFloat(currentInput);
            if (isNaN(value)) {
                throw new Error('Invalid input for percentage');
            }
            currentInput = (value / 100).toString();
            updateDisplay();
            shouldResetDisplay = true;
        } catch (error) {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}
function sqrt() {
    if (currentInput !== 'Error') {
        const v = parseFloat(currentInput);
        currentInput = v < 0 ? 'Error' : Math.sqrt(v).toString();
        updateDisplay();
        shouldResetDisplay = true;
    }
}
function square() {
    if (currentInput !== 'Error') {
        const v = parseFloat(currentInput);
        currentInput = (v * v).toString();
        updateDisplay();
        shouldResetDisplay = true;
    }
}
function reciprocal() {
    if (currentInput !== 'Error') {
        const v = parseFloat(currentInput);
        currentInput = v === 0 ? 'Error' : (1 / v).toString();
        updateDisplay();
        shouldResetDisplay = true;
    }
}
function insertPi() {
    currentInput = Math.PI.toFixed(10).replace(/0+$/, '');
    updateDisplay();
    shouldResetDisplay = true;
}

/* ---------- History Management ---------- */
function addToHistory(entry) {
    history.unshift(entry);
    if (history.length > maxHistoryItems) {
        history.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = history
        .map(entry => `<div class="history-item">${entry}</div>`)
        .join('');
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
}

/* ---------- Scientific Functions ---------- */
function sin() {
    if (currentInput !== 'Error') {
        try {
            // First calculate any pending expression
            if (currentInput.match(/[+\-*/()]/)) {
                calculate();
                if (currentInput === 'Error') return;
            }
            const v = parseFloat(currentInput);
            currentInput = Math.sin(v).toFixed(10).replace(/\.?0+$/, '');
            updateDisplay();
            shouldResetDisplay = true;
        } catch {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}

function cos() {
    if (currentInput !== 'Error') {
        try {
            const v = parseFloat(currentInput);
            currentInput = Math.cos(v).toFixed(10).replace(/\.?0+$/, '');
            updateDisplay();
            shouldResetDisplay = true;
        } catch {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}

function tan() {
    if (currentInput !== 'Error') {
        try {
            const v = parseFloat(currentInput);
            currentInput = Math.tan(v).toFixed(10).replace(/\.?0+$/, '');
            updateDisplay();
            shouldResetDisplay = true;
        } catch {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}

function exp() {
    if (currentInput !== 'Error') {
        try {
            const v = parseFloat(currentInput);
            currentInput = Math.exp(v).toFixed(10).replace(/\.?0+$/, '');
            updateDisplay();
            shouldResetDisplay = true;
        } catch {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}

/* ---------- Keyboard shortcuts ---------- */
document.addEventListener('keydown', e => {
    // Prevent default browser shortcuts
    if ((e.ctrlKey || e.metaKey) && ['p', 'o', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }

    if (e.key >= '0' && e.key <= '9') appendToDisplay(e.key);
    else if (e.key === '.') appendToDisplay('.');
    else if (['+', '-', '*', '/', '(', ')'].includes(e.key)) {
        e.preventDefault(); // Prevent browser shortcuts
        appendToDisplay(e.key);
    }
    else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    }
    else if (e.key === 'Backspace') deleteLast();
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') clearDisplay();
    else if (e.key === '%') percent();
    else if (e.key === 'p' || e.key === 'P') insertPi();
    else if (e.key.toLowerCase() === 's') sin();
    else if (e.key.toLowerCase() === 'o') cos();
    else if (e.key.toLowerCase() === 't') tan();
    else if (e.key.toLowerCase() === 'e') exp();
    else if (e.key.toLowerCase() === 'h') clearHistory();
});