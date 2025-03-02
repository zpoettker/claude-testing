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
    const greenGradient = ctx.createLinearGradient(0, 0, 0, 400);
    greenGradient.addColorStop(0, 'rgba(0, 196, 140, 0.5)');
    greenGradient.addColorStop(0.5, 'rgba(0, 196, 140, 0.25)');
    greenGradient.addColorStop(1, 'rgba(0, 196, 140, 0)');
    
    const redGradient = ctx.createLinearGradient(0, 0, 0, 400);
    redGradient.addColorStop(0, 'rgba(255, 92, 92, 0.5)');
    redGradient.addColorStop(0.5, 'rgba(255, 92, 92, 0.25)');
    redGradient.addColorStop(1, 'rgba(255, 92, 92, 0)');
    
    // Custom plugin to color line segments based on y-value
    const colorLinePlugin = {
        id: 'colorLine',
        beforeDatasetsDraw: function(chart, args, options) {
            const ctx = chart.ctx;
            const yAxis = chart.scales.y;
            const xAxis = chart.scales.x;
            const dataset = chart.data.datasets[0];
            const points = dataset.data;
            
            // Don't draw the original line
            chart.getDatasetMeta(0).dataset.draw = function() {};
            
            // Draw custom colored line segments
            ctx.save();
            ctx.lineWidth = dataset.borderWidth || 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Apply line tension (curve) if specified
            const tension = dataset.tension || 0;
            
            // Get pixel positions for all points
            const pixelPoints = points.map(function(value, index) {
                return {
                    x: xAxis.getPixelForValue(index),
                    y: yAxis.getPixelForValue(value),
                    value: value
                };
            });
            
            // Draw line segments with appropriate colors
            for (let i = 0; i < pixelPoints.length - 1; i++) {
                const p0 = pixelPoints[i];
                const p1 = pixelPoints[i + 1];
                
                // If both points are on the same side of zero, draw a simple line
                if ((p0.value >= 0 && p1.value >= 0) || (p0.value < 0 && p1.value < 0)) {
                    ctx.beginPath();
                    ctx.strokeStyle = p0.value >= 0 ? '#00c48c' : '#ff5c5c';
                    
                    if (tension > 0) {
                        // Draw curved line
                        const cp1x = p0.x + (p1.x - p0.x) / 3;
                        const cp1y = p0.y + (p1.y - p0.y) * tension;
                        const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
                        const cp2y = p0.y + (p1.y - p0.y) * (1 - tension);
                        
                        ctx.moveTo(p0.x, p0.y);
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1.x, p1.y);
                    } else {
                        // Draw straight line
                        ctx.moveTo(p0.x, p0.y);
                        ctx.lineTo(p1.x, p1.y);
                    }
                    
                    ctx.stroke();
                } 
                // If points cross the zero line, we need to find the intersection and draw two segments
                else {
                    // Calculate where the line crosses y=0
                    const zeroY = yAxis.getPixelForValue(0);
                    let zeroX;
                    
                    if (tension > 0) {
                        // For curved lines, approximate the intersection
                        // This is a simplified approach - for perfect accuracy would need more complex math
                        const t = Math.abs(p0.value) / (Math.abs(p0.value) + Math.abs(p1.value));
                        zeroX = p0.x + (p1.x - p0.x) * t;
                    } else {
                        // For straight lines, simple linear interpolation
                        const t = Math.abs(p0.value) / (Math.abs(p0.value) + Math.abs(p1.value));
                        zeroX = p0.x + (p1.x - p0.x) * t;
                    }
                    
                    // Draw first segment
                    ctx.beginPath();
                    ctx.strokeStyle = p0.value >= 0 ? '#00c48c' : '#ff5c5c';
                    
                    if (tension > 0) {
                        // Draw curved segment from p0 to zero crossing
                        const cp1x = p0.x + (zeroX - p0.x) / 2;
                        const cp1y = p0.y + (zeroY - p0.y) * tension;
                        
                        ctx.moveTo(p0.x, p0.y);
                        ctx.quadraticCurveTo(cp1x, cp1y, zeroX, zeroY);
                    } else {
                        // Draw straight segment
                        ctx.moveTo(p0.x, p0.y);
                        ctx.lineTo(zeroX, zeroY);
                    }
                    
                    ctx.stroke();
                    
                    // Draw second segment
                    ctx.beginPath();
                    ctx.strokeStyle = p1.value >= 0 ? '#00c48c' : '#ff5c5c';
                    
                    if (tension > 0) {
                        // Draw curved segment from zero crossing to p1
                        const cp2x = zeroX + (p1.x - zeroX) / 2;
                        const cp2y = zeroY + (p1.y - zeroY) * tension;
                        
                        ctx.moveTo(zeroX, zeroY);
                        ctx.quadraticCurveTo(cp2x, cp2y, p1.x, p1.y);
                    } else {
                        // Draw straight segment
                        ctx.moveTo(zeroX, zeroY);
                        ctx.lineTo(p1.x, p1.y);
                    }
                    
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        }
    };
    
    // Create the chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'P&L',
                data: data,
                borderWidth: 2,
                tension: 0.4,
                borderColor: '#ff5c5c', // Default color, will be overridden by plugin
                fill: {
                    target: 'origin',
                    above: greenGradient,   // Area above zero line is green
                    below: redGradient      // Area below zero line is red
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
        plugins: [colorLinePlugin],
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
    width: calc(100% - 200px); /* 100px on each side for equal spacing */
    max-width: 1800px; /* Prevent excessive width on very large screens */
}
</style>
`);
