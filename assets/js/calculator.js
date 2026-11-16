/* ==========================================================================
   PARI GULL — PORTFOLIO · calculator.js
   Scientific calculator. Original calculation logic preserved; presentation
   decoupled from Tailwind so the page ships with zero CSS frameworks.
   ========================================================================== */
(() => {
  'use strict';

  const modal = document.getElementById('calcModal');
  if (!modal) return;

  const mainDisplay = document.getElementById('mainDisplay');
  const expressionDisplay = document.getElementById('expressionDisplay');
  const historyList = document.getElementById('historyList');
  const memoryIndicator = document.getElementById('memoryIndicator');
  const degRadBtn = document.getElementById('degRadBtn');
  const secondFnBtn = document.getElementById('secondFnBtn');

  let currentExpression = '';
  let currentInput = '0';
  let memory = 0;
  let isDegree = true;
  let isSecondFunc = false;
  let calcHistory = [];
  let resetInputNext = false;

  /* ---------------------------------------------------------------- */
  /*  Display + input                                                  */
  /* ---------------------------------------------------------------- */
  function updateDisplay() {
    if (mainDisplay) mainDisplay.innerText = currentInput;
    if (expressionDisplay) expressionDisplay.innerText = currentExpression;
  }

  window.appendValue = function appendValue(val) {
    if (resetInputNext) {
      currentInput = val;
      resetInputNext = false;
    } else {
      currentInput = currentInput === '0' && val !== '.' ? val : currentInput + val;
    }
    updateDisplay();
  };

  window.appendOperator = function appendOperator(op) {
    if (resetInputNext) resetInputNext = false;
    currentExpression += currentInput + ' ' + op + ' ';
    currentInput = '0';
    updateDisplay();
  };

  window.appendConstant = function appendConstant(constant) {
    const val = constant === 'pi' ? Math.PI : Math.E;
    currentInput = val.toString();
    resetInputNext = true;
    updateDisplay();
  };

  window.clearAll = function clearAll() {
    currentExpression = '';
    currentInput = '0';
    resetInputNext = false;
    updateDisplay();
  };

  window.backspace = function backspace() {
    if (resetInputNext) return;
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
    updateDisplay();
  };

  window.toggleAngleUnit = function toggleAngleUnit() {
    isDegree = !isDegree;
    if (degRadBtn) {
      degRadBtn.innerText = isDegree ? 'DEG' : 'RAD';
      degRadBtn.classList.toggle('is-on', isDegree);
    }
  };

  window.toggleSecondFunction = function toggleSecondFunction() {
    isSecondFunc = !isSecondFunc;
    if (secondFnBtn) secondFnBtn.classList.toggle('is-on', isSecondFunc);

    const t1 = document.getElementById('trig1');
    const t2 = document.getElementById('trig2');
    const t3 = document.getElementById('trig3');
    if (!t1 || !t2 || !t3) return;

    if (isSecondFunc) {
      t1.innerText = 'sin⁻¹'; t2.innerText = 'cos⁻¹'; t3.innerText = 'tan⁻¹';
      t1.setAttribute('onclick', "handleFunction('asin')");
      t2.setAttribute('onclick', "handleFunction('acos')");
      t3.setAttribute('onclick', "handleFunction('atan')");
    } else {
      t1.innerText = 'sin'; t2.innerText = 'cos'; t3.innerText = 'tan';
      t1.setAttribute('onclick', "handleFunction('sin')");
      t2.setAttribute('onclick', "handleFunction('cos')");
      t3.setAttribute('onclick', "handleFunction('tan')");
    }
  };

  window.toggleHistoryPanel = function toggleHistoryPanel() {
    const panel = document.getElementById('historyPanel');
    if (panel) panel.classList.toggle('is-open');
  };

  /* ---------------------------------------------------------------- */
  /*  Functions                                                        */
  /* ---------------------------------------------------------------- */
  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  window.factorial = factorial;

  window.handleFunction = function handleFunction(func) {
    const val = parseFloat(currentInput);
    let result = 0;
    let exprStr = '';
    try {
      switch (func) {
        case 'sin': result = Math.sin(isDegree ? val * (Math.PI / 180) : val); exprStr = `sin(${val}${isDegree ? '°' : ''})`; break;
        case 'cos': result = Math.cos(isDegree ? val * (Math.PI / 180) : val); exprStr = `cos(${val}${isDegree ? '°' : ''})`; break;
        case 'tan': result = Math.tan(isDegree ? val * (Math.PI / 180) : val); exprStr = `tan(${val}${isDegree ? '°' : ''})`; break;
        case 'asin': if (val < -1 || val > 1) throw new Error('Domain Error'); result = Math.asin(val); if (isDegree) result *= 180 / Math.PI; exprStr = `sin⁻¹(${val})`; break;
        case 'acos': if (val < -1 || val > 1) throw new Error('Domain Error'); result = Math.acos(val); if (isDegree) result *= 180 / Math.PI; exprStr = `cos⁻¹(${val})`; break;
        case 'atan': result = Math.atan(val); if (isDegree) result *= 180 / Math.PI; exprStr = `tan⁻¹(${val})`; break;
        case 'sqrt': if (val < 0) throw new Error('Invalid Input'); result = Math.sqrt(val); exprStr = `√(${val})`; break;
        case 'sq': result = Math.pow(val, 2); exprStr = `(${val})²`; break;
        case 'log': if (val <= 0) throw new Error('Domain Error'); result = Math.log10(val); exprStr = `log(${val})`; break;
        case 'ln': if (val <= 0) throw new Error('Domain Error'); result = Math.log(val); exprStr = `ln(${val})`; break;
        case 'fact': if (val < 0 || !Number.isInteger(val)) throw new Error('Integer ≥ 0 Required'); result = factorial(val); exprStr = `${val}!`; break;
        case 'inv': if (val === 0) throw new Error('Division by Zero'); result = 1 / val; exprStr = `1/(${val})`; break;
        case 'abs': result = Math.abs(val); exprStr = `|${val}|`; break;
        case 'neg': result = -val; exprStr = `neg(${val})`; break;
        default: return;
      }
      result = parseFloat(result.toFixed(10));
      currentInput = result.toString();
      resetInputNext = true;
      addHistory(exprStr, result);
      updateDisplay();
    } catch (error) {
      currentInput = error.message;
      resetInputNext = true;
      updateDisplay();
    }
  };

  window.calculateResult = function calculateResult() {
    try {
      const fullExpr = currentExpression + currentInput;
      if (!fullExpr.trim()) return;
      const sanitizedExpr = fullExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
      let result = Function('"use strict";return (' + sanitizedExpr + ')')();
      if (!isFinite(result)) throw new Error('Mathematical Error');
      result = parseFloat(result.toFixed(10));
      addHistory(fullExpr, result);
      currentExpression = '';
      currentInput = result.toString();
      resetInputNext = true;
      updateDisplay();
    } catch (error) {
      currentInput = 'Error';
      resetInputNext = true;
      updateDisplay();
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Memory                                                           */
  /* ---------------------------------------------------------------- */
  const setMemoryFlag = (on) => memoryIndicator && memoryIndicator.classList.toggle('is-hidden', !on);

  window.memoryClear = function memoryClear() { memory = 0; setMemoryFlag(false); };
  window.memoryRecall = function memoryRecall() {
    currentInput = memory.toString();
    resetInputNext = true;
    updateDisplay();
  };
  window.memoryAdd = function memoryAdd() { memory += parseFloat(currentInput || 0); setMemoryFlag(true); };
  window.memorySubtract = function memorySubtract() { memory -= parseFloat(currentInput || 0); setMemoryFlag(true); };
  window.memoryStore = function memoryStore() { memory = parseFloat(currentInput || 0); setMemoryFlag(true); };

  /* ---------------------------------------------------------------- */
  /*  History                                                          */
  /* ---------------------------------------------------------------- */
  function renderHistory() {
    if (!historyList) return;
    if (calcHistory.length === 0) {
      historyList.innerHTML = '<p class="calc__history-empty mono">No history yet</p>';
      return;
    }
    historyList.innerHTML = calcHistory
      .map(
        (item, index) => `
        <button type="button" class="calc__hist-item" onclick="loadHistory(${index})" title="Use this result">
          <span class="calc__hist-expr">${item.expression} =</span>
          <span class="calc__hist-val">${item.result}</span>
        </button>`
      )
      .join('');
  }

  function addHistory(expression, result) {
    calcHistory.unshift({ expression, result });
    if (calcHistory.length > 20) calcHistory.pop();
    renderHistory();
  }

  window.loadHistory = function loadHistory(index) {
    if (!calcHistory[index]) return;
    currentInput = calcHistory[index].result.toString();
    resetInputNext = true;
    updateDisplay();
  };

  window.clearHistory = function clearHistory() {
    calcHistory = [];
    renderHistory();
  };

  /* ---------------------------------------------------------------- */
  /*  Keyboard support                                                 */
  /* ---------------------------------------------------------------- */
  window.addEventListener('keydown', (e) => {
    if (modal.style.display !== 'flex') return;
    const onField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (onField) return;

    if ((e.key >= '0' && e.key <= '9') || e.key === '.') window.appendValue(e.key);
    else if (['+', '-', '*', '/'].includes(e.key)) window.appendOperator(e.key);
    else if (e.key === 'Enter' || e.key === '=') window.calculateResult();
    else if (e.key === 'Backspace') window.backspace();
    else if (e.key === 'Escape') window.clearAll();
    else if (e.key === '(' || e.key === ')') window.appendValue(e.key);
    else if (e.key === '^') window.appendOperator('^');
  });

  /* Refresh the display when the modal opens (keeps state between visits) */
  document.addEventListener('modal:open', (e) => {
    if (e.detail.id !== 'calcModal') return;
    updateDisplay();
    renderHistory();
  });

  updateDisplay();
  renderHistory();
})();
