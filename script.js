let chartInstance = null; // Global variable to store chart instance

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    initEventListeners();
    console.log('Event listeners initialized');
    
    initSampleData();
    console.log('Sample data initialized');
    
    // Initialize chart with default range (e.g., February 2025)
    const defaultStart = new Date('2025-02-01');
    const defaultEnd = new Date('2025-02-28');
    updateChart(defaultStart, defaultEnd);
});

// Helper functions for calendar
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

// Sample trade data by date
const sampleTradeData = {
    '2025-02-04': { profit: 218, trades: 2, wins: 0, losses: 2 },
    '2025-02-06': { profit: 285, trades: 5, wins: 0, losses: 5 },
    '2025-02-11': { profit: -30, trades: 1, wins: 0, losses: 1 },
    '2025-02-12': { profit: -161, trades: 5, wins: 0, losses: 5 },
    '2025-02-13': { profit: 323, trades: 3, wins: 2, losses: 1 },
    '2025-02-14': { profit: 541, trades: 13, wins: 5, losses: 8 },
    '2025-02-17': { profit: -1340, trades: 12, wins: 1, losses: 11 },
    '2025-02-19': { profit: 214, trades: 22, wins: 7, losses: 15 },
    '2025-02-20': { profit: -215, trades: 1, wins: 0, losses: 1 },
    '2025-02-25': { profit: -268, trades: 2, wins: 0, losses: 2 },
    '2025-02-26': { profit: 623, trades: 10, wins: 4, losses: 6 },
    '2025-02-27': { profit: 345, trades: 3, wins: 2, losses: 1 },
    '2025-02-28': { profit: 489, trades: 11, wins: 2, losses: 9 }
};

// Initialize event listeners
function initEventListeners() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
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

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
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
            updateDateRange(start, end);
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
            updateDateRange(startDate, endDate);
            dateRangeDropdown.style.display = 'none';
        }
    });

    updateMiniCalendar(currentMiniYear, currentMiniMonth);

    const prevMonthBtn = document.querySelector('.calendar-section .prev-month');
    const nextMonthBtn = document.querySelector('.calendar-section .next-month');
    const monthDisplay = document.querySelector('.calendar-nav h3');
    let currentMonth = 1;
    let currentYear = 2025;
    updateCalendar(currentYear, currentMonth);
    
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar(currentYear, currentMonth);
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar(currentYear, currentMonth);
    });

    function updateCalendar(year, month) {
        try {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
            monthDisplay.textContent = `${months[month]} ${year}`;
            
            const calendarGrid = document.querySelector('.calendar-grid');
            calendarGrid.innerHTML = '';
            
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfMonth(year, month);

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
                if (sampleTradeData[dateKey]) {
                    const { profit, trades: tradeCount, wins } = sampleTradeData[dateKey];
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

    function updateDateRange(start, end) {
        dateRangeToggle.childNodes[0].textContent = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        
        const metrics = calculateMetrics(start, end);
        updateDashboardMetrics(metrics);
        updateChart(start, end); // Update chart with new range
    }

    function calculateMetrics(start, end) {
        let netPL = 0, totalTrades = 0, totalWins = 0, totalLosses = 0;
        let winningDays = 0, losingDays = 0, tradingDays = new Set();
        let avgWin = 0, avgLoss = 0, winCount = 0, lossCount = 0;

        for (const dateStr in sampleTradeData) {
            const date = new Date(dateStr);
            if (date >= start && date <= end) {
                const dayData = sampleTradeData[dateStr];
                netPL += dayData.profit;
                totalTrades += dayData.trades;
                totalWins += dayData.wins;
                totalLosses += dayData.losses;
                tradingDays.add(dateStr);

                if (dayData.profit > 0) winningDays++;
                else if (dayData.profit < 0) losingDays++;

                if (dayData.wins > 0) {
                    avgWin += dayData.profit / dayData.wins;
                    winCount++;
                }
                if (dayData.losses > 0) {
                    avgLoss += Math.abs(dayData.profit) / dayData.losses;
                    lossCount++;
                }
            }
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

    function updateChart(start, end) {
        const canvas = document.getElementById('pnlChart');
        if (!canvas) {
            console.error('Chart canvas element not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Prepare data
        const startDate = new Date(start);
        const endDate = new Date(end);
        const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Include start day
        const visibleDates = [];
        const dataPoints = [];
        let cumulativePL = 0;

        // Generate visible dates and data points (starting at $0)
        for (let i = 0; i < daysInRange; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().slice(0, 10); // e.g., "2025-02-04"
            visibleDates.push(dateStr.slice(5)); // "02-04" for x-axis labels

            if (i === 0) {
                dataPoints.push({ x: 0, y: 0 }); // Start at $0, x=0
            } else {
                if (sampleTradeData[dateStr]) {
                    cumulativePL += sampleTradeData[dateStr].profit;
                }
                dataPoints.push({ x: i, y: Math.round(cumulativePL) }); // Use numerical indices for x
            }
        }

        // Add invisible zero-crossing points at exact fractional positions
        const extendedData = [];
        for (let i = 0; i < dataPoints.length - 1; i++) {
            const point1 = dataPoints[i];
            const point2 = dataPoints[i + 1];
            extendedData.push(point1);

            const y1 = point1.y;
            const y2 = point2.y;
            if ((y1 < 0 && y2 > 0) || (y1 > 0 && y2 < 0)) {
                // Calculate where the line crosses y = 0
                const x1 = point1.x;
                const x2 = point2.x;
                const fraction = Math.abs(y1) / (Math.abs(y1) + Math.abs(y2));
                const crossX = x1 + (x2 - x1) * fraction;

                // Insert the zero-crossing point at the exact fractional position
                extendedData.push({ x: crossX, y: 0 });
            }
        }
        extendedData.push(dataPoints[dataPoints.length - 1]); // Add the last point

        // Create the chart
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Net P&L',
                    data: extendedData,
                    borderWidth: 2,
                    fill: false,
                    tension: 0, // Jagged line
                    pointRadius: (context) => {
                        const point = context.raw;
                        return point.y === 0 ? 0 : 4; // Hide zero-crossing points
                    },
                    pointHoverRadius: (context) => {
                        const point = context.raw;
                        return point.y === 0 ? 0 : 6;
                    },
                    segment: {
                        borderColor: (ctx) => {
                            const y1 = ctx.p1.parsed.y;
                            const y2 = ctx.p0.parsed.y;
                            if (y1 >= 0 && y2 >= 0) return '#00c48c'; // Green above $0
                            if (y1 <= 0 && y2 <= 0) return '#ff5c5c'; // Red below $0
                            return y1 > 0 ? '#00c48c' : '#ff5c5c'; // Mixed segment takes endpoint color
                        }
                    }
                }, {
                    // Zero line dataset
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
                        type: 'linear', // Use linear scale for numerical x-values
                        min: 0,
                        max: visibleDates.length - 1,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawOnChartArea: true, // Ensure grid lines appear
                            drawTicks: true // Show ticks at visible dates
                        },
                        ticks: {
                            color: '#8a8d98',
                            callback: (value, index) => {
                                return visibleDates[index] || ''; // Show only visible date labels
                            },
                            stepSize: 1, // Ensure each date gets a grid line and label
                            autoSkip: false // Prevent skipping labels
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
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1d26',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#2a2e3a',
                        borderWidth: 1,
                        displayColors: false,
                        filter: (tooltipItem) => {
                            // Show tooltip only for visible data points
                            return tooltipItem.raw.y !== 0;
                        },
                        callbacks: {
                            label: (context) => {
                                let value = context.parsed.y;
                                return (value >= 0 ? '+$' : '-$') + Math.abs(value);
                            }
                        }
                    }
                }
            }
        });
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