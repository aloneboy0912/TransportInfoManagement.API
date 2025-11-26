// Mock data for payments
const mockPayments = [
    { id: 1, paymentCode: "PAY001", clientId: 1, client: { id: 1, companyName: "Tech Solutions Inc." }, amount: 15000.00, paymentDate: "2024-11-15T00:00:00Z", dueDate: "2024-11-30T00:00:00Z", paymentMethod: "Bank Transfer", status: "Paid", notes: "Monthly service fee" },
    { id: 2, paymentCode: "PAY002", clientId: 2, client: { id: 2, companyName: "Global Enterprises Ltd." }, amount: 25000.50, paymentDate: "2024-12-01T00:00:00Z", dueDate: "2024-12-15T00:00:00Z", paymentMethod: "Credit Card", status: "Paid", notes: "Q4 payment" },
    { id: 3, paymentCode: "PAY003", clientId: 3, client: { id: 3, companyName: "Digital Innovations Corp." }, amount: 18000.00, paymentDate: null, dueDate: "2024-12-20T00:00:00Z", paymentMethod: "Bank Transfer", status: "Pending", notes: "Awaiting payment" },
    { id: 4, paymentCode: "PAY004", clientId: 4, client: { id: 4, companyName: "Premier Services Group" }, amount: 32000.75, paymentDate: "2024-10-25T00:00:00Z", dueDate: "2024-11-10T00:00:00Z", paymentMethod: "Cash", status: "Overdue", notes: "Payment overdue - follow up required" },
    { id: 5, paymentCode: "PAY005", clientId: 5, client: { id: 5, companyName: "Advanced Systems Co." }, amount: 12500.00, paymentDate: "2024-12-05T00:00:00Z", dueDate: "2024-12-25T00:00:00Z", paymentMethod: "Bank Transfer", status: "Paid", notes: "On-time payment" },
    { id: 6, paymentCode: "PAY006", clientId: 6, client: { id: 6, companyName: "Elite Business Partners" }, amount: 22000.00, paymentDate: null, dueDate: "2024-12-18T00:00:00Z", paymentMethod: "Credit Card", status: "Pending", notes: "Payment processing" },
    { id: 7, paymentCode: "PAY007", clientId: 7, client: { id: 7, companyName: "Strategic Solutions LLC" }, amount: 28000.00, paymentDate: "2024-09-20T00:00:00Z", dueDate: "2024-10-05T00:00:00Z", paymentMethod: "Bank Transfer", status: "Overdue", notes: "Long overdue - urgent action needed" },
    { id: 8, paymentCode: "PAY008", clientId: 8, client: { id: 8, companyName: "Prime Consulting Group" }, amount: 19500.00, paymentDate: "2024-12-10T00:00:00Z", dueDate: "2024-12-10T00:00:00Z", paymentMethod: "Cash", status: "Paid", notes: "Paid on due date" },
    { id: 9, paymentCode: "PAY009", clientId: 9, client: { id: 9, companyName: "Modern Tech Solutions" }, amount: 16500.00, paymentDate: null, dueDate: "2024-12-22T00:00:00Z", paymentMethod: "Bank Transfer", status: "Pending", notes: "Expected payment" },
    { id: 10, paymentCode: "PAY010", clientId: 10, client: { id: 10, companyName: "Excellence Corporation" }, amount: 35000.00, paymentDate: "2024-11-28T00:00:00Z", dueDate: "2024-12-12T00:00:00Z", paymentMethod: "Credit Card", status: "Overdue", notes: "Partial payment received" },
    { id: 11, paymentCode: "PAY011", clientId: 11, client: { id: 11, companyName: "Innovation Hub Inc." }, amount: 14200.00, paymentDate: "2024-12-08T00:00:00Z", dueDate: "2024-12-28T00:00:00Z", paymentMethod: "Bank Transfer", status: "Paid", notes: "Early payment" },
    { id: 12, paymentCode: "PAY012", clientId: 12, client: { id: 12, companyName: "Professional Services Co." }, amount: 27500.00, paymentDate: null, dueDate: "2024-12-15T00:00:00Z", paymentMethod: "Credit Card", status: "Pending", notes: "Payment reminder sent" },
    { id: 13, paymentCode: "PAY013", clientId: 1, client: { id: 1, companyName: "Tech Solutions Inc." }, amount: 15000.00, paymentDate: "2024-10-15T00:00:00Z", dueDate: "2024-10-30T00:00:00Z", paymentMethod: "Bank Transfer", status: "Paid", notes: "Previous month payment" },
    { id: 14, paymentCode: "PAY014", clientId: 2, client: { id: 2, companyName: "Global Enterprises Ltd." }, amount: 25000.50, paymentDate: null, dueDate: "2024-11-25T00:00:00Z", paymentMethod: "Bank Transfer", status: "Overdue", notes: "Overdue payment - contact client" },
    { id: 15, paymentCode: "PAY015", clientId: 3, client: { id: 3, companyName: "Digital Innovations Corp." }, amount: 18000.00, paymentDate: "2024-12-12T00:00:00Z", dueDate: "2024-12-12T00:00:00Z", paymentMethod: "Credit Card", status: "Paid", notes: "On-time payment" },
    { id: 16, paymentCode: "PAY016", clientId: 4, client: { id: 4, companyName: "Premier Services Group" }, amount: 32000.75, paymentDate: null, dueDate: "2024-12-20T00:00:00Z", paymentMethod: "Cash", status: "Pending", notes: "Awaiting confirmation" },
    { id: 17, paymentCode: "PAY017", clientId: 5, client: { id: 5, companyName: "Advanced Systems Co." }, amount: 12500.00, paymentDate: "2024-09-15T00:00:00Z", dueDate: "2024-09-30T00:00:00Z", paymentMethod: "Bank Transfer", status: "Overdue", notes: "Old overdue payment" },
    { id: 18, paymentCode: "PAY018", clientId: 6, client: { id: 6, companyName: "Elite Business Partners" }, amount: 22000.00, paymentDate: "2024-12-14T00:00:00Z", dueDate: "2024-12-14T00:00:00Z", paymentMethod: "Credit Card", status: "Paid", notes: "Paid on due date" },
    { id: 19, paymentCode: "PAY019", clientId: 7, client: { id: 7, companyName: "Strategic Solutions LLC" }, amount: 28000.00, paymentDate: null, dueDate: "2024-12-25T00:00:00Z", paymentMethod: "Bank Transfer", status: "Pending", notes: "Holiday payment" },
    { id: 20, paymentCode: "PAY020", clientId: 8, client: { id: 8, companyName: "Prime Consulting Group" }, amount: 19500.00, paymentDate: "2024-11-05T00:00:00Z", dueDate: "2024-11-20T00:00:00Z", paymentMethod: "Cash", status: "Overdue", notes: "Needs follow-up" }
];

window.loadPayments = async function() {
    // Check authentication before loading payments
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-money-bill-wave"></i> Payment Management</h1>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-success" onclick="exportPaymentsToXLSX()" id="exportPaymentsBtn" style="display: none;">
                    <i class="fas fa-file-excel"></i> Export to Excel
                </button>
                <button class="btn btn-primary" onclick="showPaymentModal()">
                    <i class="fas fa-plus"></i> Add Payment
                </button>
            </div>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterClient" onchange="loadPaymentsData()">
                    <option value="">All Clients</option>
                </select>
                <select id="filterStatus" onchange="loadPaymentsData()">
                    <option value="">All Status</option>
                    <option value="Pending">Pending Payment</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                </select>
            </div>
            <div class="table-container">
                <table id="paymentsTable">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Client</th>
                            <th>Amount</th>
                            <th>Payment Date</th>
                            <th>Due Date</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Overdue Payments</h2>
            </div>
            <button class="btn btn-warning" onclick="loadOverduePayments()">View Overdue Payments</button>
            <div id="overduePayments" style="margin-top: 1rem;"></div>
        </div>
    `;

    // Local variable for this page
    let clients = await api.get('/clients');
    const filterClient = document.getElementById('filterClient');
    
    clients.forEach(c => {
        filterClient.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
    });

    await loadPaymentsData();
}

async function loadPaymentsData() {
    try {
        const clientId = document.getElementById('filterClient')?.value;
        const status = document.getElementById('filterStatus')?.value;
        
        let url = '/payments';
        const params = new URLSearchParams();
        if (clientId) params.append('clientId', clientId);
        if (status) params.append('status', status);
        if (params.toString()) url += '?' + params.toString();
        
        let payments;
        try {
            payments = await api.get(url);
        } catch (error) {
            // Fallback to mock data if API fails
            console.warn('API call failed, using mock data:', error);
            payments = [...mockPayments];
        }
        
        // Apply filters to mock data if using mock data
        if (payments === mockPayments || (Array.isArray(payments) && payments.length === 0 && mockPayments.length > 0)) {
            payments = [...mockPayments];
            
            if (clientId) {
                payments = payments.filter(p => p.clientId === parseInt(clientId));
            }
            if (status) {
                payments = payments.filter(p => p.status === status);
            }
        }
        
        const tbody = document.querySelector('#paymentsTable tbody');
        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No payments found.</td></tr>';
            window.paymentsData = [];
            const exportBtn = document.getElementById('exportPaymentsBtn');
            if (exportBtn) exportBtn.style.display = 'none';
            return;
        }
        
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.paymentCode}</td>
                <td>${payment.client?.companyName || 'N/A'}</td>
                <td>$${payment.amount.toLocaleString()}</td>
                <td>${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>${new Date(payment.dueDate).toLocaleDateString('vi-VN')}</td>
                <td>${payment.paymentMethod}</td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background-color: ${
                        payment.status === 'Paid' ? '#10b981' : 
                        payment.status === 'Overdue' ? '#ef4444' : '#f59e0b'
                    }; color: white;">
                        ${payment.status === 'Paid' ? 'Paid' : 
                          payment.status === 'Overdue' ? 'Overdue' : 'Pending Payment'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editPayment(${payment.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletePayment(${payment.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Store data for export and show export button
        window.paymentsData = payments;
        const exportBtn = document.getElementById('exportPaymentsBtn');
        if (exportBtn && payments && payments.length > 0) {
            exportBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        // Use mock data as fallback
        const payments = [...mockPayments];
        const tbody = document.querySelector('#paymentsTable tbody');
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.paymentCode}</td>
                <td>${payment.client?.companyName || 'N/A'}</td>
                <td>$${payment.amount.toLocaleString()}</td>
                <td>${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>${new Date(payment.dueDate).toLocaleDateString('vi-VN')}</td>
                <td>${payment.paymentMethod}</td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background-color: ${
                        payment.status === 'Paid' ? '#10b981' : 
                        payment.status === 'Overdue' ? '#ef4444' : '#f59e0b'
                    }; color: white;">
                        ${payment.status === 'Paid' ? 'Paid' : 
                          payment.status === 'Overdue' ? 'Overdue' : 'Pending Payment'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editPayment(${payment.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletePayment(${payment.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        window.paymentsData = payments;
        const exportBtn = document.getElementById('exportPaymentsBtn');
        if (exportBtn) exportBtn.style.display = 'block';
    }
}

window.exportPaymentsToXLSX = function() {
    if (!window.paymentsData || window.paymentsData.length === 0) {
        if (window.showToast) {
            window.showToast('No data to export', 'warning');
        }
        return;
    }
    
    const columns = [
        { key: 'paymentCode', label: 'Payment Code' },
        { key: 'client.companyName', label: 'Client' },
        { key: 'amount', label: 'Amount', type: 'currency' },
        { key: 'paymentDate', label: 'Payment Date', type: 'date' },
        { key: 'dueDate', label: 'Due Date', type: 'date' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'status', label: 'Status' }
    ];
    
    window.exportToXLSX(window.paymentsData, columns, 'Payments_List');
};

async function loadOverduePayments() {
    try {
        let overdue;
        try {
            overdue = await api.get('/payments/overdue');
        } catch (error) {
            // Fallback to mock data
            console.warn('API call failed, using mock data:', error);
            const today = new Date();
            overdue = mockPayments.filter(p => {
                const dueDate = new Date(p.dueDate);
                return p.status === 'Overdue' || (dueDate < today && p.status !== 'Paid');
            }).map(p => ({
                ...p,
                daysOverdue: Math.floor((today - new Date(p.dueDate)) / (1000 * 60 * 60 * 24))
            }));
        }
        
        const container = document.getElementById('overduePayments');
        if (!overdue || overdue.length === 0) {
            container.innerHTML = '<p>No overdue payments.</p>';
            return;
        }
        
        // Calculate days overdue if not present
        const today = new Date();
        overdue = overdue.map(p => ({
            ...p,
            daysOverdue: p.daysOverdue || Math.floor((today - new Date(p.dueDate)) / (1000 * 60 * 60 * 24))
        }));
        
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Client</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Days Overdue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${overdue.map(p => `
                            <tr>
                                <td>${p.paymentCode}</td>
                                <td>${p.client?.companyName || 'N/A'}</td>
                                <td>$${p.amount.toLocaleString()}</td>
                                <td>${new Date(p.dueDate).toLocaleDateString('vi-VN')}</td>
                                <td><span style="color: #ef4444; font-weight: bold;">${p.daysOverdue} days</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading overdue payments:', error);
        // Use mock data as fallback
        const today = new Date();
        const overdue = mockPayments.filter(p => {
            const dueDate = new Date(p.dueDate);
            return p.status === 'Overdue' || (dueDate < today && p.status !== 'Paid');
        }).map(p => ({
            ...p,
            daysOverdue: Math.floor((today - new Date(p.dueDate)) / (1000 * 60 * 60 * 24))
        }));
        
        const container = document.getElementById('overduePayments');
        if (overdue.length === 0) {
            container.innerHTML = '<p>No overdue payments.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Client</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Days Overdue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${overdue.map(p => `
                            <tr>
                                <td>${p.paymentCode}</td>
                                <td>${p.client?.companyName || 'N/A'}</td>
                                <td>$${p.amount.toLocaleString()}</td>
                                <td>${new Date(p.dueDate).toLocaleDateString('vi-VN')}</td>
                                <td><span style="color: #ef4444; font-weight: bold;">${p.daysOverdue} days</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

async function showPaymentModal(paymentId = null) {
    // Fetch clients when needed
    const clients = await api.get('/clients');
    const payment = paymentId ? await api.get(`/payments/${paymentId}`) : null;
    const modal = createModal('paymentModal', paymentId ? 'Edit Payment' : 'Add Payment', `
        <form id="paymentForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Code</label>
                    <input type="text" id="paymentCode" value="${payment?.paymentCode || ''}">
                </div>
                <div class="form-group">
                    <label>Client</label>
                    <select id="paymentClientId" required>
                        <option value="">Select Client</option>
                        ${clients.map(c => `<option value="${c.id}" ${payment?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount</label>
                    <input type="number" id="paymentAmount" value="${payment?.amount || ''}" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="paymentDueDate" value="${payment ? new Date(payment.dueDate).toISOString().split('T')[0] : ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Method</label>
                    <select id="paymentMethod" required>
                        <option value="Cash" ${payment?.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                        <option value="Bank Transfer" ${payment?.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                        <option value="Credit Card" ${payment?.paymentMethod === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="paymentStatus" required>
                        <option value="Pending" ${payment?.status === 'Pending' ? 'selected' : ''}>Pending Payment</option>
                        <option value="Paid" ${payment?.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Overdue" ${payment?.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="paymentNotes" rows="3">${payment?.notes || ''}</textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('paymentModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: paymentId || 0,
            paymentCode: document.getElementById('paymentCode').value,
            clientId: parseInt(document.getElementById('paymentClientId').value),
            amount: parseFloat(document.getElementById('paymentAmount').value),
            dueDate: new Date(document.getElementById('paymentDueDate').value),
            paymentMethod: document.getElementById('paymentMethod').value,
            status: document.getElementById('paymentStatus').value,
            notes: document.getElementById('paymentNotes').value
        };
        
        try {
            if (paymentId) {
                await api.put(`/payments/${paymentId}`, data);
            } else {
                await api.post('/payments', data);
            }
            closeModal('paymentModal');
            await loadPaymentsData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function editPayment(id) {
    await showPaymentModal(id);
}

async function deletePayment(id) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
        await api.delete(`/payments/${id}`);
        await loadPaymentsData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

