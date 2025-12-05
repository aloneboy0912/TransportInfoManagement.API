// Client Service Management Page - English Version
// Use a namespace to avoid variable conflicts
window.ClientServicesPage = window.ClientServicesPage || {
    clients: [],
    services: [],
    employees: [],
    clientServices: []
};

window.loadClientServices = async function() {
    console.log('Loading Client Services page...');
    // Check authentication before loading client services
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    if (!content) {
        console.error('Page content element not found');
        return;
    }
    
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-link"></i> Client Service Management</h1>
            <button class="btn btn-primary" onclick="showClientServiceModal()">
                <i class="fas fa-plus"></i> Add Client Service
            </button>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterClient" onchange="loadClientServicesData()">
                    <option value="">All Clients</option>
                </select>
            </div>
            <div class="table-container">
                <table id="clientServicesTable">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Service</th>
                            <th>Employee</th>
                            <th>Employee Count</th>
                            <th>Start Date</th>
                            <th>End Date</th>
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
                <h2>Calculate Cost</h2>
            </div>
            <div>
                <select id="costClientId">
                    <option value="">Select Client</option>
                </select>
                <button class="btn btn-primary" onclick="calculateCost()">Calculate Cost</button>
                <div id="costResult" style="margin-top: 1rem;"></div>
            </div>
        </div>
    `;

    // Load data from API
    await loadClientServicesPageData();
}

async function loadClientServicesPageData() {
    try {
        // Load clients, services, employees, and client services from API
        const [clients, services, employees, clientServices] = await Promise.all([
            api.get('/clients').catch(() => []),
            api.get('/services').catch(() => []),
            api.get('/employees').catch(() => []),
            api.get('/client-services').catch(() => [])
        ]);
        
        // Store in namespace
        window.ClientServicesPage.clients = Array.isArray(clients) ? clients : [];
        window.ClientServicesPage.services = Array.isArray(services) ? services : [];
        window.ClientServicesPage.employees = Array.isArray(employees) ? employees : [];
        window.ClientServicesPage.clientServices = Array.isArray(clientServices) ? clientServices : [];
        
        // Populate filter dropdowns
        const filterClient = document.getElementById('filterClient');
        const costClientId = document.getElementById('costClientId');
        
        if (filterClient && window.ClientServicesPage.clients && window.ClientServicesPage.clients.length > 0) {
            window.ClientServicesPage.clients.forEach(c => {
                const clientId = c.id ?? c.Id ?? 0;
                const companyName = c.companyName ?? c.CompanyName ?? 'N/A';
                filterClient.innerHTML += `<option value="${clientId}">${companyName}</option>`;
            });
        }
        
        if (costClientId && window.ClientServicesPage.clients && window.ClientServicesPage.clients.length > 0) {
            window.ClientServicesPage.clients.forEach(c => {
                const clientId = c.id ?? c.Id ?? 0;
                const companyName = c.companyName ?? c.CompanyName ?? 'N/A';
                costClientId.innerHTML += `<option value="${clientId}">${companyName}</option>`;
            });
        }

        loadClientServicesData();
    } catch (error) {
        console.error('Error loading client services page data:', error);
        const tbody = document.querySelector('#clientServicesTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--danger-color);">Error loading data. Please refresh the page.</td></tr>';
        }
    }
}

window.loadClientServicesData = async function loadClientServicesData() {
    try {
        const clientId = document.getElementById('filterClient')?.value;
        const url = clientId ? `/client-services?clientId=${clientId}` : '/client-services';
        
        // Load client services from API
        const clientServices = await api.get(url);
        const clientServicesArray = Array.isArray(clientServices) ? clientServices : [];
        
        // Helper function to safely get property value
        const getProp = (obj, ...keys) => {
            for (const key of keys) {
                if (obj && (obj[key] !== undefined && obj[key] !== null)) {
                    return obj[key];
                }
            }
            return null;
        };
        
        // Enrich with related data (data should already include related entities from API)
        const enrichedServices = clientServicesArray.map(cs => {
            const clientId = getProp(cs, 'clientId', 'ClientId');
            const serviceId = getProp(cs, 'serviceId', 'ServiceId');
            const employeeId = getProp(cs, 'employeeId', 'EmployeeId');
            
            // Get related data from included entities or from stored data
            const client = cs.client || cs.Client || 
                (window.ClientServicesPage.clients || []).find(c => (c.id ?? c.Id) === clientId);
            const service = cs.service || cs.Service || 
                (window.ClientServicesPage.services || []).find(s => (s.id ?? s.Id) === serviceId);
            const employee = cs.employee || cs.Employee || 
                (window.ClientServicesPage.employees || []).find(e => (e.id ?? e.Id) === employeeId);
            
            return {
                id: getProp(cs, 'id', 'Id'),
                clientId: clientId,
                serviceId: serviceId,
                employeeId: employeeId,
                numberOfEmployees: getProp(cs, 'numberOfEmployees', 'NumberOfEmployees') ?? 0,
                startDate: getProp(cs, 'startDate', 'StartDate'),
                endDate: getProp(cs, 'endDate', 'EndDate'),
                isActive: getProp(cs, 'isActive', 'IsActive') === true || getProp(cs, 'isActive', 'IsActive') === 'true',
                client: client ? { 
                    companyName: getProp(client, 'companyName', 'CompanyName') ?? 'N/A' 
                } : null,
                service: service ? { 
                    name: getProp(service, 'name', 'Name') ?? 'N/A' 
                } : null,
                employee: employee ? { 
                    fullName: getProp(employee, 'fullName', 'FullName') ?? 'N/A' 
                } : null
            };
        });
        
        const tbody = document.querySelector('#clientServicesTable tbody');
        
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        
        if (!enrichedServices || enrichedServices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No client services found. Click "Add Client Service" to create one.</td></tr>';
            return;
        }
        
        tbody.innerHTML = enrichedServices.map(cs => `
            <tr>
                <td>${cs.client?.companyName || 'N/A'}</td>
                <td>${cs.service?.name || 'N/A'}</td>
                <td>${cs.employee?.fullName || 'N/A'}</td>
                <td>${cs.numberOfEmployees || 0}</td>
                <td>${cs.startDate ? new Date(cs.startDate).toLocaleDateString('en-US') : 'N/A'}</td>
                <td>${cs.endDate ? new Date(cs.endDate).toLocaleDateString('en-US') : 'Active'}</td>
                <td>${cs.isActive ? 'Active' : 'Inactive'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editClientService(${cs.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteClientService(${cs.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading client services:', error);
        const tbody = document.querySelector('#clientServicesTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--danger-color);">Error loading client services. Please refresh the page.</td></tr>';
        }
    }
};

async function calculateCost() {
    const clientId = document.getElementById('costClientId').value;
    if (!clientId) {
        alert('Please select a client');
        return;
    }
    
    try {
        // Use API endpoint to calculate cost
        const costData = await api.get(`/client-services/calculate-cost/${clientId}`);
        
        if (costData && costData.totalCost !== undefined) {
            const totalCost = costData.totalCost || 0;
            const details = costData.details || [];
            
            document.getElementById('costResult').innerHTML = `
                <h3>Total Cost: $${totalCost.toLocaleString()}</h3>
                ${details.length > 0 ? `
                <table style="width: 100%; margin-top: 1rem;">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Employee Count</th>
                            <th>Days</th>
                            <th>Fee/Day/Employee</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.map(d => `
                            <tr>
                                <td>${d.serviceName || 'N/A'}</td>
                                <td>${d.numberOfEmployees || 0}</td>
                                <td>${d.days || 0}</td>
                                <td>$${(d.feePerDayPerEmployee || 0).toLocaleString()}</td>
                                <td>$${(d.cost || 0).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p>No active services found for this client.</p>'}
            `;
        } else {
            // Fallback: Calculate manually if API doesn't return expected format
            const clientServices = await api.get(`/client-services?clientId=${clientId}`);
            const services = await api.get('/services');
            const serviceFees = await api.get('/services/fees');
            
            const activeServices = (Array.isArray(clientServices) ? clientServices : []).filter(cs => {
                const isActive = cs.isActive ?? cs.IsActive;
                return isActive === true || isActive === 'true';
            });
            
            let totalCost = 0;
            const details = [];
            
            activeServices.forEach(cs => {
                const serviceId = cs.serviceId ?? cs.ServiceId;
                const service = (Array.isArray(services) ? services : []).find(s => (s.id ?? s.Id) === serviceId);
                const serviceFee = (Array.isArray(serviceFees) ? serviceFees : []).find(sf => (sf.serviceId ?? sf.ServiceId) === serviceId);
                
                if (service && serviceFee) {
                    const startDate = new Date(cs.startDate ?? cs.StartDate);
                    const endDate = cs.endDate ?? cs.EndDate ? new Date(cs.endDate ?? cs.EndDate) : new Date();
                    const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
                    const numberOfEmployees = cs.numberOfEmployees ?? cs.NumberOfEmployees ?? 1;
                    const feePerDay = serviceFee.feePerDayPerEmployee ?? serviceFee.FeePerDayPerEmployee ?? 0;
                    const cost = feePerDay * numberOfEmployees * days;
                    totalCost += cost;
                    
                    details.push({
                        serviceName: service.name ?? service.Name ?? 'N/A',
                        numberOfEmployees: numberOfEmployees,
                        days: days,
                        feePerDayPerEmployee: feePerDay,
                        cost: cost
                    });
                }
            });
            
            document.getElementById('costResult').innerHTML = `
                <h3>Total Cost: $${totalCost.toLocaleString()}</h3>
                ${details.length > 0 ? `
                <table style="width: 100%; margin-top: 1rem;">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Employee Count</th>
                            <th>Days</th>
                            <th>Fee/Day/Employee</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.map(d => `
                            <tr>
                                <td>${d.serviceName}</td>
                                <td>${d.numberOfEmployees}</td>
                                <td>${d.days}</td>
                                <td>$${d.feePerDayPerEmployee.toLocaleString()}</td>
                                <td>$${d.cost.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p>No active services found for this client.</p>'}
            `;
        }
    } catch (error) {
        console.error('Error calculating cost:', error);
        document.getElementById('costResult').innerHTML = 
            '<p style="color: var(--danger-color);">Error calculating cost. Please try again.</p>';
    }
}

async function showClientServiceModal(csId = null) {
    // Ensure data is loaded from API
    if (!window.ClientServicesPage.clients || window.ClientServicesPage.clients.length === 0) {
        const clients = await api.get('/clients').catch(() => []);
        window.ClientServicesPage.clients = Array.isArray(clients) ? clients : [];
    }
    if (!window.ClientServicesPage.services || window.ClientServicesPage.services.length === 0) {
        const services = await api.get('/services').catch(() => []);
        window.ClientServicesPage.services = Array.isArray(services) ? services : [];
    }
    if (!window.ClientServicesPage.employees || window.ClientServicesPage.employees.length === 0) {
        const employees = await api.get('/employees').catch(() => []);
        window.ClientServicesPage.employees = Array.isArray(employees) ? employees : [];
    }
    
    // Load client service if editing
    let cs = null;
    if (csId) {
        try {
            cs = await api.get(`/client-services/${csId}`);
        } catch (error) {
            console.error('Error loading client service:', error);
        }
    }
    
    // Helper function to safely get property value
    const getProp = (obj, ...keys) => {
        for (const key of keys) {
            if (obj && (obj[key] !== undefined && obj[key] !== null)) {
                return obj[key];
            }
        }
        return null;
    };
    const modal = createModal('clientServiceModal', csId ? 'Edit Client Service' : 'Add Client Service', `
        <form id="clientServiceForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Client</label>
                    <select id="csClientId" required>
                        <option value="">Select Client</option>
                        ${(window.ClientServicesPage.clients || []).map(c => {
                            const clientId = getProp(c, 'id', 'Id');
                            const companyName = getProp(c, 'companyName', 'CompanyName') ?? 'N/A';
                            const currentClientId = getProp(cs, 'clientId', 'ClientId');
                            return `<option value="${clientId}" ${currentClientId === clientId ? 'selected' : ''}>${companyName}</option>`;
                        }).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Service</label>
                    <select id="csServiceId" required>
                        <option value="">Select Service</option>
                        ${(window.ClientServicesPage.services || []).map(s => {
                            const serviceId = getProp(s, 'id', 'Id');
                            const serviceName = getProp(s, 'name', 'Name') ?? 'N/A';
                            const currentServiceId = getProp(cs, 'serviceId', 'ServiceId');
                            return `<option value="${serviceId}" ${currentServiceId === serviceId ? 'selected' : ''}>${serviceName}</option>`;
                        }).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Employee</label>
                    <select id="csEmployeeId">
                        <option value="">No Selection</option>
                        ${(window.ClientServicesPage.employees || []).map(e => {
                            const employeeId = getProp(e, 'id', 'Id');
                            const fullName = getProp(e, 'fullName', 'FullName') ?? 'N/A';
                            const currentEmployeeId = getProp(cs, 'employeeId', 'EmployeeId');
                            return `<option value="${employeeId}" ${currentEmployeeId === employeeId ? 'selected' : ''}>${fullName}</option>`;
                        }).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Number of Employees</label>
                    <input type="number" id="csNumberOfEmployees" value="${getProp(cs, 'numberOfEmployees', 'NumberOfEmployees') || 1}" min="1" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" id="csStartDate" value="${cs ? (getProp(cs, 'startDate', 'StartDate') ? new Date(getProp(cs, 'startDate', 'StartDate')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>End Date (Optional)</label>
                    <input type="date" id="csEndDate" value="${cs && getProp(cs, 'endDate', 'EndDate') ? new Date(getProp(cs, 'endDate', 'EndDate')).toISOString().split('T')[0] : ''}">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="csIsActive" ${getProp(cs, 'isActive', 'IsActive') !== false ? 'checked' : ''}>
                    Active
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('clientServiceModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('clientServiceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const endDateValue = document.getElementById('csEndDate').value;
        const data = {
            id: csId || 0,
            clientId: parseInt(document.getElementById('csClientId').value),
            serviceId: parseInt(document.getElementById('csServiceId').value),
            employeeId: document.getElementById('csEmployeeId').value ? parseInt(document.getElementById('csEmployeeId').value) : null,
            numberOfEmployees: parseInt(document.getElementById('csNumberOfEmployees').value),
            startDate: new Date(document.getElementById('csStartDate').value),
            endDate: endDateValue ? new Date(endDateValue) : null,
            isActive: document.getElementById('csIsActive').checked
        };
        
        try {
            if (csId) {
                // Update existing via API
                await api.put(`/client-services/${csId}`, data);
            } else {
                // Create new via API
                await api.post('/client-services', data);
            }
            closeModal('clientServiceModal');
            await loadClientServicesData();
            if (window.showToast) {
                window.showToast(csId ? 'Client service updated successfully' : 'Client service created successfully', 'success');
            }
        } catch (error) {
            console.error('Error saving client service:', error);
            alert('Error: ' + (error.message || 'Failed to save client service'));
        }
    });
}

async function editClientService(id) {
    await showClientServiceModal(id);
}

async function deleteClientService(id) {
    if (!confirm('Are you sure you want to delete this client service?')) return;
    try {
        await api.delete(`/client-services/${id}`);
        await loadClientServicesData();
        if (window.showToast) {
            window.showToast('Client service deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting client service:', error);
        alert('Error: ' + (error.message || 'Failed to delete client service'));
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

