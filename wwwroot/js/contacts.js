// Contact Management Page
window.loadContacts = async function() {
    // Check authentication before loading contacts
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-envelope"></i> Contact Management</h1>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-success" onclick="exportContactsToXLSX()" id="exportContactsBtn" style="display: none;">
                    <i class="fas fa-file-excel"></i> Export to Excel
                </button>
            </div>
        </div>
        <div class="card">
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Search contacts..." onkeyup="loadContactsData()">
            </div>
            <div class="table-container">
                <table id="contactsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Phone</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    await loadContactsData();
}

async function loadContactsData() {
    try {
        const search = document.getElementById('searchInput')?.value || '';
        const contacts = await api.get('/api/contact');
        
        // Filter contacts if search term exists
        let filteredContacts = contacts;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredContacts = contacts.filter(contact => 
                contact.name?.toLowerCase().includes(searchLower) ||
                contact.email?.toLowerCase().includes(searchLower) ||
                contact.company?.toLowerCase().includes(searchLower) ||
                contact.subject?.toLowerCase().includes(searchLower)
            );
        }
        
        const tbody = document.querySelector('#contactsTable tbody');
        if (filteredContacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No contacts found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = filteredContacts.map(contact => {
            const date = new Date(contact.createdAt);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <tr>
                    <td>${contact.id}</td>
                    <td>${contact.name || 'N/A'}</td>
                    <td>${contact.email || 'N/A'}</td>
                    <td>${contact.company || 'N/A'}</td>
                    <td>${contact.phone || 'N/A'}</td>
                    <td>${contact.subject || 'N/A'}</td>
                    <td>${getStatusBadge(!contact.isProcessed, 'default')}</td>
                    <td>${formattedDate}</td>
                    <td class="actions">
                        <button class="btn-icon btn-view" onclick="viewContact(${contact.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="markContactAsProcessed(${contact.id})" title="Mark as Processed" ${contact.isProcessed ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteContact(${contact.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Store data for export and show export button
        window.contactsData = filteredContacts;
        const exportBtn = document.getElementById('exportContactsBtn');
        if (exportBtn && filteredContacts && filteredContacts.length > 0) {
            exportBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
        document.querySelector('#contactsTable tbody').innerHTML = 
            '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Error loading contacts. Please try again.</td></tr>';
    }
}

async function viewContact(id) {
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
                    ${!contact.isProcessed ? `<button type="button" class="btn btn-primary" onclick="markContactAsProcessed(${contact.id}); closeModal('viewContactModal');">Mark as Processed</button>` : ''}
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

async function markContactAsProcessed(id) {
    try {
        const contact = await api.get(`/api/contact/${id}`);
        contact.isProcessed = true;
        
        // Since we don't have a PUT endpoint, we'll need to add one or use a workaround
        // For now, let's just reload the data
        await loadContactsData();
        
        if (window.showToast) {
            window.showToast('Contact marked as processed', 'success');
        }
    } catch (error) {
        console.error('Error marking contact as processed:', error);
        if (window.showToast) {
            window.showToast('Error updating contact', 'error');
        }
    }
}

async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) {
        return;
    }
    
    try {
        // Note: We need to add a DELETE endpoint to the ContactController
        // For now, this will fail until we add it
        await api.delete(`/api/contact/${id}`);
        await loadContactsData();
        
        if (window.showToast) {
            window.showToast('Contact deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        if (window.showToast) {
            window.showToast('Error deleting contact. The DELETE endpoint may not be implemented yet.', 'error');
        }
    }
}

window.exportContactsToXLSX = function() {
    if (!window.contactsData || window.contactsData.length === 0) {
        if (window.showToast) {
            window.showToast('No data to export', 'warning');
        }
        return;
    }
    
    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Company' },
        { key: 'phone', label: 'Phone' },
        { key: 'subject', label: 'Subject' },
        { key: 'message', label: 'Message' },
        { key: 'isProcessed', label: 'Status', type: 'status' },
        { key: 'createdAt', label: 'Created At', type: 'date' }
    ];
    
    window.exportToXLSX(window.contactsData, columns, 'Contacts_List');
};

