// Client Service Management Page - English Version
// Use a namespace to avoid variable conflicts
window.ClientServicesPage = window.ClientServicesPage || {
    clients: [],
    services: [],
    employees: [],
    clientServices: []
};

// Mock data
const mockClients = [
    { id: 1, clientCode: "CLI001", companyName: "Tech Solutions Inc.", contactPerson: "Robert Chen", email: "robert.chen@techsolutions.com", phone: "+1-555-1001", address: "123 Tech Street", city: "San Francisco", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 2, clientCode: "CLI002", companyName: "Global Enterprises Ltd.", contactPerson: "Maria Garcia", email: "maria.garcia@globalent.com", phone: "+1-555-1002", address: "456 Business Ave", city: "New York", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 3, clientCode: "CLI003", companyName: "Digital Innovations Corp.", contactPerson: "James Wilson", email: "james.wilson@digitalinnov.com", phone: "+1-555-1003", address: "789 Innovation Blvd", city: "Seattle", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 4, clientCode: "CLI004", companyName: "Premier Services Group", contactPerson: "Sarah Thompson", email: "sarah.thompson@premierservices.com", phone: "+1-555-1004", address: "321 Service Road", city: "Chicago", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 5, clientCode: "CLI005", companyName: "Advanced Systems Co.", contactPerson: "Michael Rodriguez", email: "michael.rodriguez@advancedsys.com", phone: "+1-555-1005", address: "654 System Drive", city: "Austin", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 6, clientCode: "CLI006", companyName: "Elite Business Partners", contactPerson: "Jennifer Martinez", email: "jennifer.martinez@elitebiz.com", phone: "+1-555-1006", address: "987 Elite Plaza", city: "Los Angeles", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 7, clientCode: "CLI007", companyName: "Strategic Solutions LLC", contactPerson: "David Kim", email: "david.kim@strategicsol.com", phone: "+1-555-1007", address: "147 Strategy Lane", city: "Boston", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 8, clientCode: "CLI008", companyName: "Prime Consulting Group", contactPerson: "Lisa Anderson", email: "lisa.anderson@primeconsult.com", phone: "+1-555-1008", address: "258 Prime Street", city: "Denver", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 9, clientCode: "CLI009", companyName: "Modern Tech Solutions", contactPerson: "Christopher Brown", email: "christopher.brown@moderntech.com", phone: "+1-555-1009", address: "369 Modern Way", city: "Portland", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 10, clientCode: "CLI010", companyName: "Excellence Corporation", contactPerson: "Amanda White", email: "amanda.white@excellencecorp.com", phone: "+1-555-1010", address: "741 Excellence Blvd", city: "Miami", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 11, clientCode: "CLI011", companyName: "Innovation Hub Inc.", contactPerson: "Daniel Lee", email: "daniel.lee@innovationhub.com", phone: "+1-555-1011", address: "852 Innovation Center", city: "San Diego", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
    { id: 12, clientCode: "CLI012", companyName: "Professional Services Co.", contactPerson: "Nicole Taylor", email: "nicole.taylor@profservices.com", phone: "+1-555-1012", address: "963 Professional Park", city: "Phoenix", country: "USA", isActive: true, createdAt: "2024-01-01T00:00:00Z" }
];

const mockServices = [
    { id: 1, name: "In-bound Services", description: "Receiving calls from customers" },
    { id: 2, name: "Out-bound Services", description: "Staff proactively calling customers" },
    { id: 3, name: "Tele Marketing Services", description: "Marketing and sales services via telephone" }
];

const mockEmployees = [
    { id: 1, employeeCode: "EMP001", fullName: "John Smith", email: "john.smith@excell-on.com", phone: "+1-555-0101", position: "Customer Service Representative", serviceId: 1, departmentId: 3, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 2, employeeCode: "EMP002", fullName: "Sarah Johnson", email: "sarah.johnson@excell-on.com", phone: "+1-555-0102", position: "Sales Manager", serviceId: 2, departmentId: 3, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 3, employeeCode: "EMP003", fullName: "Michael Brown", email: "michael.brown@excell-on.com", phone: "+1-555-0103", position: "Telemarketing Specialist", serviceId: 3, departmentId: 3, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 4, employeeCode: "EMP004", fullName: "Emily Davis", email: "emily.davis@excell-on.com", phone: "+1-555-0104", position: "HR Manager", serviceId: 1, departmentId: 1, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 5, employeeCode: "EMP005", fullName: "David Wilson", email: "david.wilson@excell-on.com", phone: "+1-555-0105", position: "Administrative Assistant", serviceId: 1, departmentId: 2, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 6, employeeCode: "EMP006", fullName: "Jessica Martinez", email: "jessica.martinez@excell-on.com", phone: "+1-555-0106", position: "Training Coordinator", serviceId: 2, departmentId: 4, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 7, employeeCode: "EMP007", fullName: "Robert Taylor", email: "robert.taylor@excell-on.com", phone: "+1-555-0107", position: "Security Analyst", serviceId: 1, departmentId: 5, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 8, employeeCode: "EMP008", fullName: "Lisa Anderson", email: "lisa.anderson@excell-on.com", phone: "+1-555-0108", position: "Auditor", serviceId: 3, departmentId: 6, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 9, employeeCode: "EMP009", fullName: "James Thomas", email: "james.thomas@excell-on.com", phone: "+1-555-0109", position: "Customer Support Lead", serviceId: 1, departmentId: 3, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 10, employeeCode: "EMP010", fullName: "Amanda White", email: "amanda.white@excell-on.com", phone: "+1-555-0110", position: "Sales Representative", serviceId: 2, departmentId: 3, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 11, employeeCode: "EMP011", fullName: "Christopher Lee", email: "christopher.lee@excell-on.com", phone: "+1-555-0111", position: "Marketing Specialist", serviceId: 3, departmentId: 3, hireDate: "2024-01-01T00:00:00Z", isActive: true },
    { id: 12, employeeCode: "EMP012", fullName: "Michelle Harris", email: "michelle.harris@excell-on.com", phone: "+1-555-0112", position: "HR Coordinator", serviceId: 1, departmentId: 1, hireDate: "2024-01-01T00:00:00Z", isActive: true }
];

const mockServiceFees = [
    { serviceId: 1, feePerDayPerEmployee: 50 },
    { serviceId: 2, feePerDayPerEmployee: 75 },
    { serviceId: 3, feePerDayPerEmployee: 60 }
];

// Initialize mock client services
function initializeMockClientServices() {
    const baseDate = new Date('2024-01-01T00:00:00Z');
    window.ClientServicesPage.clientServices = [
        { id: 1, clientId: 1, serviceId: 1, employeeId: 1, numberOfEmployees: 3, startDate: new Date(baseDate.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, clientId: 2, serviceId: 2, employeeId: 2, numberOfEmployees: 5, startDate: new Date(baseDate.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, clientId: 3, serviceId: 3, employeeId: 3, numberOfEmployees: 2, startDate: new Date(baseDate.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), isActive: false, createdAt: new Date(baseDate.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, clientId: 4, serviceId: 1, employeeId: 4, numberOfEmployees: 4, startDate: new Date(baseDate.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 5, clientId: 5, serviceId: 2, employeeId: 5, numberOfEmployees: 6, startDate: new Date(baseDate.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 6, clientId: 6, serviceId: 3, employeeId: 6, numberOfEmployees: 3, startDate: new Date(baseDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 7, clientId: 7, serviceId: 1, employeeId: 7, numberOfEmployees: 2, startDate: new Date(baseDate.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 8, clientId: 8, serviceId: 2, employeeId: 8, numberOfEmployees: 4, startDate: new Date(baseDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), isActive: false, createdAt: new Date(baseDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 9, clientId: 9, serviceId: 3, employeeId: 9, numberOfEmployees: 5, startDate: new Date(baseDate.getTime() - 70 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 70 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 10, clientId: 10, serviceId: 1, employeeId: 10, numberOfEmployees: 3, startDate: new Date(baseDate.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 11, clientId: 11, serviceId: 2, employeeId: 11, numberOfEmployees: 4, startDate: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 12, clientId: 12, serviceId: 3, employeeId: 12, numberOfEmployees: 2, startDate: new Date(baseDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 13, clientId: 1, serviceId: 2, employeeId: 2, numberOfEmployees: 3, startDate: new Date(baseDate.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 14, clientId: 2, serviceId: 1, employeeId: 1, numberOfEmployees: 4, startDate: new Date(baseDate.getTime() - 110 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 110 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 15, clientId: 3, serviceId: 1, employeeId: 4, numberOfEmployees: 2, startDate: new Date(baseDate.getTime() - 85 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, isActive: true, createdAt: new Date(baseDate.getTime() - 85 * 24 * 60 * 60 * 1000).toISOString() }
    ];
}

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

    // Initialize mock data
    initializeMockClientServices();
    window.ClientServicesPage.clients = mockClients;
    window.ClientServicesPage.services = mockServices;
    window.ClientServicesPage.employees = mockEmployees;
    
    const filterClient = document.getElementById('filterClient');
    const costClientId = document.getElementById('costClientId');
    
    if (filterClient && window.ClientServicesPage.clients && window.ClientServicesPage.clients.length > 0) {
        window.ClientServicesPage.clients.forEach(c => {
            filterClient.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
        });
    }
    
    if (costClientId && window.ClientServicesPage.clients && window.ClientServicesPage.clients.length > 0) {
        window.ClientServicesPage.clients.forEach(c => {
            costClientId.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
        });
    }

    loadClientServicesData();
}

window.loadClientServicesData = function loadClientServicesData() {
    try {
        // Ensure data is initialized
        if (!window.ClientServicesPage.clientServices || window.ClientServicesPage.clientServices.length === 0) {
            initializeMockClientServices();
        }
        
        const clientId = document.getElementById('filterClient')?.value;
        let clientServices = window.ClientServicesPage.clientServices || [];
        
        // Filter by client if selected
        if (clientId) {
            clientServices = clientServices.filter(cs => cs.clientId === parseInt(clientId));
        }
        
        // Enrich with related data
        const enrichedServices = clientServices.map(cs => {
            const client = mockClients.find(c => c.id === cs.clientId);
            const service = mockServices.find(s => s.id === cs.serviceId);
            const employee = mockEmployees.find(e => e.id === cs.employeeId);
            
            return {
                ...cs,
                client: client ? { companyName: client.companyName } : null,
                service: service ? { name: service.name } : null,
                employee: employee ? { fullName: employee.fullName } : null
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
    
    const clientServices = window.ClientServicesPage.clientServices.filter(cs => 
        cs.clientId === parseInt(clientId) && cs.isActive
    );
    
    let totalCost = 0;
    const details = [];
    
    clientServices.forEach(cs => {
        const service = mockServices.find(s => s.id === cs.serviceId);
        const serviceFee = mockServiceFees.find(sf => sf.serviceId === cs.serviceId);
        
        if (service && serviceFee) {
            const startDate = new Date(cs.startDate);
            const endDate = cs.endDate ? new Date(cs.endDate) : new Date();
            const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
            const cost = serviceFee.feePerDayPerEmployee * cs.numberOfEmployees * days;
            totalCost += cost;
            
            details.push({
                serviceName: service.name,
                numberOfEmployees: cs.numberOfEmployees,
                days: days,
                feePerDayPerEmployee: serviceFee.feePerDayPerEmployee,
                cost: cost
            });
        }
    });
    
    document.getElementById('costResult').innerHTML = `
        <h3>Total Cost: $${totalCost.toLocaleString()}</h3>
        <table>
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
    `;
}

async function showClientServiceModal(csId = null) {
    // Ensure data is loaded
    if (!window.ClientServicesPage.clients || window.ClientServicesPage.clients.length === 0) {
        window.ClientServicesPage.clients = mockClients;
    }
    if (!window.ClientServicesPage.services || window.ClientServicesPage.services.length === 0) {
        window.ClientServicesPage.services = mockServices;
    }
    if (!window.ClientServicesPage.employees || window.ClientServicesPage.employees.length === 0) {
        window.ClientServicesPage.employees = mockEmployees;
    }
    
    const cs = csId ? window.ClientServicesPage.clientServices.find(c => c.id === csId) : null;
    const modal = createModal('clientServiceModal', csId ? 'Edit Client Service' : 'Add Client Service', `
        <form id="clientServiceForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Client</label>
                    <select id="csClientId" required>
                        <option value="">Select Client</option>
                        ${window.ClientServicesPage.clients.map(c => `<option value="${c.id}" ${cs?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Service</label>
                    <select id="csServiceId" required>
                        <option value="">Select Service</option>
                        ${window.ClientServicesPage.services.map(s => `<option value="${s.id}" ${cs?.serviceId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Employee</label>
                    <select id="csEmployeeId">
                        <option value="">No Selection</option>
                        ${window.ClientServicesPage.employees.map(e => `<option value="${e.id}" ${cs?.employeeId === e.id ? 'selected' : ''}>${e.fullName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Number of Employees</label>
                    <input type="number" id="csNumberOfEmployees" value="${cs?.numberOfEmployees || 1}" min="1" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" id="csStartDate" value="${cs ? new Date(cs.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>End Date (Optional)</label>
                    <input type="date" id="csEndDate" value="${cs?.endDate ? new Date(cs.endDate).toISOString().split('T')[0] : ''}">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="csIsActive" ${cs?.isActive !== false ? 'checked' : ''}>
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
                // Update existing
                const index = window.ClientServicesPage.clientServices.findIndex(c => c.id === csId);
                if (index !== -1) {
                    window.ClientServicesPage.clientServices[index] = {
                        ...data,
                        createdAt: window.ClientServicesPage.clientServices[index].createdAt
                    };
                }
            } else {
                // Create new
                const newId = Math.max(...window.ClientServicesPage.clientServices.map(c => c.id), 0) + 1;
                window.ClientServicesPage.clientServices.push({
                    ...data,
                    id: newId,
                    createdAt: new Date().toISOString()
                });
            }
            closeModal('clientServiceModal');
            loadClientServicesData();
            if (window.showToast) {
                window.showToast(csId ? 'Client service updated successfully' : 'Client service created successfully', 'success');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function editClientService(id) {
    await showClientServiceModal(id);
}

async function deleteClientService(id) {
    if (!confirm('Are you sure you want to delete this client service?')) return;
    try {
        const index = window.ClientServicesPage.clientServices.findIndex(c => c.id === id);
        if (index !== -1) {
            window.ClientServicesPage.clientServices.splice(index, 1);
        }
        loadClientServicesData();
        if (window.showToast) {
            window.showToast('Client service deleted successfully', 'success');
        }
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

