// Payment management - using only real API data

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
                            <th>PAY</th>
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
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-envelope"></i> Recent Contacts</h2>
            </div>
            <div class="table-container">
                <table id="contactsTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    // Local variable for this page
    let clients = await api.get('/clients');
    const filterClient = document.getElementById('filterClient');
    
    clients.forEach(c => {
        filterClient.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
    });

    await loadPaymentsData();
    await loadContactsData();
}

async function loadContactsData() {
    try {
        const contacts = await api.get('/contact');
        
        // Handle null or empty response
        if (!contacts || !Array.isArray(contacts)) {
            const tbody = document.querySelector('#contactsTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No contacts found.</td></tr>';
            }
            return;
        }
        
        // Show only recent contacts (last 10)
        const recentContacts = contacts.slice(0, 10);
        
        const tbody = document.querySelector('#contactsTable tbody');
        if (recentContacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No contacts found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = recentContacts.map(contact => {
            const date = new Date(contact.createdAt);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <tr>
                    <td>${contact.name || 'N/A'}</td>
                    <td>${contact.email || 'N/A'}</td>
                    <td>${contact.company || 'N/A'}</td>
                    <td>${contact.subject || 'N/A'}</td>
                    <td>${formattedDate}</td>
                    <td>${contact.isProcessed ? '<span style="color: #10b981;">Processed</span>' : '<span style="color: #f59e0b;">New</span>'}</td>
                    <td class="actions">
                        <button class="btn-icon btn-view" onclick="viewContactInPayments(${contact.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading contacts:', error);
        const tbody = document.querySelector('#contactsTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Error loading contacts.</td></tr>';
        }
    }
}

async function viewContactInPayments(id) {
    try {
        const contact = await api.get(`/api/contact/${id}`);
        const date = new Date(contact.createdAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const modal = createModal('viewContactModal', 'Contact Details', `
            <div style="max-width: 600px;">
                <div class="form-group">
                    <label><strong>Name:</strong></label>
                    <p>${contact.name || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Email:</strong></label>
                    <p>${contact.email || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Company:</strong></label>
                    <p>${contact.company || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Phone:</strong></label>
                    <p>${contact.phone || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Subject:</strong></label>
                    <p>${contact.subject || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Message:</strong></label>
                    <p style="white-space: pre-wrap; background: var(--bg-secondary); padding: 1rem; border-radius: 0.5rem;">${contact.message || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Status:</strong></label>
                    <p>${contact.isProcessed ? 'Processed' : 'New'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Date:</strong></label>
                    <p>${formattedDate}</p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn" onclick="closeModal('viewContactModal')">Close</button>
                    <button type="button" class="btn btn-primary" onclick="createPaymentFromContact(${contact.id}); closeModal('viewContactModal');">Create Payment</button>
                </div>
            </div>
        `);
    } catch (error) {
        console.error('Error loading contact:', error);
        if (window.showToast) {
            window.showToast('Error loading contact details', 'error');
        }
    }
}

async function createPaymentFromContact(contactId) {
    try {
        const contact = await api.get(`/contact/${contactId}`);
        if (!contact) {
            if (window.showToast) {
                window.showToast('Contact not found', 'error');
            }
            return;
        }
        
        // Pre-fill payment form with contact information
        const paymentData = {
            clientId: 0, // Will need to select or create client
            paymentCode: `PAY${Date.now()}`,
            amount: 0,
            paymentDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            paymentMethod: 'Bank Transfer',
            status: 'Pending',
            notes: `Contact from: ${contact.name} (${contact.email})${contact.phone ? ` - Phone: ${contact.phone}` : ''}\nSubject: ${contact.subject}\nMessage: ${contact.message}`
        };
        
        // Open payment modal with pre-filled data
        showPaymentModal(null, paymentData);
        
        if (window.showToast) {
            window.showToast('Payment form opened with contact information', 'success');
        }
    } catch (error) {
        console.error('Error creating payment from contact:', error);
        if (window.showToast) {
            window.showToast('Error creating payment from contact', 'error');
        }
    }
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
        
        // Get payments from API only
        const paymentsResponse = await api.get(url);
        
        // Handle null or empty response
        let payments = [];
        if (paymentsResponse && Array.isArray(paymentsResponse)) {
            // Transform API payment format to match display format
            payments = paymentsResponse.map(p => ({
                id: p.id,
                paymentCode: p.paymentCode,
                clientId: p.clientId,
                client: p.client ? { id: p.client.id, companyName: p.client.companyName } : null,
                amount: parseFloat(p.amount),
                paymentDate: p.paymentDate,
                dueDate: p.dueDate,
                paymentMethod: p.paymentMethod,
                status: p.status,
                notes: p.notes
            }));
        }
        
        // Sort by payment date (most recent first)
        payments.sort((a, b) => {
            const dateA = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
            const dateB = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
            return dateB - dateA;
        });
        
        const tbody = document.querySelector('#paymentsTable tbody');
        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No payments found.</td></tr>';
            window.paymentsData = [];
            const exportBtn = document.getElementById('exportPaymentsBtn');
            if (exportBtn) exportBtn.style.display = 'none';
            return;
        }
        
        tbody.innerHTML = payments.map(payment => {
            // Format amount - handle both number and decimal
            const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount);
            const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            // Format dates
            const paymentDate = payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-US') : 'N/A';
            const dueDate = new Date(payment.dueDate).toLocaleDateString('en-US');
            
            // Determine status color
            const statusColor = payment.status === 'Paid' ? '#10b981' : 
                               payment.status === 'Overdue' ? '#ef4444' : '#f59e0b';
            const statusText = payment.status === 'Paid' ? 'Paid' : 
                              payment.status === 'Overdue' ? 'Overdue' : 'Pending Payment';
            
            return `
            <tr>
                <td>${payment.paymentCode}</td>
                <td>${payment.client?.companyName || 'N/A'}</td>
                <td>$${formattedAmount}</td>
                <td>${paymentDate}</td>
                <td>${dueDate}</td>
                <td>${payment.paymentMethod}</td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background-color: ${statusColor}; color: white;">
                        ${statusText}
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
        `;
        }).join('');
        
        // Store data for export and show export button
        window.paymentsData = payments;
        const exportBtn = document.getElementById('exportPaymentsBtn');
        if (exportBtn && payments && payments.length > 0) {
            exportBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        const tbody = document.querySelector('#paymentsTable tbody');
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Error loading payments. Please try again later.</td></tr>';
        window.paymentsData = [];
        const exportBtn = document.getElementById('exportPaymentsBtn');
        if (exportBtn) exportBtn.style.display = 'none';
        
        if (window.showToast) {
            window.showToast('Failed to load payments: ' + (error.message || 'Unknown error'), 'error');
        }
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
        // Get overdue payments from API only
        const overdueResponse = await api.get('/payments/overdue');
        
        // Handle null or empty response
        let overdue = [];
        if (overdueResponse && Array.isArray(overdueResponse)) {
            const today = new Date();
            overdue = overdueResponse.map(p => ({
                id: p.id,
                paymentCode: p.paymentCode,
                clientId: p.clientId,
                client: p.client ? { id: p.client.id, companyName: p.client.companyName } : null,
                amount: parseFloat(p.amount),
                paymentDate: p.paymentDate,
                dueDate: p.dueDate,
                paymentMethod: p.paymentMethod,
                status: p.status,
                notes: p.notes,
                daysOverdue: Math.floor((today - new Date(p.dueDate)) / (1000 * 60 * 60 * 24))
            }));
        }
        
        // Sort by days overdue (most overdue first)
        overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
        
        const container = document.getElementById('overduePayments');
        if (!overdue || overdue.length === 0) {
            container.innerHTML = '<p>No overdue payments.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>PAY</th>
                            <th>Client</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Days Overdue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${overdue.map(p => {
                            const amount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount);
                            const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            return `
                            <tr>
                                <td>${p.paymentCode}</td>
                                <td>${p.client?.companyName || 'N/A'}</td>
                                <td>$${formattedAmount}</td>
                                <td>${new Date(p.dueDate).toLocaleDateString('en-US')}</td>
                                <td><span style="color: #ef4444; font-weight: bold;">${p.daysOverdue} days</span></td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading overdue payments:', error);
        const container = document.getElementById('overduePayments');
        container.innerHTML = '<p style="color: var(--text-secondary);">Error loading overdue payments. Please try again later.</p>';
        
        if (window.showToast) {
            window.showToast('Failed to load overdue payments: ' + (error.message || 'Unknown error'), 'error');
        }
    }
}

async function showPaymentModal(paymentId = null, prefillData = null) {
    // Fetch clients when needed
    const clients = await api.get('/clients');
    const payment = paymentId ? await api.get(`/payments/${paymentId}`) : null;
    
    // Use prefillData if provided (from contact form)
    const data = payment || prefillData || {};
    const modalTitle = paymentId ? 'Edit Payment' : (prefillData ? 'Create Payment from Contact' : 'Add Payment');
    const modal = createModal('paymentModal', modalTitle, `
        <form id="paymentForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Code</label>
                    <input type="text" id="paymentCode" value="${data?.paymentCode || ''}">
                </div>
                <div class="form-group">
                    <label>Client</label>
                    <select id="paymentClientId" required>
                        <option value="">Select Client</option>
                        ${clients.map(c => `<option value="${c.id}" ${data?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount</label>
                    <input type="number" id="paymentAmount" value="${data?.amount || ''}" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="paymentDueDate" value="${data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Method</label>
                    <select id="paymentMethod" required>
                        <option value="Cash" ${data?.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                        <option value="Bank Transfer" ${data?.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                        <option value="Credit Card" ${data?.paymentMethod === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="paymentStatus" required>
                        <option value="Pending" ${data?.status === 'Pending' ? 'selected' : ''}>Pending Payment</option>
                        <option value="Paid" ${data?.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Overdue" ${data?.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="paymentNotes" rows="3">${data?.notes || ''}</textarea>
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

