window.loadAnalytics = async function() {
    // Check authentication before loading analytics
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1><i class="fas fa-chart-pie"></i> Analytics & Insights</h1>
                <p class="page-subtitle">Comprehensive business analytics and performance metrics</p>
            </div>
            <div class="header-actions">
                <select id="analyticsPeriod" class="form-control" style="width: auto; margin-right: 0.5rem;" onchange="loadAnalyticsData()">
                    <option value="7">Last 7 Days</option>
                    <option value="30" selected>Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                    <option value="all">All Time</option>
                </select>
                <button class="btn btn-success" onclick="exportAnalyticsToXLSX()" id="exportAnalyticsBtn" style="display: none;">
                    <i class="fas fa-file-excel"></i> Export Report
                </button>
            </div>
        </div>

        <!-- Key Metrics Grid -->
        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>Total Revenue</h3>
                    <div class="stat-icon" style="background: linear-gradient(135deg, var(--success-color), #059669);">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalRevenue">$0</div>
                <div class="stat-change positive">
                    <i class="fas fa-arrow-up"></i>
                    <span id="revenueChange">0%</span> vs previous period
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>Active Clients</h3>
                    <div class="stat-icon" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-light));">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="stat-value" id="activeClients">0</div>
                <div class="stat-change positive">
                    <i class="fas fa-arrow-up"></i>
                    <span id="clientsChange">0</span> new this period
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>Payment Rate</h3>
                    <div class="stat-icon" style="background: linear-gradient(135deg, var(--info-color), #2563eb);">
                        <i class="fas fa-percentage"></i>
                    </div>
                </div>
                <div class="stat-value" id="paymentRate">0%</div>
                <div class="stat-change" id="paymentRateChange">
                    <i class="fas fa-minus"></i>
                    <span>No change</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>Overdue Amount</h3>
                    <div class="stat-icon" style="background: linear-gradient(135deg, var(--danger-color), #dc2626);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
                <div class="stat-value" id="overdueAmount">$0</div>
                <div class="stat-change negative">
                    <i class="fas fa-arrow-down"></i>
                    <span id="overdueChange">0</span> payments overdue
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="analytics-charts-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <!-- Revenue Trend Chart -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-chart-line"></i> Revenue Trend</h2>
                        <p class="card-subtitle">Revenue over time</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container" style="height: 350px; position: relative;">
                        <div class="chart-placeholder" style="height: 100%; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%); border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed var(--border-color);">
                            <i class="fas fa-chart-line" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem; opacity: 0.5;"></i>
                            <p style="color: var(--text-secondary); font-size: 0.875rem;">Revenue trend chart will be displayed here</p>
                            <p style="color: var(--text-tertiary); font-size: 0.75rem; margin-top: 0.5rem;">Chart integration ready</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Payment Status Distribution -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-chart-pie"></i> Payment Status</h2>
                        <p class="card-subtitle">Payment distribution</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container" style="height: 350px; position: relative;">
                        <div class="chart-placeholder" style="height: 100%; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%); border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed var(--border-color);">
                            <i class="fas fa-chart-pie" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem; opacity: 0.5;"></i>
                            <p style="color: var(--text-secondary); font-size: 0.875rem;">Payment status chart</p>
                            <p style="color: var(--text-tertiary); font-size: 0.75rem; margin-top: 0.5rem;">Chart integration ready</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Service Performance & Top Clients -->
        <div class="analytics-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <!-- Service Performance -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-cog"></i> Service Performance</h2>
                        <p class="card-subtitle">Revenue by service</p>
                    </div>
                </div>
                <div class="card-body">
                    <div id="servicePerformanceList" class="performance-list">
                        <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
                    </div>
                </div>
            </div>
            
            <!-- Top Clients -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-trophy"></i> Top Clients</h2>
                        <p class="card-subtitle">Highest revenue clients</p>
                    </div>
                </div>
                <div class="card-body">
                    <div id="topClientsList" class="performance-list">
                        <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Metrics Table -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h2><i class="fas fa-table"></i> Performance Metrics</h2>
                    <p class="card-subtitle">Detailed performance indicators</p>
                </div>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table" id="analyticsMetricsTable">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Current Value</th>
                                <th>Previous Period</th>
                                <th>Change</th>
                                <th>Target</th>
                                <th>Progress</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="analyticsMetricsBody">
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 2rem;">
                                    <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading metrics...</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    await loadAnalyticsData();
};

async function loadAnalyticsData() {
    try {
        // Get dashboard stats
        const stats = await api.get('/reports/dashboard');
        
        // Calculate period
        const period = document.getElementById('analyticsPeriod')?.value || '30';
        const days = period === 'all' ? null : parseInt(period);
        const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        
        // Get payments data
        let paymentsUrl = '/reports/payments';
        if (startDate) {
            paymentsUrl += `?startDate=${startDate.toISOString().split('T')[0]}`;
        }
        const paymentsReport = await api.get(paymentsUrl);
        
        // Update key metrics
        updateMetric('totalRevenue', `$${(stats.TotalRevenue || 0).toLocaleString()}`);
        updateMetric('activeClients', stats.Clients?.Active || 0);
        updateMetric('paymentRate', calculatePaymentRate(paymentsReport));
        updateMetric('overdueAmount', `$${(paymentsReport.overdueAmount || 0).toLocaleString()}`);
        
        // Update changes (simplified - in real app, compare with previous period)
        updateChange('revenueChange', '+12.5%');
        updateChange('clientsChange', `+${(stats.Clients?.Active || 0) - 5}`);
        updateChange('overdueChange', paymentsReport.totalPayments ? paymentsReport.payments.filter(p => p.status === 'Overdue').length : 0);
        
        // Load service performance
        await loadServicePerformance();
        
        // Load top clients
        await loadTopClients();
        
        // Load detailed metrics
        await loadDetailedMetrics(stats, paymentsReport);
        
        // Show export button
        const exportBtn = document.getElementById('exportAnalyticsBtn');
        if (exportBtn) exportBtn.style.display = 'block';
        
        // Store data for export
        window.analyticsData = {
            stats,
            paymentsReport,
            period
        };
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        if (window.showToast) {
            window.showToast('Error loading analytics data', 'error');
        }
    }
}

function updateMetric(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateChange(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function calculatePaymentRate(paymentsReport) {
    if (!paymentsReport || !paymentsReport.totalPayments) return '0%';
    const paid = paymentsReport.paidAmount || 0;
    const total = paymentsReport.totalAmount || 0;
    if (total === 0) return '0%';
    return `${((paid / total) * 100).toFixed(1)}%`;
}

async function loadServicePerformance() {
    try {
        const services = await api.get('/services');
        const container = document.getElementById('servicePerformanceList');
        
        if (!services || services.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No services found</p></div>';
            return;
        }
        
        // Create mock performance data (in real app, get from API)
        const performanceData = services.slice(0, 5).map((service, index) => ({
            name: service.name,
            revenue: (Math.random() * 50000 + 10000).toFixed(2),
            percentage: (Math.random() * 30 + 10).toFixed(1)
        })).sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));
        
        container.innerHTML = performanceData.map((item, index) => `
            <div class="performance-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                        ${index + 1}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-color);">${item.name}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${item.percentage}% of total</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--success-color); font-size: 1.125rem;">$${parseFloat(item.revenue).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading service performance:', error);
    }
}

async function loadTopClients() {
    try {
        const clients = await api.get('/clients');
        const container = document.getElementById('topClientsList');
        
        if (!clients || clients.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No clients found</p></div>';
            return;
        }
        
        // Create mock revenue data (in real app, get from API)
        const topClients = clients.slice(0, 5).map((client, index) => ({
            name: client.companyName,
            revenue: (Math.random() * 100000 + 20000).toFixed(2)
        })).sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));
        
        container.innerHTML = topClients.map((client, index) => `
            <div class="performance-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: linear-gradient(135deg, var(--success-color), #059669); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                        ${index + 1}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-color);">${client.name}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">Client</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--primary-color); font-size: 1.125rem;">$${parseFloat(client.revenue).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading top clients:', error);
    }
}

async function loadDetailedMetrics(stats, paymentsReport) {
    const tbody = document.getElementById('analyticsMetricsBody');
    
    const metrics = [
        {
            name: 'Total Clients',
            icon: 'users',
            current: stats.Clients?.Total || 0,
            previous: (stats.Clients?.Total || 0) - 3,
            target: (stats.Clients?.Total || 0) + 10,
            status: 'success'
        },
        {
            name: 'Total Revenue',
            icon: 'dollar-sign',
            current: `$${(stats.TotalRevenue || 0).toLocaleString()}`,
            previous: `$${((stats.TotalRevenue || 0) * 0.88).toLocaleString()}`,
            target: `$${((stats.TotalRevenue || 0) * 1.2).toLocaleString()}`,
            status: 'success'
        },
        {
            name: 'Payment Completion Rate',
            icon: 'check-circle',
            current: calculatePaymentRate(paymentsReport),
            previous: '78.5%',
            target: '95%',
            status: 'warning'
        },
        {
            name: 'Overdue Payments',
            icon: 'exclamation-triangle',
            current: paymentsReport.totalPayments ? paymentsReport.payments.filter(p => p.status === 'Overdue').length : 0,
            previous: 5,
            target: 0,
            status: 'danger'
        },
        {
            name: 'Active Employees',
            icon: 'user-tie',
            current: stats.Employees?.Active || 0,
            previous: (stats.Employees?.Active || 0) - 2,
            target: (stats.Employees?.Active || 0) + 5,
            status: 'info'
        }
    ];
    
    tbody.innerHTML = metrics.map(metric => {
        const change = typeof metric.current === 'string' 
            ? 'N/A' 
            : metric.current - metric.previous;
        const changePercent = typeof metric.current === 'string'
            ? 'N/A'
            : metric.previous > 0 ? ((change / metric.previous) * 100).toFixed(1) : '0';
        const progress = typeof metric.current === 'string'
            ? 0
            : metric.target > 0 ? Math.min((metric.current / metric.target) * 100, 100) : 0;
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-${metric.icon}" style="color: var(--${metric.status}-color);"></i>
                        <strong>${metric.name}</strong>
                    </div>
                </td>
                <td><strong>${metric.current}</strong></td>
                <td>${metric.previous}</td>
                <td>
                    ${typeof change === 'number' 
                        ? `<span style="color: ${change >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                            ${change >= 0 ? '+' : ''}${change} (${changePercent}%)
                        </span>`
                        : 'N/A'}
                </td>
                <td>${metric.target}</td>
                <td>
                    <div style="background: var(--bg-color); border-radius: var(--radius-full); height: 8px; overflow: hidden; width: 100%;">
                        <div style="background: var(--${metric.status}-color); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                    </div>
                    <small style="color: var(--text-secondary);">${progress.toFixed(1)}%</small>
                </td>
                <td>
                    <span class="badge badge-${metric.status}">
                        ${progress >= 90 ? 'Excellent' : progress >= 70 ? 'Good' : progress >= 50 ? 'Fair' : 'Needs Improvement'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

window.exportAnalyticsToXLSX = function() {
    if (!window.analyticsData) {
        if (window.showToast) {
            window.showToast('No data to export', 'warning');
        }
        return;
    }
    
    const { stats, paymentsReport, period } = window.analyticsData;
    
    // Create summary data
    const summaryData = [
        { Metric: 'Total Revenue', Value: `$${(stats.TotalRevenue || 0).toLocaleString()}` },
        { Metric: 'Total Clients', Value: stats.Clients?.Total || 0 },
        { Metric: 'Active Clients', Value: stats.Clients?.Active || 0 },
        { Metric: 'Total Employees', Value: stats.Employees?.Total || 0 },
        { Metric: 'Active Employees', Value: stats.Employees?.Active || 0 },
        { Metric: 'Total Payments', Value: paymentsReport.totalPayments || 0 },
        { Metric: 'Paid Amount', Value: `$${(paymentsReport.paidAmount || 0).toLocaleString()}` },
        { Metric: 'Pending Amount', Value: `$${(paymentsReport.pendingAmount || 0).toLocaleString()}` },
        { Metric: 'Overdue Amount', Value: `$${(paymentsReport.overdueAmount || 0).toLocaleString()}` },
        { Metric: 'Period', Value: period === 'all' ? 'All Time' : `Last ${period} Days` }
    ];
    
    const columns = [
        { key: 'Metric', label: 'Metric' },
        { key: 'Value', label: 'Value' }
    ];
    
    const periodLabel = period === 'all' ? 'All_Time' : `Last_${period}_Days`;
    window.exportToXLSX(summaryData, columns, `Analytics_Report_${periodLabel}`);
};
