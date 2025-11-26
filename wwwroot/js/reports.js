// Reports Page - Modern UI Refactored
window.loadReports = function() {
    // Check authentication before loading reports
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-chart-bar"></i> Reports & Analytics</h1>
            <p>Generate detailed reports and insights</p>
        </div>

        <!-- Reports Grid -->
        <div class="reports-grid">
            <!-- Clients by Service Report -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-users"></i> Clients by Service</h2>
                        <p class="card-subtitle">View all clients using a specific service</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label><i class="fas fa-cog"></i> Select Service</label>
                            <select id="reportServiceId" class="form-control">
                                <option value="">Select Service</option>
                            </select>
                        </div>
                        <div class="form-group" style="align-self: flex-end;">
                            <button class="btn btn-primary" onclick="loadClientsByService()">
                                <i class="fas fa-search"></i> Generate Report
                            </button>
                        </div>
                    </div>
                    <div id="clientsByServiceResult" class="report-result"></div>
                </div>
            </div>

            <!-- Employees by Service Report -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-user-tie"></i> Employees by Service</h2>
                        <p class="card-subtitle">View employees assigned to a service</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label><i class="fas fa-cog"></i> Select Service</label>
                            <select id="reportServiceIdEmployees" class="form-control">
                                <option value="">Select Service</option>
                            </select>
                        </div>
                        <div class="form-group" style="align-self: flex-end;">
                            <button class="btn btn-primary" onclick="loadEmployeesByService()">
                                <i class="fas fa-search"></i> Generate Report
                            </button>
                        </div>
                    </div>
                    <div id="employeesByServiceResult" class="report-result"></div>
                </div>
            </div>

            <!-- Payment Report -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-money-bill-wave"></i> Payment Report</h2>
                        <p class="card-subtitle">Filter and analyze payment data</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-calendar-alt"></i> From Date</label>
                            <input type="date" id="reportStartDate" class="form-control">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-calendar-alt"></i> To Date</label>
                            <input type="date" id="reportEndDate" class="form-control">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-filter"></i> Status</label>
                            <select id="reportStatus" class="form-control">
                                <option value="">All Status</option>
                                <option value="Pending">Pending Payment</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="loadPaymentsReport()">
                            <i class="fas fa-chart-line"></i> Generate Report
                        </button>
                    </div>
                    <div id="paymentsReportResult" class="report-result"></div>
                </div>
            </div>

            <!-- Overdue Payments Report -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2><i class="fas fa-exclamation-triangle"></i> Overdue Payments</h2>
                        <p class="card-subtitle">View all overdue payment records</p>
                    </div>
                </div>
                <div class="card-body">
                    <div style="margin-bottom: 1rem;">
                        <button class="btn btn-danger" onclick="loadOverduePaymentsReport()">
                            <i class="fas fa-exclamation-circle"></i> View Overdue Payments
                        </button>
                    </div>
                    <div id="overduePaymentsReportResult" class="report-result"></div>
                </div>
            </div>
        </div>
    `;

    // Load services for dropdowns
    loadServicesForReports();
}

async function loadServicesForReports() {
    try {
        const services = await api.get('/services');
        const reportServiceId = document.getElementById('reportServiceId');
        const reportServiceIdEmployees = document.getElementById('reportServiceIdEmployees');
        
        if (reportServiceId && services) {
            services.forEach(s => {
                reportServiceId.innerHTML += `<option value="${s.id}">${s.name}</option>`;
            });
        }
        
        if (reportServiceIdEmployees && services) {
            services.forEach(s => {
                reportServiceIdEmployees.innerHTML += `<option value="${s.id}">${s.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading services:', error);
        if (window.showToast) {
            window.showToast('Error loading services', 'error');
        }
    }
}

window.loadClientsByService = async function() {
    const serviceId = document.getElementById('reportServiceId').value;
    if (!serviceId) {
        if (window.showToast) {
            window.showToast('Please select a service', 'warning');
        } else {
            alert('Please select a service');
        }
        return;
    }
    
    const container = document.getElementById('clientsByServiceResult');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading report...</div>';
    
    try {
        const clients = await api.get(`/reports/clients-by-service/${serviceId}`);
        
        if (!clients || clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No clients found for this service.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="report-summary">
                <div class="summary-item">
                    <span class="summary-label">Total Clients</span>
                    <span class="summary-value">${clients.length}</span>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Client ID</th>
                            <th>Company Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Start Date</th>
                            <th>Employee Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.map(c => `
                            <tr>
                                <td><span class="badge badge-primary">${c.id}</span></td>
                                <td><strong>${c.companyName}</strong></td>
                                <td>${c.contactPerson}</td>
                                <td><a href="mailto:${c.email}">${c.email}</a></td>
                                <td>${c.phone}</td>
                                <td>${new Date(c.startDate).toLocaleDateString('en-US')}</td>
                                <td><span class="badge badge-info">${c.numberOfEmployees}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading clients by service:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading report. Please try again.</p>
            </div>
        `;
        if (window.showToast) {
            window.showToast('Error loading report', 'error');
        }
    }
}

window.loadEmployeesByService = async function() {
    const serviceId = document.getElementById('reportServiceIdEmployees').value;
    if (!serviceId) {
        if (window.showToast) {
            window.showToast('Please select a service', 'warning');
        } else {
            alert('Please select a service');
        }
        return;
    }
    
    const container = document.getElementById('employeesByServiceResult');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading report...</div>';
    
    try {
        const employees = await api.get(`/reports/employees-by-service/${serviceId}`);
        
        if (!employees || employees.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No employees found for this service.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="report-summary">
                <div class="summary-item">
                    <span class="summary-label">Total Employees</span>
                    <span class="summary-value">${employees.length}</span>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Employee Code</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Hire Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map(e => `
                            <tr>
                                <td><span class="badge badge-primary">${e.employeeCode}</span></td>
                                <td><strong>${e.fullName}</strong></td>
                                <td><a href="mailto:${e.email}">${e.email}</a></td>
                                <td>${e.phone}</td>
                                <td>${e.position}</td>
                                <td><span class="badge badge-secondary">${e.departmentName}</span></td>
                                <td>${new Date(e.hireDate).toLocaleDateString('en-US')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading employees by service:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading report. Please try again.</p>
            </div>
        `;
        if (window.showToast) {
            window.showToast('Error loading report', 'error');
        }
    }
}

window.loadPaymentsReport = async function() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const status = document.getElementById('reportStatus').value;
    
    const container = document.getElementById('paymentsReportResult');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading report...</div>';
    
    let url = '/reports/payments';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();
    
    try {
        const report = await api.get(url);
        
        container.innerHTML = `
            <div class="report-summary-grid">
                <div class="summary-card">
                    <div class="summary-icon" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-light));">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Total Payments</span>
                        <span class="summary-value">${report.totalPayments || 0}</span>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon" style="background: linear-gradient(135deg, var(--success-color), #059669);">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Total Amount</span>
                        <span class="summary-value">$${(report.totalAmount || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon" style="background: linear-gradient(135deg, var(--info-color), #2563eb);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Paid</span>
                        <span class="summary-value">$${(report.paidAmount || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon" style="background: linear-gradient(135deg, var(--warning-color), #d97706);">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Pending</span>
                        <span class="summary-value">$${(report.pendingAmount || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon" style="background: linear-gradient(135deg, var(--danger-color), #dc2626);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Overdue</span>
                        <span class="summary-value">$${(report.overdueAmount || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="table-container" style="margin-top: 1.5rem;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Client</th>
                            <th>Amount</th>
                            <th>Payment Date</th>
                            <th>Due Date</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(report.payments || []).map(p => `
                            <tr>
                                <td><span class="badge badge-primary">${p.paymentCode}</span></td>
                                <td><strong>${p.clientName}</strong></td>
                                <td><strong>$${p.amount.toLocaleString()}</strong></td>
                                <td>${new Date(p.paymentDate).toLocaleDateString('en-US')}</td>
                                <td>${new Date(p.dueDate).toLocaleDateString('en-US')}</td>
                                <td><span class="badge badge-secondary">${p.paymentMethod}</span></td>
                                <td>${getPaymentStatusBadge(p.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading payments report:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading report. Please try again.</p>
            </div>
        `;
        if (window.showToast) {
            window.showToast('Error loading report', 'error');
        }
    }
}

window.loadOverduePaymentsReport = async function() {
    const container = document.getElementById('overduePaymentsReportResult');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading report...</div>';
    
    try {
        const report = await api.get('/reports/overdue-payments');
        
        if (!report || report.totalOverdue === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                    <p>No overdue payments found. All payments are up to date!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="report-summary-grid">
                <div class="summary-card" style="border-left: 4px solid var(--danger-color);">
                    <div class="summary-icon" style="background: linear-gradient(135deg, var(--danger-color), #dc2626);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Total Overdue</span>
                        <span class="summary-value">${report.totalOverdue}</span>
                    </div>
                </div>
                <div class="summary-card" style="border-left: 4px solid var(--danger-color);">
                    <div class="summary-icon" style="background: linear-gradient(135deg, var(--danger-color), #dc2626);">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Total Amount</span>
                        <span class="summary-value">$${(report.totalAmount || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="table-container" style="margin-top: 1.5rem;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Client</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Days Overdue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(report.payments || []).map(p => `
                            <tr>
                                <td><span class="badge badge-danger">${p.paymentCode}</span></td>
                                <td><strong>${p.clientName}</strong></td>
                                <td><a href="mailto:${p.clientEmail}">${p.clientEmail}</a></td>
                                <td>${p.clientPhone}</td>
                                <td><strong>$${p.amount.toLocaleString()}</strong></td>
                                <td>${new Date(p.dueDate).toLocaleDateString('en-US')}</td>
                                <td><span class="badge badge-danger">${p.daysOverdue} days</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading overdue payments report:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading report. Please try again.</p>
            </div>
        `;
        if (window.showToast) {
            window.showToast('Error loading report', 'error');
        }
    }
}

function getPaymentStatusBadge(status) {
    const statusMap = {
        'Paid': 'badge-success',
        'Pending Payment': 'badge-warning',
        'Pending': 'badge-warning',
        'Overdue': 'badge-danger'
    };
    const badgeClass = statusMap[status] || 'badge-secondary';
    return `<span class="badge ${badgeClass}">${status}</span>`;
}
