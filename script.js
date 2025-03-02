document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Initialize P&L Chart
    setTimeout(() => {
        try {
            initPnlChart();
            console.log('Chart initialized');
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }, 500);
    
    // Initialize event listeners
    initEventListeners();
    console.log('Event listeners initialized');
    
    // Initialize sample data
    initSampleData();
    console.log('Sample data initialized');
});

// Initialize the P&L Chart
function initPnlChart() {
    console.log('Initializing chart...');
    const canvas = document.getElementById('pnlChart');
    
    if (!canvas) {
        console.error('Chart canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Sample data for the chart
    const labels = ['02/03/25', '02/12/25', '02/19/25', '02/27/25'];
    const data = [-200, 800, -400, 1200];
    
    // Create gradient for the chart area
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 196, 140, 0.5)');
    gradient.addColorStop(0.5, 'rgba(0, 196, 140, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 196, 140, 0)');
    
    const negativeGradient = ctx.createLinearGradient(0, 0, 0, 400);
    negativeGradient.addColorStop(0, 'rgba(255, 92, 92, 0.5)');
    negativeGradient.addColorStop(0.5, 'rgba(255, 92, 92, 0.25)');
    negativeGradient.addColorStop(1, 'rgba(255, 92, 92, 0)');
    
    // Create the chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'P&L',
                data: data,
                borderColor: function(context) {
                    const index = context.dataIndex;
                    const value = context.dataset.data[index];
                    return value >= 0 ? '#00c48c' : '#ff5c5c';
                },
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                backgroundColor: function(context) {
                    const index = context.dataIndex;
                    const value = context.dataset.data[index];
                    return value >= 0 ? gradient : negativeGradient;
                },
                pointBackgroundColor: function(context) {
                    const index = context.dataIndex;
                    const value = context.dataset.data[index];
                    return value >= 0 ? '#00c48c' : '#ff5c5c';
                },
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#8a8d98',
                        callback: function(value) {
                            if (value >= 1000) {
                                return '$' + (value / 1000).toFixed(1) + 'K';
                            } else if (value <= -1000) {
                                return '-$' + (Math.abs(value) / 1000).toFixed(1) + 'K';
                            }
                            return '$' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#8a8d98'
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
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed.y;
                            if (value >= 0) {
                                return '+$' + value.toFixed(2);
                            } else {
                                return '-$' + Math.abs(value).toFixed(2);
                            }
                        }
                    }
                }
            }
        }
    });
}

// Initialize event listeners
function initEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        container.classList.toggle('sidebar-collapsed');
        
        // Keep hamburger icon for both states
        // We don't need to change the icon as it will remain as hamburger (fa-bars)
    });
    
    // Menu items click
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Tabs click
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Calendar navigation
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    const monthDisplay = document.querySelector('.calendar-nav h3');
    
    let currentMonth = 1; // February (0-indexed)
    let currentYear = 2025;
    
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendarHeader();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendarHeader();
    });
    
    function updateCalendarHeader() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthDisplay.textContent = `${months[currentMonth]} ${currentYear}`;
    }
    
    // Add Trade button
    const addTradeBtn = document.querySelector('.add-trade-btn');
    addTradeBtn.addEventListener('click', function() {
        showAddTradeModal();
    });
}

// Show Add Trade Modal (placeholder)
function showAddTradeModal() {
    alert('Add Trade functionality would open a modal here');
}

// Initialize sample data (for demonstration)
function initSampleData() {
    // This function would normally fetch data from an API or database
    // For this demo, we're using the hardcoded data in the HTML
    
    // You could add code here to dynamically populate the calendar, trades table, etc.
    // based on real data from an API or database
}

// Helper function to format currency
function formatCurrency(value) {
    if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
    } else if (value <= -1000) {
        return '-$' + (Math.abs(value) / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toFixed(2);
}

// Add CSS class for collapsed sidebar
document.head.insertAdjacentHTML('beforeend', `
<style>
.sidebar.collapsed {
    width: 80px;
}

.sidebar.collapsed .logo h1,
.sidebar.collapsed .menu-item span,
.sidebar.collapsed .beta-tag {
    display: none;
}

.sidebar.collapsed .add-trade-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.sidebar.collapsed .add-trade-btn i {
    margin-right: 0;
    font-size: 18px;
}

.sidebar.collapsed .add-trade-btn span {
    display: none;
}

.container.sidebar-collapsed .main-content {
    margin-right: 80px;
}
</style>
`);
