window.loadDepartments = async function() {
    // Check authentication before loading departments
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1><i class="fas fa-building"></i> Department Management</h1>
                <p class="page-subtitle">Organize your company departments</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="showDepartmentModal()">
                    <i class="fas fa-plus"></i> Add Department
                </button>
            </div>
        </div>

        <!-- Departments Section -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h2><i class="fas fa-list"></i> Departments</h2>
                    <p class="card-subtitle">Manage organizational departments</p>
                </div>
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="departmentSearch" placeholder="Search departments..." onkeyup="filterDepartments()">
                </div>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table id="departmentsTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Department Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="5" class="loading-state">
                                    <div class="loading-spinner"></div>
                                    <span>Loading departments...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    await loadDepartmentsData();
}

async function loadDepartmentsData() {
    try {
        const departments = await api.get('/departments');
        const tbody = document.querySelector('#departmentsTable tbody');
        
        if (!departments || departments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No departments found. Click "Add Department" to create one.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = departments.map(dept => `
            <tr>
                <td><span class="service-id">#${dept.id}</span></td>
                <td>
                    <div class="service-name-cell">
                        <i class="fas fa-building service-icon"></i>
                        <strong>${dept.name}</strong>
                    </div>
                </td>
                <td>
                    <div class="service-description">${dept.description || 'No description'}</div>
                </td>
                <td>
                    ${dept.isActive 
                        ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Active</span>'
                        : '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Inactive</span>'
                    }
                </td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editDepartment(${dept.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteDepartment(${dept.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading departments:', error);
        const tbody = document.querySelector('#departmentsTable tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading departments. Please try again.</p>
                </td>
            </tr>
        `;
        if (window.showToast) {
            window.showToast('Failed to load departments', 'error');
        }
    }
}

function filterDepartments() {
    const searchTerm = document.getElementById('departmentSearch')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#departmentsTable tbody tr');
    
    rows.forEach(row => {
        if (row.classList.contains('empty-state') || row.classList.contains('error-state') || row.classList.contains('loading-state')) {
            return;
        }
        
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

async function showDepartmentModal(deptId = null) {
    const dept = deptId ? await api.get(`/departments/${deptId}`) : null;
    const modal = createModal('departmentModal', deptId ? 'Edit Department' : 'Add Department', `
        <form id="departmentForm">
            <div class="form-group">
                <label>
                    <i class="fas fa-building"></i> Department Name <span class="required">*</span>
                </label>
                <input type="text" id="deptName" value="${dept?.name || ''}" required placeholder="Enter department name">
            </div>
            <div class="form-group">
                <label>
                    <i class="fas fa-align-left"></i> Description
                </label>
                <textarea id="deptDescription" rows="4" placeholder="Enter department description">${dept?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="deptIsActive" ${dept?.isActive !== false ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                        <i class="fas fa-toggle-on"></i> Active Department
                    </span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal('departmentModal')">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> ${deptId ? 'Update' : 'Create'} Department
                </button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('departmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: deptId || 0,
            name: document.getElementById('deptName').value.trim(),
            description: document.getElementById('deptDescription').value.trim(),
            isActive: document.getElementById('deptIsActive').checked
        };
        
        try {
            if (deptId) {
                await api.put(`/departments/${deptId}`, data);
                if (window.showToast) {
                    window.showToast('Department updated successfully', 'success');
                }
            } else {
                await api.post('/departments', data);
                if (window.showToast) {
                    window.showToast('Department created successfully', 'success');
                }
            }
            closeModal('departmentModal');
            await loadDepartmentsData();
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

async function editDepartment(id) {
    await showDepartmentModal(id);
}

async function deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
    try {
        await api.delete(`/departments/${id}`);
        if (window.showToast) {
            window.showToast('Department deleted successfully', 'success');
        }
        await loadDepartmentsData();
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
