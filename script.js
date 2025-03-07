// Global variable to store chart instance
let chartInstance = null;

// Global variables for current date range
let currentStartDate = new Date('2025-02-01');
let currentEndDate = new Date('2025-02-28');

// Helper functions for calendar
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

// Sample trade data by account (individual trades)
const sampleTradeData = {
    Apex: [
        { date: '2025-02-04', symbol: 'NQ', profit: 100, type: 'Long', quantity: 1 },
        { date: '2025-02-04', symbol: 'MNQ', profit: 118, type: 'Short', quantity: 2 },
        { date: '2025-02-06', symbol: 'NQ', profit: -50, type: 'Long', quantity: 1 },
        { date: '2025-02-06', symbol: 'NQ', profit: 200, type: 'Short', quantity: 1 },
        { date: '2025-02-06', symbol: 'MNQ', profit: 135, type: 'Long', quantity: 3 },
        { date: '2025-02-11', symbol: 'NQ', profit: -30, type: 'Long', quantity: 1 },
        { date: '2025-02-12', symbol: 'MNQ', profit: -80, type: 'Short', quantity: 2 },
        { date: '2025-02-12', symbol: 'NQ', profit: -81, type: 'Long', quantity: 1 },
        { date: '2025-02-13', symbol: 'NQ', profit: 150, type: 'Long', quantity: 1 },
        { date: '2025-02-13', symbol: 'MNQ', profit: 173, type: 'Short', quantity: 2 },
        { date: '2025-02-14', symbol: 'NQ', profit: 300, type: 'Long', quantity: 1 },
        { date: '2025-02-14', symbol: 'MNQ', profit: 241, type: 'Short', quantity: 3 },
        { date: '2025-02-17', symbol: 'NQ', profit: -500, type: 'Long', quantity: 2 },
        { date: '2025-02-17', symbol: 'MNQ', profit: -840, type: 'Short', quantity: 4 },
        { date: '2025-02-19', symbol: 'NQ', profit: 100, type: 'Long', quantity: 1 },
        { date: '2025-02-19', symbol: 'MNQ', profit: 114, type: 'Short', quantity: 2 },
        { date: '2025-02-20', symbol: 'NQ', profit: -215, type: 'Long', quantity: 1 },
        { date: '2025-02-25', symbol: 'MNQ', profit: -268, type: 'Short', quantity: 2 },
        { date: '2025-02-26', symbol: 'NQ', profit: 300, type: 'Long', quantity: 1 },
        { date: '2025-02-26', symbol: 'MNQ', profit: 323, type: 'Short', quantity: 2 },
        { date: '2025-02-27', symbol: 'NQ', profit: 150, type: 'Long', quantity: 1 },
        { date: '2025-02-27', symbol: 'MNQ', profit: 195, type: 'Short', quantity: 2 },
        { date: '2025-02-28', symbol: 'NQ', profit: 250, type: 'Long', quantity: 1 },
        { date: '2025-02-28', symbol: 'MNQ', profit: 239, type: 'Short', quantity: 3 }
    ],
    Topstep: [
        { date: '2025-02-05', symbol: 'ES', profit: 75, type: 'Long', quantity: 1 },
        { date: '2025-02-05', symbol: 'MES', profit: 25, type: 'Short', quantity: 2 },
        { date: '2025-02-05', symbol: 'ES', profit: 50, type: 'Long', quantity: 1 },
        { date: '2025-02-10', symbol: 'ES', profit: -30, type: 'Long', quantity: 1 },
        { date: '2025-02-10', symbol: 'MES', profit: -20, type: 'Short', quantity: 2 },
        { date: '2025-02-15', symbol: 'ES', profit: 100, type: 'Long', quantity: 1 },
        { date: '2025-02-15', symbol: 'MES', profit: 200, type: 'Short', quantity: 2 }
    ],
    MFFU: [
        { date: '2025-02-07', symbol: 'CL', profit: -100, type: 'Long', quantity: 1 },
        { date: '2025-02-20', symbol: 'CL', profit: 50, type: 'Short', quantity: 2 },
        { date: '2025-02-20', symbol: 'MCL', profit: 150, type: 'Long', quantity: 3 },
        { date: '2025-02-25', symbol: 'CL', profit: 200, type: 'Long', quantity: 1 },
        { date: '2025-02-25', symbol: 'MCL', profit: 250, type: 'Short', quantity: 2 }
    ]
};

// Define updateChart with account parameter
function updateChart(start, end, account) {
    const canvas = document.getElementById('pnlChart');
    if (!canvas) {
        console.error('Chart canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }

    const trades = sampleTradeData[account] || {};
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const visibleDates = [];
    const dataPoints = [];
    let cumulativePL = 0;

    // Aggregate trades by date
    const dailyPL = {};
    trades.forEach(trade => {
        if (trade.date >= startDate.toISOString().slice(0, 10) && trade.date <= endDate.toISOString().slice(0, 10)) {
            dailyPL[trade.date] = (dailyPL[trade.date] || 0) + trade.profit;
        }
    });

    for (let i = 0; i < daysInRange; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().slice(0, 10);
        visibleDates.push(dateStr.slice(5));

        if (i === 0) {
            dataPoints.push({ x: 0, y: 0 });
        } else {
            if (dailyPL[dateStr]) {
                cumulativePL += dailyPL[dateStr];
            }
            dataPoints.push({ x: i, y: Math.round(cumulativePL) });
        }
    }

    const extendedData = [];
    for (let i = 0; i < dataPoints.length - 1; i++) {
        const point1 = dataPoints[i];
        const point2 = dataPoints[i + 1];
        extendedData.push(point1);

        const y1 = point1.y;
        const y2 = point2.y;
        if ((y1 < 0 && y2 > 0) || (y1 > 0 && y2 < 0)) {
            const x1 = point1.x;
            const x2 = point2.x;
            const fraction = Math.abs(y1) / (Math.abs(y1) + Math.abs(y2));
            const crossX = x1 + (x2 - x1) * fraction;
            extendedData.push({ x: crossX, y: 0 });
        }
    }
    extendedData.push(dataPoints[dataPoints.length - 1]);

    const maxLabels = 10;
    const stepSize = Math.max(1, Math.ceil(daysInRange / maxLabels));

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Net P&L',
                data: extendedData,
                borderWidth: 2,
                fill: {
                    target: 'origin',
                    above: 'rgba(0, 196, 140, 0.2)',
                    below: 'rgba(255, 92, 92, 0.2)'
                },
                tension: 0,
                pointRadius: (context) => (context.raw.y === 0 ? 0 : 4),
                pointHoverRadius: (context) => (context.raw.y === 0 ? 0 : 6),
                segment: {
                    borderColor: (ctx) => {
                        const y1 = ctx.p1.parsed.y;
                        const y2 = ctx.p0.parsed.y;
                        if (y1 >= 0 && y2 >= 0) return '#00c48c';
                        if (y1 <= 0 && y2 <= 0) return '#ff5c5c';
                        return y1 > 0 ? '#00c48c' : '#ff5c5c';
                    }
                }
            }, {
                label: 'Zero Line',
                data: visibleDates.map((_, index) => ({ x: index, y: 0 })),
                borderColor: '#8a8d98',
                borderWidth: 1,
                pointRadius: 0,
                fill: false,
                tension: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: visibleDates.length - 1,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawOnChartArea: true,
                        drawTicks: true,
                        tickBorderDash: [5, 5]
                    },
                    ticks: {
                        color: '#8a8d98',
                        stepSize: stepSize,
                        callback: (value, index) => {
                            if (value % stepSize === 0 && value <= visibleDates.length - 1) {
                                return visibleDates[value] || '';
                            }
                            return '';
                        },
                        autoSkip: false
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#8a8d98',
                        callback: (value) => '$' + Math.round(value)
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1d26',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#2a2e3a',
                    borderWidth: 1,
                    displayColors: false,
                    filter: (tooltipItem) => tooltipItem.raw.y !== 0,
                    callbacks: {
                        title: (tooltipItems) => {
                            const index = Math.round(tooltipItems[0].parsed.x);
                            return visibleDates[index] || '';
                        },
                        label: (context) => {
                            const index = context.dataIndex;
                            const currentValue = context.parsed.y;
                            let previousValue = 0;
                            if (index > 0) {
                                for (let i = index - 1; i >= 0; i--) {
                                    if (extendedData[i].y !== 0) {
                                        previousValue = extendedData[i].y;
                                        break;
                                    }
                                }
                            }
                            const relativeChange = currentValue - previousValue;
                            return (relativeChange >= 0 ? '+$' : '-$') + Math.abs(relativeChange);
                        }
                    }
                }
            }
        }
    });
}

// Function to update the Recent Trades table
function updateRecentTrades(start, end, account) {
    const trades = sampleTradeData[account] || [];
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    // Filter trades within the date range and sort by date (descending)
    const filteredTrades = trades
        .filter(trade => trade.date >= startStr && trade.date <= endStr)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20); // Take the 20 most recent

    const tbody = document.getElementById('recentTradesBody');
    tbody.innerHTML = ''; // Clear existing rows

    filteredTrades.forEach(trade => {
        const row = document.createElement('tr');
        const profitClass = trade.profit > 0 ? 'profit' : trade.profit < 0 ? 'loss' : '';
        
        row.innerHTML = `
            <td>${formatDate(trade.date)}</td>
            <td>${trade.symbol}</td>
            <td class="${profitClass}">${formatCurrency(trade.profit)}</td>
        `;
        tbody.appendChild(row);
    });

    // If no trades, show a placeholder message
    if (filteredTrades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No trades found for this period</td></tr>';
    }
}

// Helper function to format date (e.g., "02/28/2025")
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// DOMContentLoaded event listener to initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    initEventListeners();
    console.log('Event listeners initialized');
    
    initSampleData();
    console.log('Sample data initialized');
    
    updateChart(currentStartDate, currentEndDate, 'Apex');
    updateDateRange(currentStartDate, currentEndDate, 'Apex');
});

// Initialize event listeners
function initEventListeners() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    const accountSelector = document.querySelector('.account-selector');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        container.classList.toggle('sidebar-collapsed');
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const dateRangeToggle = document.querySelector('.date-range-toggle');
    const dateRangeDropdown = document.querySelector('.date-range-dropdown');
    let startDate = null, endDate = null;

    dateRangeToggle.addEventListener('click', function() {
        dateRangeDropdown.style.display = dateRangeDropdown.style.display === 'none' ? 'block' : 'none';
    });

    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const range = this.dataset.range;
            const today = new Date('2025-03-03');
            let start, end;

            switch (range) {
                case 'last-week':
                    start = new Date(today);
                    start.setDate(today.getDate() - today.getDay() - 7);
                    end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    break;
                case 'this-week':
                    start = new Date(today);
                    start.setDate(today.getDate() - today.getDay());
                    end = new Date(today);
                    end.setDate(start.getDate() + 6);
                    break;
                case 'last-month':
                    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    end = new Date(today.getFullYear(), today.getMonth(), 0);
                    break;
                case 'this-month':
                    start = new Date(today.getFullYear(), today.getMonth(), 1);
                    end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    break;
                case 'this-year':
                    start = new Date(today.getFullYear(), 0, 1);
                    end = new Date(today.getFullYear(), 11, 31);
                    break;
                case 'ytd':
                    start = new Date(today.getFullYear(), 0, 1);
                    end = today;
                    break;
            }
            const selectedAccount = document.querySelector('.account-toggle').childNodes[0].textContent;
            updateDateRange(start, end, selectedAccount);
            dateRangeDropdown.style.display = 'none';
        });
    });

    let currentMiniMonth = 1;
    let currentMiniYear = 2025;
    const miniCalendar = document.querySelector('.mini-calendar');
    const prevMiniMonth = miniCalendar.querySelector('.prev-month');
    const nextMiniMonth = miniCalendar.querySelector('.next-month');
    const monthYearDisplay = miniCalendar.querySelector('.month-year');
    const daysContainer = miniCalendar.querySelector('.days');
    const selectedRangeDisplay = document.querySelector('.selected-range');
    const applyRangeBtn = document.querySelector('.apply-range');

    function updateMiniCalendar(year, month) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthYearDisplay.textContent = `${months[month]} ${year}`;
        
        daysContainer.innerHTML = '';
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day disabled';
            daysContainer.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = day;
            dayEl.addEventListener('click', () => selectDay(year, month, day));
            daysContainer.appendChild(dayEl);
        }

        updateSelectedRangeDisplay();
    }

    function selectDay(year, month, day) {
        const selectedDate = new Date(year, month, day);
        if (!startDate || (startDate && endDate)) {
            startDate = selectedDate;
            endDate = null;
        } else if (selectedDate < startDate) {
            endDate = startDate;
            startDate = selectedDate;
        } else {
            endDate = selectedDate;
        }
        updateMiniCalendarStyles();
        updateSelectedRangeDisplay();
    }

    function updateMiniCalendarStyles() {
        const days = daysContainer.querySelectorAll('.day');
        days.forEach(day => {
            const dayNum = parseInt(day.textContent);
            const date = new Date(currentMiniYear, currentMiniMonth, dayNum);
            day.classList.remove('selected', 'in-range');
            if (startDate && date.getTime() === startDate.getTime()) day.classList.add('selected');
            if (endDate && date.getTime() === endDate.getTime()) day.classList.add('selected');
            if (startDate && endDate && date > startDate && date < endDate) day.classList.add('in-range');
        });
    }

    function updateSelectedRangeDisplay() {
        if (startDate && endDate) {
            selectedRangeDisplay.textContent = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else if (startDate) {
            selectedRangeDisplay.textContent = `From ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else {
            selectedRangeDisplay.textContent = 'Select range';
        }
    }

    prevMiniMonth.addEventListener('click', () => {
        currentMiniMonth--;
        if (currentMiniMonth < 0) {
            currentMiniMonth = 11;
            currentMiniYear--;
        }
        updateMiniCalendar(currentMiniYear, currentMiniMonth);
    });

    nextMiniMonth.addEventListener('click', () => {
        currentMiniMonth++;
        if (currentMiniMonth > 11) {
            currentMiniMonth = 0;
            currentMiniYear++;
        }
        updateMiniCalendar(currentMiniYear, currentMiniMonth);
    });

    applyRangeBtn.addEventListener('click', () => {
        if (startDate && endDate) {
            const selectedAccount = document.querySelector('.account-toggle').childNodes[0].textContent;
            updateDateRange(startDate, endDate, selectedAccount);
            dateRangeDropdown.style.display = 'none';
        }
    });

    updateMiniCalendar(currentMiniYear, currentMiniMonth);

    const prevMonthBtn = document.querySelector('.calendar-section .prev-month');
    const nextMonthBtn = document.querySelector('.calendar-section .next-month');
    const monthDisplay = document.querySelector('.calendar-nav h3');
    let currentMonth = 1;
    let currentYear = 2025;
    updateCalendar(currentYear, currentMonth, 'Apex');
    
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        const selectedAccount = document.querySelector('.account-toggle').childNodes[0].textContent;
        updateCalendar(currentYear, currentMonth, selectedAccount);
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        const selectedAccount = document.querySelector('.account-toggle').childNodes[0].textContent;
        updateCalendar(currentYear, currentMonth, selectedAccount);
    });

    function updateCalendar(year, month, account) {
        try {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
            monthDisplay.textContent = `${months[month]} ${year}`;
            
            const calendarGrid = document.querySelector('.calendar-grid');
            calendarGrid.innerHTML = '';
            
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfMonth(year, month);
            const trades = sampleTradeData[account] || [];

            // Aggregate trades by date
            const dailyData = {};
            trades.forEach(trade => {
                const [tradeYear, tradeMonth] = trade.date.split('-').map(Number);
                if (tradeYear === year && tradeMonth - 1 === month) {
                    dailyData[trade.date] = dailyData[trade.date] || { profit: 0, trades: 0, wins: 0 };
                    dailyData[trade.date].profit += trade.profit;
                    dailyData[trade.date].trades += 1;
                    if (trade.profit > 0) dailyData[trade.date].wins += 1;
                }
            });

            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                calendarGrid.appendChild(emptyDay);
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = day;
                
                dayDiv.appendChild(dayNumber);
                
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (dailyData[dateKey]) {
                    const { profit, trades: tradeCount, wins } = dailyData[dateKey];
                    dayDiv.className += profit >= 0 ? ' profit' : ' loss';
                    
                    const profitDiv = document.createElement('div');
                    profitDiv.className = 'day-profit';
                    profitDiv.textContent = formatCurrency(Math.round(profit));
                    
                    const tradesDiv = document.createElement('div');
                    tradesDiv.className = 'day-trades';
                    tradesDiv.textContent = `${tradeCount} trade${tradeCount === 1 ? '' : 's'}`;
                    
                    const percentageDiv = document.createElement('div');
                    percentageDiv.className = 'day-percentage';
                    percentageDiv.textContent = `${(wins / tradeCount * 100).toFixed(2)}%`;
                    
                    dayDiv.appendChild(profitDiv);
                    dayDiv.appendChild(tradesDiv);
                    dayDiv.appendChild(percentageDiv);
                }
                
                calendarGrid.appendChild(dayDiv);
            }
        } catch (error) {
            console.error('Error updating calendar:', error);
        }
    }

    const addTradeBtn = document.querySelector('.add-trade-btn');
    addTradeBtn.addEventListener('click', function() {
        showAddTradeModal();
    });

    // Account Selector Dropdown
    const accountToggle = document.querySelector('.account-toggle');
    const accountDropdown = document.querySelector('.account-dropdown');
    const accountOptions = document.querySelectorAll('.account-option');

    accountToggle.addEventListener('click', function() {
        accountDropdown.style.display = accountDropdown.style.display === 'none' ? 'block' : 'none';
    });

    accountOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedAccount = this.dataset.account;
            accountToggle.childNodes[0].textContent = selectedAccount;
            accountDropdown.style.display = 'none';
            
            // Highlight the selected option
            accountOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update with current date range
            updateDateRange(currentStartDate, currentEndDate, selectedAccount);
            updateCalendar(currentYear, currentMonth, selectedAccount);
            console.log(`Selected account: ${selectedAccount}`);
        });
    });

    // Set initial selected account
    const defaultAccount = 'Apex';
    accountToggle.childNodes[0].textContent = defaultAccount;
    accountOptions.forEach(opt => {
        if (opt.dataset.account === defaultAccount) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });

    document.addEventListener('click', function(event) {
        if (!accountSelector.contains(event.target)) {
            accountDropdown.style.display = 'none';
        }
    });

    function updateDateRange(start, end, account) {
        currentStartDate = new Date(start); // Update global date range
        currentEndDate = new Date(end);
        dateRangeToggle.childNodes[0].textContent = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        
        const metrics = calculateMetrics(start, end, account);
        updateDashboardMetrics(metrics);
        updateChart(start, end, account);
        updateRecentTrades(start, end, account); // Added to update Recent Trades
    }

    function calculateMetrics(start, end, account) {
        const trades = sampleTradeData[account] || [];
        let netPL = 0, totalTrades = 0, totalWins = 0, totalLosses = 0;
        let winningDays = 0, losingDays = 0, tradingDays = new Set();
        let avgWin = 0, avgLoss = 0, winCount = 0, lossCount = 0;
    
        const startStr = start.toISOString().slice(0, 10);
        const endStr = end.toISOString().slice(0, 10);
    
        // Filter trades within date range
        const filteredTrades = trades.filter(trade => trade.date >= startStr && trade.date <= endStr);
    
        // Aggregate by day for day-based metrics
        const dailyProfits = {};
        filteredTrades.forEach(trade => {
            netPL += trade.profit;
            totalTrades += 1;
            if (trade.profit > 0) {
                totalWins += 1;
                avgWin += trade.profit;
                winCount += 1;
            } else if (trade.profit < 0) {
                totalLosses += 1;
                avgLoss += Math.abs(trade.profit);
                lossCount += 1;
            }
    
            tradingDays.add(trade.date);
            dailyProfits[trade.date] = (dailyProfits[trade.date] || 0) + trade.profit;
        });
    
        // Calculate winning/losing days
        for (const date in dailyProfits) {
            if (dailyProfits[date] > 0) winningDays++;
            else if (dailyProfits[date] < 0) losingDays++;
        }
    
        const tradeWinPercent = totalTrades > 0 ? (totalWins / totalTrades * 100).toFixed(2) : 0;
        const dayWinPercent = tradingDays.size > 0 ? (winningDays / tradingDays.size * 100).toFixed(2) : 0;
        const winLossRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : avgWin > 0 ? '∞' : 0;
    
        return {
            netPL: Math.round(netPL),
            tradeWinPercent,
            dayWinPercent,
            winLossRatio,
            totalWins,
            totalLosses,
            totalNeutral: totalTrades - totalWins - totalLosses,
            winningDays,
            losingDays,
            neutralDays: tradingDays.size - winningDays - losingDays,
            avgWin: formatCurrency(Math.round(avgWin / (winCount || 1))),
            avgLoss: formatCurrency(Math.round(-avgLoss / (lossCount || 1)))
        };
    }

    function updateDashboardMetrics(metrics) {
        const netPLValue = document.querySelector('.card:nth-child(1) .card-value');
        netPLValue.textContent = formatCurrency(metrics.netPL);
        netPLValue.classList.remove('profit', 'loss', 'zero');
        if (metrics.netPL > 0) {
            netPLValue.classList.add('profit');
        } else if (metrics.netPL < 0) {
            netPLValue.classList.add('loss');
        } else {
            netPLValue.classList.add('zero');
        }

        document.querySelector('.card:nth-child(2) .card-value').textContent = `${metrics.tradeWinPercent}%`;
        document.querySelector('.card:nth-child(2) .indicator.win').textContent = metrics.totalWins;
        document.querySelector('.card:nth-child(2) .indicator.neutral').textContent = metrics.totalNeutral;
        document.querySelector('.card:nth-child(2) .indicator.loss').textContent = metrics.totalLosses;
        document.querySelector('.card:nth-child(3) .card-value').textContent = `${metrics.dayWinPercent}%`;
        document.querySelector('.card:nth-child(3) .indicator.win').textContent = metrics.winningDays;
        document.querySelector('.card:nth-child(3) .indicator.neutral').textContent = metrics.neutralDays;
        document.querySelector('.card:nth-child(3) .indicator.loss').textContent = metrics.losingDays;
        document.querySelector('.card:nth-child(4) .card-value').textContent = metrics.winLossRatio;
        document.querySelector('.card:nth-child(4) .win-value').textContent = metrics.avgWin;
        document.querySelector('.card:nth-child(4) .loss-value').textContent = metrics.avgLoss;
    }
}

function showAddTradeModal() {
    alert('Add Trade functionality would open a modal here');
}

function initSampleData() {
    // This function would normally fetch data from an API or database
}

function formatCurrency(value) {
    return (value >= 0 ? '$' : '-$') + Math.abs(value).toFixed(0);
}

// Sidebar collapse styles
document.head.insertAdjacentHTML('beforeend', `
<style>
.sidebar.collapsed {
    width: 100px;
}

.sidebar.collapsed .logo h1,
.sidebar.collapsed .menu-item span,
.sidebar.collapsed .beta-tag {
    display: none;
}

.sidebar.collapsed .sidebar-toggle {
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    margin: 0 auto;
    text-align: center;
    color: var(--text-color);
    font-size: 18px;
    z-index: 20;
}

.sidebar.collapsed .sidebar-menu {
    padding-top: 60px;
}

.sidebar.collapsed .add-trade-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px auto;
}

.sidebar.collapsed .add-trade-btn i {
    margin-right: 0;
    font-size: 18px;
}

.sidebar.collapsed .menu-item i {
    font-size: 18px;
    margin-right: 0;
    width: 100%;
    text-align: center;
}

.sidebar.collapsed .add-trade-btn span {
    display: none;
}

.container.sidebar-collapsed .main-content {
    margin-left: auto;
    margin-right: auto;
    width: calc(100% - 100px);
    max-width: 1800px;
}
</style>
`);