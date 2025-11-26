window.loadServices = async function() {
    // Check authentication before loading services
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1><i class="fas fa-cog"></i> Service Management</h1>
                <p class="page-subtitle">Manage your services and pricing</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="showServiceModal()">
                    <i class="fas fa-plus"></i> Add Service
                </button>
            </div>
        </div>

        <!-- Services Section -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h2><i class="fas fa-list"></i> Services</h2>
                    <p class="card-subtitle">Manage service offerings</p>
                </div>
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="serviceSearch" placeholder="Search services..." onkeyup="filterServices()">
                </div>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table id="servicesTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="5" class="loading-state">
                                    <div class="loading-spinner"></div>
                                    <span>Loading services...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Service Fees Section -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h2><i class="fas fa-dollar-sign"></i> Service Fees</h2>
                    <p class="card-subtitle">Configure pricing for each service</p>
                </div>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table id="serviceFeesTable">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Fee (USD/day/employee)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="3" class="loading-state">
                                    <div class="loading-spinner"></div>
                                    <span>Loading fees...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    await loadServicesData();
    await loadServiceFees();
}

async function loadServicesData() {
    try {
        const services = await api.get('/services');
        const tbody = document.querySelector('#servicesTable tbody');
        
        if (!services || services.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No services found. Click "Add Service" to create one.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = services.map(service => `
            <tr>
                <td><span class="service-id">#${service.id}</span></td>
                <td>
                    <div class="service-name-cell">
                        <i class="fas fa-cog service-icon"></i>
                        <strong>${service.name}</strong>
                    </div>
                </td>
                <td>
                    <div class="service-description">${service.description || 'No description'}</div>
                </td>
                <td>
                    ${service.isActive 
                        ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Active</span>'
                        : '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Inactive</span>'
                    }
                </td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editService(${service.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteService(${service.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading services:', error);
        const tbody = document.querySelector('#servicesTable tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading services. Please try again.</p>
                </td>
            </tr>
        `;
        if (window.showToast) {
            window.showToast('Failed to load services', 'error');
        }
    }
}

async function loadServiceFees() {
    try {
        const fees = await api.get('/services/fees');
        const tbody = document.querySelector('#serviceFeesTable tbody');
        
        if (!fees || fees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No service fees configured.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = fees.map(fee => `
            <tr>
                <td>
                    <div class="service-name-cell">
                        <i class="fas fa-cog service-icon"></i>
                        <strong>${fee.service?.name || 'N/A'}</strong>
                    </div>
                </td>
                <td>
                    <div class="fee-amount">
                        <span class="currency">$</span>
                        <span class="amount">${fee.feePerDayPerEmployee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span class="fee-unit">/day/employee</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editServiceFee(${fee.id}, ${fee.serviceId})">
                        <i class="fas fa-edit"></i> Edit Fee
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading service fees:', error);
        const tbody = document.querySelector('#serviceFeesTable tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading service fees. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

function filterServices() {
    const searchTerm = document.getElementById('serviceSearch')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#servicesTable tbody tr');
    
    rows.forEach(row => {
        if (row.classList.contains('empty-state') || row.classList.contains('error-state') || row.classList.contains('loading-state')) {
            return;
        }
        
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

async function showServiceModal(serviceId = null) {
    const service = serviceId ? await api.get(`/services/${serviceId}`) : null;
    const modal = createModal('serviceModal', serviceId ? 'Edit Service' : 'Add Service', `
        <form id="serviceForm">
            <div class="form-group">
                <label>
                    <i class="fas fa-tag"></i> Service Name <span class="required">*</span>
                </label>
                <input type="text" id="serviceName" value="${service?.name || ''}" required placeholder="Enter service name">
            </div>
            <div class="form-group">
                <label>
                    <i class="fas fa-align-left"></i> Description
                </label>
                <textarea id="serviceDescription" rows="4" placeholder="Enter service description">${service?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="serviceIsActive" ${service?.isActive !== false ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                        <i class="fas fa-toggle-on"></i> Active Service
                    </span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal('serviceModal')">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> ${serviceId ? 'Update' : 'Create'} Service
                </button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('serviceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: serviceId || 0,
            name: document.getElementById('serviceName').value.trim(),
            description: document.getElementById('serviceDescription').value.trim(),
            isActive: document.getElementById('serviceIsActive').checked
        };
        
        try {
            if (serviceId) {
                await api.put(`/services/${serviceId}`, data);
                if (window.showToast) {
                    window.showToast('Service updated successfully', 'success');
                }
            } else {
                await api.post('/services', data);
                if (window.showToast) {
                    window.showToast('Service created successfully', 'success');
                }
            }
            closeModal('serviceModal');
            await loadServicesData();
        } catch (error) {
            const errorMsg = error.message || 'An error occurred';
            if (window.showToast) {
                window.showToast(errorMsg, 'error');
            } else {
                alert('Error: ' + errorMsg);
            }
        }
    });
}

async function editService(id) {
    await showServiceModal(id);
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
    try {
        await api.delete(`/services/${id}`);
        if (window.showToast) {
            window.showToast('Service deleted successfully', 'success');
        }
        await loadServicesData();
    } catch (error) {
        const errorMsg = error.message || 'An error occurred';
        if (window.showToast) {
            window.showToast(errorMsg, 'error');
        } else {
            alert('Error: ' + errorMsg);
        }
    }
}

async function editServiceFee(id, serviceId) {
    try {
        const fees = await api.get('/services/fees');
        const serviceFee = fees.find(f => f.id === id);
        
        if (!serviceFee) {
            if (window.showToast) {
                window.showToast('Service fee not found', 'error');
            }
            return;
        }

        const modal = createModal('feeModal', 'Edit Service Fee', `
            <form id="feeForm">
                <div class="form-group">
                    <label>
                        <i class="fas fa-cog"></i> Service
                    </label>
                    <input type="text" value="${serviceFee.service?.name || 'N/A'}" disabled style="background: var(--bg-tertiary);">
                </div>
                <div class="form-group">
                    <label>
                        <i class="fas fa-dollar-sign"></i> Fee (USD/day/employee) <span class="required">*</span>
                    </label>
                    <div class="input-with-icon">
                        <span class="input-prefix">$</span>
                        <input type="number" id="feeAmount" value="${serviceFee.feePerDayPerEmployee}" step="0.01" min="0" required placeholder="0.00">
                    </div>
                    <small class="form-hint">Enter the daily fee per employee for this service</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" onclick="closeModal('feeModal')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Update Fee
                    </button>
                </div>
            </form>
        `);
        document.body.appendChild(modal);
        
        document.getElementById('feeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const feeAmount = parseFloat(document.getElementById('feeAmount').value);
            
            if (isNaN(feeAmount) || feeAmount < 0) {
                if (window.showToast) {
                    window.showToast('Please enter a valid fee amount', 'error');
                } else {
                    alert('Please enter a valid fee amount');
                }
                return;
            }
            
            try {
                await api.put(`/services/fees/${id}`, {
                    id: id,
                    serviceId: serviceId,
                    feePerDayPerEmployee: feeAmount
                });
                if (window.showToast) {
                    window.showToast('Service fee updated successfully', 'success');
                }
                closeModal('feeModal');
                await loadServiceFees();
            } catch (error) {
                const errorMsg = error.message || 'An error occurred';
                if (window.showToast) {
                    window.showToast(errorMsg, 'error');
                } else {
                    alert('Error: ' + errorMsg);
                }
            }
        });
    } catch (error) {
        const errorMsg = error.message || 'An error occurred';
        if (window.showToast) {
            window.showToast(errorMsg, 'error');
        } else {
            alert('Error: ' + errorMsg);
        }
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
