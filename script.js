/**
 * CALCULADORA DE PRODUTIVIDADE
 * Sistema completo com calculadora, pomodoro e estatísticas
 * Desenvolvido por Leonardo Cardoso Silva
 */

// ===== VARIÁVEIS GLOBAIS =====

// Calculadora
let currentInput = '0';
let operator = '';
let previousInput = '';
let calculationHistory = [];

// Pomodoro
let timerMinutes = 25;
let timerSeconds = 0;
let timerInterval = null;
let isTimerRunning = false;
let completedSessions = 0;

// Estatísticas
let stats = {
    totalCalculations: 0,
    totalPomodoros: 0,
    totalMinutes: 0,
    streak: 0,
    lastActiveDate: null
};

// ===== INICIALIZAÇÃO =====
window.onload = function() {
    loadStats();
    updateDisplay();
    updateTimer();
    updateStats();
    console.log('🚀 Calculadora de Produtividade iniciada!');
};

// ===== SISTEMA DE NAVEGAÇÃO =====

/**
 * Alternar entre as abas do sistema
 * @param {string} tabName - Nome da aba a ser exibida
 */
function showTab(tabName) {
    // Remove classe ativa de todas as tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Adiciona classe ativa na tab selecionada
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    console.log(`📱 Mudou para a aba: ${tabName}`);
}

/**
 * Alternar entre tema claro e escuro
 */
function toggleTheme() {
    document.body.classList.toggle('dark');
    const button = document.querySelector('.theme-toggle');
    
    if (document.body.classList.contains('dark')) {
        button.textContent = '☀️ Modo Claro';
        console.log('🌙 Tema escuro ativado');
    } else {
        button.textContent = '🌙 Modo Escuro';
        console.log('☀️ Tema claro ativado');
    }
}

// ===== FUNÇÕES DA CALCULADORA =====

/**
 * Atualizar o display da calculadora
 */
function updateDisplay() {
    const display = document.getElementById('display');
    display.value = currentInput;
}

/**
 * Adicionar valores ao display
 * @param {string} value - Valor a ser adicionado
 */
function appendToDisplay(value) {
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }
    updateDisplay();
}

/**
 * Limpar completamente o display
 */
function clearDisplay() {
    currentInput = '0';
    operator = '';
    previousInput = '';
    updateDisplay();
    console.log('🧹 Display limpo');
}

/**
 * Limpar apenas a entrada atual
 */
function clearEntry() {
    currentInput = '0';
    updateDisplay();
    console.log('↩️ Entrada limpa');
}

/**
 * Calcular o resultado da expressão
 */
function calculate() {
    try {
        // Substitui × por * para o eval funcionar
        const expression = currentInput.replace(/×/g, '*');
        const result = eval(expression);
        
        // Validar resultado
        if (!isFinite(result)) {
            throw new Error('Resultado inválido');
        }
        
        // Adicionar ao histórico
        const calculationItem = {
            expression: currentInput,
            result: result.toFixed(8).replace(/\.?0+$/, ''), // Remove zeros desnecessários
            time: new Date().toLocaleTimeString()
        };
        
        calculationHistory.push(calculationItem);
        
        // Manter apenas os últimos 10 cálculos
        if (calculationHistory.length > 10) {
            calculationHistory.shift();
        }
        
        currentInput = calculationItem.result;
        updateDisplay();
        updateHistory();
        
        // Atualizar estatísticas
        stats.totalCalculations++;
        saveStats();
        updateStats();
        
        console.log(`🧮 Cálculo: ${calculationItem.expression} = ${calculationItem.result}`);
        
    } catch (error) {
        console.error('❌ Erro no cálculo:', error);
        currentInput = 'Erro';
        updateDisplay();
        
        // Limpar após 1.5 segundos
        setTimeout(() => {
            clearDisplay();
        }, 1500);
    }
}

/**
 * Atualizar o histórico de cálculos
 */
function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    // Mostrar os últimos 5 cálculos em ordem reversa
    calculationHistory.slice(-5).reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <strong>${item.expression}</strong> = ${item.result} 
            <small style="color: #7f8c8d;">(${item.time})</small>
        `;
        historyList.appendChild(div);
    });
}

// ===== FUNÇÕES DO POMODORO =====

/**
 * Atualizar o display do timer
 */
function updateTimer() {
    const display = document.getElementById('timer');
    const minutes = String(timerMinutes).padStart(2, '0');
    const seconds = String(timerSeconds).padStart(2, '0');
    display.textContent = `${minutes}:${seconds}`;
    
    // Atualizar barra de progresso
    const totalSeconds = 25 * 60; // 25 minutos em segundos
    const remainingSeconds = timerMinutes * 60 + timerSeconds;
    const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
    
    document.getElementById('progress').style.width = Math.max(0, progress) + '%';
}

/**
 * Iniciar o timer pomodoro
 */
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        console.log('▶️ Pomodoro iniciado');
        
        timerInterval = setInterval(() => {
            if (timerSeconds === 0) {
                if (timerMinutes === 0) {
                    // Timer finalizado
                    finishPomodoroSession();
                } else {
                    timerMinutes--;
                    timerSeconds = 59;
                }
            } else {
                timerSeconds--;
            }
            updateTimer();
        }, 1000);
    }
}

/**
 * Pausar o timer
 */
function pauseTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        console.log('⏸️ Pomodoro pausado');
    }
}

/**
 * Resetar o timer para 25 minutos
 */
function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerMinutes = 25;
    timerSeconds = 0;
    updateTimer();
    console.log('🔄 Timer resetado');
}

/**
 * Finalizar uma sessão de pomodoro
 */
function finishPomodoroSession() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    completedSessions++;
    
    // Atualizar estatísticas
    stats.totalPomodoros++;
    stats.totalMinutes += 25;
    
    // Atualizar displays
    document.getElementById('sessions').textContent = completedSessions;
    
    // Notificar usuário
    alert('🎉 Parabéns! Pomodoro finalizado!\n\n⏰ Hora de fazer uma pausa de 5 minutos.');
    
    // Preparar para próxima sessão
    timerMinutes = 25;
    timerSeconds = 0;
    updateTimer();
    
    // Salvar progresso
    saveStats();
    updateStats();
    
    console.log(`🍅 Pomodoro #${completedSessions} finalizado!`);
}

// ===== FUNÇÕES DE ESTATÍSTICAS =====

/**
 * Atualizar todos os displays de estatísticas
 */
function updateStats() {
    // Atualizar cards principais
    document.getElementById('totalCalculations').textContent = stats.totalCalculations;
    document.getElementById('totalPomodoros').textContent = stats.totalPomodoros;
    document.getElementById('totalMinutes').textContent = stats.totalMinutes;
    document.getElementById('streak').textContent = stats.streak;
    
    // Atualizar progresso semanal
    updateWeeklyProgress();
    
    console.log('📊 Estatísticas atualizadas:', stats);
}

/**
 * Atualizar o progresso da meta semanal
 */
function updateWeeklyProgress() {
    const weeklyGoal = 10;
    const weeklyPomodoros = stats.totalPomodoros % weeklyGoal;
    const weeklyProgress = Math.min((weeklyPomodoros / weeklyGoal) * 100, 100);
    
    document.getElementById('weeklyProgress').style.width = weeklyProgress + '%';
    document.getElementById('weeklyText').textContent = 
        `${weeklyPomodoros}/${weeklyGoal} Pomodoros esta semana`;
}

/**
 * Salvar estatísticas no localStorage
 */
function saveStats() {
    // Verificar e atualizar streak
    updateStreak();
    
    // Salvar no localStorage
    try {
        localStorage.setItem('productivityStats', JSON.stringify(stats));
        console.log('💾 Estatísticas salvas');
    } catch (error) {
        console.error('❌ Erro ao salvar estatísticas:', error);
    }
}

/**
 * Carregar estatísticas do localStorage
 */
function loadStats() {
    try {
        const savedStats = localStorage.getItem('productivityStats');
        if (savedStats) {
            stats = { ...stats, ...JSON.parse(savedStats) };
            console.log('📂 Estatísticas carregadas');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
        // Manter estatísticas padrão
    }
}

/**
 * Atualizar o streak de dias consecutivos
 */
function updateStreak() {
    const today = new Date().toDateString();
    
    if (stats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (stats.lastActiveDate === yesterday.toDateString()) {
            // Usuário ativo ontem, continua o streak
            stats.streak++;
        } else if (stats.lastActiveDate) {
            // Quebrou o streak, reinicia
            stats.streak = 1;
        } else {
            // Primeiro dia
            stats.streak = 1;
        }
        
        stats.lastActiveDate = today;
        console.log(`🔥 Streak atualizado: ${stats.streak} dias`);
    }
}

// ===== SUPORTE A TECLADO =====

/**
 * Adicionar suporte para uso via teclado
 */
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Só funciona na aba da calculadora
    if (!document.getElementById('calculator').classList.contains('active')) {
        return;
    }
    
    if ('0123456789.'.includes(key)) {
        appendToDisplay(key);
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('*');
    } else if (key === '/') {
        event.preventDefault(); // Evita busca rápida do navegador
        appendToDisplay('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'Backspace') {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }
});

// ===== UTILITÁRIOS =====

/**
 * Adicionar log de versão para debug
 */
console.log(`
🚀 CALCULADORA DE PRODUTIVIDADE v2.0
📱 Sistema completo carregado com sucesso!
👨‍💻 Desenvolvido por Leonardo Cardoso Silva

Features ativas:
✅ Calculadora com histórico
✅ Timer Pomodoro 25min
✅ Estatísticas de produtividade
✅ Tema claro/escuro
✅ Suporte a teclado
✅ Design responsivo
`);

/**
 * Função de limpeza ao fechar a página
 */
window.addEventListener('beforeunload', function() {
    // Pausar timer se estiver rodando
    if (isTimerRunning) {
        pauseTimer();
    }
    
    // Salvar estatísticas finais
    saveStats();
    
    console.log('👋 Aplicação finalizada, dados salvos');
});