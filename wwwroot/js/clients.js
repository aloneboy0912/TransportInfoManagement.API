// Client Management Page - English Version
window.loadClients = async function() {
    // Check authentication before loading clients
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-user-tie"></i> Client Management</h1>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-success" onclick="exportClientsToXLSX()" id="exportClientsBtn" style="display: none;">
                    <i class="fas fa-file-excel"></i> Export to Excel
                </button>
                <button class="btn btn-primary" onclick="showClientModal()">
                    <i class="fas fa-plus"></i> Add Client
                </button>
            </div>
        </div>
        <div class="card">
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Search clients..." onkeyup="loadClientsData()">
                <button class="btn btn-primary" onclick="showAdvancedSearch()">
                    <i class="fas fa-search"></i> Advanced Search
                </button>
            </div>
            <div class="table-container">
                <table id="clientsTable">
                    <thead>
                        <tr>
                            <th>Client ID</th>
                            <th>Company Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    await loadClientsData();
}

async function loadClientsData() {
    try {
        const search = document.getElementById('searchInput')?.value || '';
        const url = search ? `/clients?search=${encodeURIComponent(search)}` : '/clients';
        const clients = await api.get(url);
        
        // Handle null or undefined response
        if (!clients) {
            console.warn('Clients API returned null or undefined');
            const tbody = document.querySelector('#clientsTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No clients found.</td></tr>';
            }
            return;
        }
        
        // Ensure clients is an array
        const clientsArray = Array.isArray(clients) ? clients : [];
        
        const tbody = document.querySelector('#clientsTable tbody');
        if (!tbody) {
            console.error('Clients table tbody not found');
            return;
        }
        
        if (clientsArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No clients found.</td></tr>';
            return;
        }
        
        // Helper function to safely get property value (handles both camelCase and PascalCase)
        const getProp = (obj, ...keys) => {
            for (const key of keys) {
                if (obj && (obj[key] !== undefined && obj[key] !== null)) {
                    return obj[key];
                }
            }
            return null;
        };
        
        // Escape HTML to prevent XSS
        const escapeHtml = (text) => {
            if (text === null || text === undefined) return 'N/A';
            if (text === 'N/A') return text;
            if (typeof text === 'number') return String(text);
            if (text === '') return 'N/A';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        };
        
        tbody.innerHTML = clientsArray.map((client, index) => {
            // Safely extract all fields with proper fallbacks
            const clientId = getProp(client, 'id', 'Id') ?? 0;
            const clientCode = getProp(client, 'clientCode', 'ClientCode') ?? '';
            const companyName = getProp(client, 'companyName', 'CompanyName') ?? 'N/A';
            const contactPerson = getProp(client, 'contactPerson', 'ContactPerson') ?? 'N/A';
            const email = getProp(client, 'email', 'Email') ?? 'N/A';
            const phoneRaw = getProp(client, 'phone', 'Phone');
            const cityRaw = getProp(client, 'city', 'City');
            const isActiveRaw = getProp(client, 'isActive', 'IsActive');
            
            // Format phone - handle empty string, null, undefined
            const phone = (phoneRaw !== null && phoneRaw !== undefined && phoneRaw !== '') ? phoneRaw : 'N/A';
            
            // Format city - handle empty string, null, undefined
            const city = (cityRaw !== null && cityRaw !== undefined && cityRaw !== '') ? cityRaw : 'N/A';
            
            // Determine status
            const isActive = isActiveRaw === true || isActiveRaw === 'true' || String(isActiveRaw).toLowerCase() === 'true';
            const status = isActive ? 'Active' : 'Inactive';
            
            // Use clientCode if available, otherwise use id
            const displayCode = clientCode || clientId;
            
            return `
                <tr>
                    <td>${escapeHtml(displayCode)}</td>
                    <td>${escapeHtml(companyName)}</td>
                    <td>${escapeHtml(contactPerson)}</td>
                    <td>${escapeHtml(email)}</td>
                    <td>${escapeHtml(phone)}</td>
                    <td>${escapeHtml(city)}</td>
                    <td>${escapeHtml(status)}</td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editClient(${clientId})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteClient(${clientId})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Store data for export and show export button
        window.clientsData = clientsArray;
        const exportBtn = document.getElementById('exportClientsBtn');
        if (exportBtn && clientsArray && clientsArray.length > 0) {
            exportBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading clients:', error);
        const tbody = document.querySelector('#clientsTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Error loading clients. Please try again.</td></tr>';
        }
    }
}

window.exportClientsToXLSX = function() {
    if (!window.clientsData || window.clientsData.length === 0) {
        if (window.showToast) {
            window.showToast('No data to export', 'warning');
        }
        return;
    }
    
    const columns = [
        { key: 'clientCode', label: 'Client Code' },
        { key: 'companyName', label: 'Company Name' },
        { key: 'contactPerson', label: 'Contact Person' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'address', label: 'Address' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'isActive', label: 'Status', type: 'status' },
        { key: 'createdAt', label: 'Created At', type: 'date' }
    ];
    
    window.exportToXLSX(window.clientsData, columns, 'Clients_List');
};

function showAdvancedSearch() {
    const modal = createModal('advancedSearchModal', 'Advanced Search', `
        <form id="advancedSearchForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" id="searchCompanyName" placeholder="Enter company name">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="searchEmail" placeholder="Enter email address">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="searchCity" placeholder="Enter city">
                </div>
                <div class="form-group">
                    <label>Country</label>
                    <input type="text" id="searchCountry" placeholder="Enter country">
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="searchIsActive">
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('advancedSearchModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Search</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('advancedSearchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        const companyName = document.getElementById('searchCompanyName').value;
        const email = document.getElementById('searchEmail').value;
        const city = document.getElementById('searchCity').value;
        const country = document.getElementById('searchCountry').value;
        const isActive = document.getElementById('searchIsActive').value;
        
        if (companyName) params.append('companyName', companyName);
        if (email) params.append('email', email);
        if (city) params.append('city', city);
        if (country) params.append('country', country);
        if (isActive) params.append('isActive', isActive);
        
        try {
            const clients = await api.get(`/clients/advanced-search?${params.toString()}`);
            const tbody = document.querySelector('#clientsTable tbody');
            if (clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No clients found matching your search criteria.</td></tr>';
            } else {
                // Helper function to safely get property value (handles both camelCase and PascalCase)
                const getProp = (obj, ...keys) => {
                    for (const key of keys) {
                        if (obj && (obj[key] !== undefined && obj[key] !== null)) {
                            return obj[key];
                        }
                    }
                    return null;
                };
                
                // Escape HTML to prevent XSS
                const escapeHtml = (text) => {
                    if (text === null || text === undefined) return 'N/A';
                    if (text === 'N/A') return text;
                    if (typeof text === 'number') return String(text);
                    if (text === '') return 'N/A';
                    const div = document.createElement('div');
                    div.textContent = String(text);
                    return div.innerHTML;
                };
                
                tbody.innerHTML = clients.map(client => {
                    const clientId = getProp(client, 'id', 'Id') ?? 0;
                    const clientCode = getProp(client, 'clientCode', 'ClientCode') ?? '';
                    const companyName = getProp(client, 'companyName', 'CompanyName') ?? 'N/A';
                    const contactPerson = getProp(client, 'contactPerson', 'ContactPerson') ?? 'N/A';
                    const email = getProp(client, 'email', 'Email') ?? 'N/A';
                    const phoneRaw = getProp(client, 'phone', 'Phone');
                    const cityRaw = getProp(client, 'city', 'City');
                    const isActiveRaw = getProp(client, 'isActive', 'IsActive');
                    
                    const phone = (phoneRaw !== null && phoneRaw !== undefined && phoneRaw !== '') ? phoneRaw : 'N/A';
                    const city = (cityRaw !== null && cityRaw !== undefined && cityRaw !== '') ? cityRaw : 'N/A';
                    const isActive = isActiveRaw === true || isActiveRaw === 'true' || String(isActiveRaw).toLowerCase() === 'true';
                    const status = isActive ? 'Active' : 'Inactive';
                    const displayCode = clientCode || clientId;
                    
                    return `
                        <tr>
                            <td>${escapeHtml(displayCode)}</td>
                            <td>${escapeHtml(companyName)}</td>
                            <td>${escapeHtml(contactPerson)}</td>
                            <td>${escapeHtml(email)}</td>
                            <td>${escapeHtml(phone)}</td>
                            <td>${escapeHtml(city)}</td>
                            <td>${escapeHtml(status)}</td>
                            <td class="actions">
                                <button class="btn-icon btn-edit" onclick="editClient(${clientId})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="deleteClient(${clientId})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
            closeModal('advancedSearchModal');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function showClientModal(clientId = null) {
    const client = clientId ? await api.get(`/clients/${clientId}`) : null;
    const modal = createModal('clientModal', clientId ? 'Edit Client' : 'Add Client', `
        <form id="clientForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Client Code</label>
                    <input type="text" id="clientCode" value="${client?.clientCode || ''}" placeholder="Enter client code">
                </div>
                <div class="form-group">
                    <label>Company Name *</label>
                    <input type="text" id="clientCompanyName" value="${client?.companyName || ''}" required placeholder="Enter company name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Contact Person *</label>
                    <input type="text" id="clientContactPerson" value="${client?.contactPerson || ''}" required placeholder="Enter contact person name">
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="clientEmail" value="${client?.email || ''}" required placeholder="Enter email address">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="clientPhone" value="${client?.phone || ''}" placeholder="Enter phone number">
                </div>
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="clientCity" value="${client?.city || ''}" placeholder="Enter city">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Country</label>
                    <input type="text" id="clientCountry" value="${client?.country || ''}" placeholder="Enter country">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="clientAddress" value="${client?.address || ''}" placeholder="Enter address">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="clientIsActive" ${client?.isActive !== false ? 'checked' : ''}>
                    Active
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('clientModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('clientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: clientId || 0,
            clientCode: document.getElementById('clientCode').value,
            companyName: document.getElementById('clientCompanyName').value,
            contactPerson: document.getElementById('clientContactPerson').value,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value,
            city: document.getElementById('clientCity').value,
            country: document.getElementById('clientCountry').value,
            address: document.getElementById('clientAddress').value,
            isActive: document.getElementById('clientIsActive').checked
        };
        
        try {
            if (clientId) {
                await api.put(`/clients/${clientId}`, data);
            } else {
                await api.post('/clients', data);
            }
            closeModal('clientModal');
            await loadClientsData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function editClient(id) {
    await showClientModal(id);
}

async function deleteClient(id) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
        await api.delete(`/clients/${id}`);
        await loadClientsData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Ensure modal functions are available globally
window.createModal = window.createModal || function(id, title, content) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn" onclick="closeModal('${id}')">&times;</button>
            </div>
            ${content}
        </div>
    `;
    return modal;
};

window.closeModal = window.closeModal || function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
};

