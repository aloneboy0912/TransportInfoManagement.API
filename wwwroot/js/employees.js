window.loadEmployees = async function() {
    // Check authentication before loading employees
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-users"></i> Employee Management</h1>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-success" onclick="exportEmployeesToXLSX()" id="exportEmployeesBtn" style="display: none;">
                    <i class="fas fa-file-excel"></i> Export to Excel
                </button>
                <button class="btn btn-primary" onclick="showEmployeeModal()">
                    <i class="fas fa-plus"></i> Add Employee
                </button>
            </div>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterService" onchange="loadEmployeesData()">
                    <option value="">All Services</option>
                </select>
                <select id="filterDepartment" onchange="loadEmployeesData()">
                    <option value="">All Departments</option>
                </select>
            </div>
            <div class="table-container">
                <table id="employeesTable">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Position</th>
                            <th>Service</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    // Load services and departments from API
    try {
        const servicesData = await api.get('/services');
        const departmentsData = await api.get('/departments');
        
        const services = Array.isArray(servicesData) ? servicesData : [];
        const departments = Array.isArray(departmentsData) ? departmentsData : [];
        
        const filterService = document.getElementById('filterService');
        const filterDepartment = document.getElementById('filterDepartment');
        
        // Helper function to safely get property value
        const getProp = (obj, ...keys) => {
            for (const key of keys) {
                if (obj && (obj[key] !== undefined && obj[key] !== null)) {
                    return obj[key];
                }
            }
            return null;
        };
        
        services.forEach(s => {
            const serviceId = getProp(s, 'id', 'Id') ?? 0;
            const serviceName = getProp(s, 'name', 'Name') ?? 'N/A';
            filterService.innerHTML += `<option value="${serviceId}">${serviceName}</option>`;
        });
        
        departments.forEach(d => {
            const deptId = getProp(d, 'id', 'Id') ?? 0;
            const deptName = getProp(d, 'name', 'Name') ?? 'N/A';
            filterDepartment.innerHTML += `<option value="${deptId}">${deptName}</option>`;
        });
    } catch (error) {
        console.error('Error loading services/departments:', error);
    }

    await loadEmployeesData();
}

async function loadEmployeesData() {
    try {
        const serviceId = document.getElementById('filterService')?.value;
        const deptId = document.getElementById('filterDepartment')?.value;
        
        let url = '/employees';
        const params = new URLSearchParams();
        if (serviceId) params.append('serviceId', serviceId);
        if (deptId) params.append('departmentId', deptId);
        if (params.toString()) url += '?' + params.toString();
        
        const employeesData = await api.get(url);
        const employees = Array.isArray(employeesData) ? employeesData : [];
        
        // Helper function to safely get property value
        const getProp = (obj, ...keys) => {
            for (const key of keys) {
                if (obj && (obj[key] !== undefined && obj[key] !== null)) {
                    return obj[key];
                }
            }
            return null;
        };
        
        // Helper function to escape HTML
        const escapeHtml = (text) => {
            if (text === null || text === undefined) return 'N/A';
            if (typeof text === 'number') return text.toString();
            return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        };
        
        // Show all employees (no filtering needed - all employees are real accounts)
        const filteredEmployees = employees.filter(emp => {
            const empId = getProp(emp, 'id', 'Id');
            return empId !== null && empId !== undefined;
        });
        
        const tbody = document.querySelector('#employeesTable tbody');
        
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        
        if (!filteredEmployees || filteredEmployees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No employees found. Click "Add Employee" to create one.</td></tr>';
            // Hide export button if no data
            const exportBtn = document.getElementById('exportEmployeesBtn');
            if (exportBtn) {
                exportBtn.style.display = 'none';
            }
            return;
        }
        
        tbody.innerHTML = filteredEmployees.map(emp => {
            const empId = getProp(emp, 'id', 'Id') ?? 0;
            const employeeCode = escapeHtml(getProp(emp, 'employeeCode', 'EmployeeCode') ?? 'N/A');
            const fullName = escapeHtml(getProp(emp, 'fullName', 'FullName') ?? 'N/A');
            const email = escapeHtml(getProp(emp, 'email', 'Email') ?? 'N/A');
            const phone = escapeHtml(getProp(emp, 'phone', 'Phone') ?? 'N/A');
            const position = escapeHtml(getProp(emp, 'position', 'Position') ?? 'N/A');
            
            // Handle service and department (could be nested objects or IDs)
            const service = emp.service || emp.Service;
            const department = emp.department || emp.Department;
            const serviceName = service ? escapeHtml(getProp(service, 'name', 'Name') ?? 'N/A') : 'N/A';
            const departmentName = department ? escapeHtml(getProp(department, 'name', 'Name') ?? 'N/A') : 'N/A';
            
            // Check if employee is protected (IDs 1-30 are real employee accounts)
            const isProtected = empId >= 1 && empId <= 30;
            const protectedBadge = isProtected ? '<span class="protected-badge" title="Protected System Account"><i class="fas fa-shield-alt"></i></span>' : '';
            const editDisabled = isProtected ? 'disabled' : '';
            const deleteDisabled = isProtected ? 'disabled' : '';
            const editTitle = isProtected ? 'Protected account - cannot be edited' : 'Edit';
            const deleteTitle = isProtected ? 'Protected account - cannot be deleted' : 'Delete';
            
            return `
            <tr ${isProtected ? 'class="protected-row"' : ''}>
                <td>${employeeCode} ${protectedBadge}</td>
                <td>${fullName}</td>
                <td>${email}</td>
                <td>${phone}</td>
                <td>${position}</td>
                <td>${serviceName}</td>
                <td>${departmentName}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editEmployee(${empId})" title="${editTitle}" ${editDisabled}>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteEmployee(${empId})" title="${deleteTitle}" ${deleteDisabled}>
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        }).join('');
        
        // Store filtered data for export and show export button
        window.employeesData = filteredEmployees;
        const exportBtn = document.getElementById('exportEmployeesBtn');
        if (exportBtn && filteredEmployees && filteredEmployees.length > 0) {
            exportBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        const tbody = document.querySelector('#employeesTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--danger-color);">Error loading employees. Please refresh the page.</td></tr>';
        }
    }
}

window.exportEmployeesToXLSX = function() {
    if (!window.employeesData || window.employeesData.length === 0) {
        if (window.showToast) {
            window.showToast('No data to export', 'warning');
        }
        return;
    }
    
    const columns = [
        { key: 'employeeCode', label: 'Employee Code' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'position', label: 'Position' },
        { key: 'service.name', label: 'Service' },
        { key: 'department.name', label: 'Department' },
        { key: 'hireDate', label: 'Hire Date', type: 'date' }
    ];
    
    window.exportToXLSX(window.employeesData, columns, 'Employees_List');
};

async function showEmployeeModal(empId = null) {
    try {
        // Fetch data when needed
        const servicesData = await api.get('/services');
        const departmentsData = await api.get('/departments');
        const services = Array.isArray(servicesData) ? servicesData : [];
        const departments = Array.isArray(departmentsData) ? departmentsData : [];
        
        let emp = null;
        if (empId) {
            try {
                const empData = await api.get(`/employees/${empId}`);
                emp = empData;
            } catch (error) {
                console.error('Error loading employee:', error);
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
        
        const modal = createModal('employeeModal', empId ? 'Edit Employee' : 'Add Employee', `
        <form id="employeeForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Employee Code</label>
                    <input type="text" id="empCode" value="${getProp(emp, 'employeeCode', 'EmployeeCode') || ''}">
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="empFullName" value="${getProp(emp, 'fullName', 'FullName') || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="empEmail" value="${getProp(emp, 'email', 'Email') || ''}" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="empPhone" value="${getProp(emp, 'phone', 'Phone') || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Position</label>
                    <input type="text" id="empPosition" value="${getProp(emp, 'position', 'Position') || ''}">
                </div>
                <div class="form-group">
                    <label>Service</label>
                    <select id="empServiceId" required>
                        <option value="">Select Service</option>
                        ${services.map(s => {
                            const serviceId = getProp(s, 'id', 'Id') ?? 0;
                            const serviceName = getProp(s, 'name', 'Name') ?? 'N/A';
                            const currentServiceId = getProp(emp, 'serviceId', 'ServiceId');
                            return `<option value="${serviceId}" ${currentServiceId === serviceId ? 'selected' : ''}>${serviceName}</option>`;
                        }).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Department</label>
                <select id="empDepartmentId" required>
                    <option value="">Select Department</option>
                    ${departments.map(d => {
                        const deptId = getProp(d, 'id', 'Id') ?? 0;
                        const deptName = getProp(d, 'name', 'Name') ?? 'N/A';
                        const currentDeptId = getProp(emp, 'departmentId', 'DepartmentId');
                        return `<option value="${deptId}" ${currentDeptId === deptId ? 'selected' : ''}>${deptName}</option>`;
                    }).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="empIsActive" ${getProp(emp, 'isActive', 'IsActive') !== false ? 'checked' : ''}>
                    Active
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('employeeModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `);
        document.body.appendChild(modal);
        
        document.getElementById('employeeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                id: empId || 0,
                employeeCode: document.getElementById('empCode').value,
                fullName: document.getElementById('empFullName').value,
                email: document.getElementById('empEmail').value,
                phone: document.getElementById('empPhone').value,
                position: document.getElementById('empPosition').value,
                serviceId: parseInt(document.getElementById('empServiceId').value),
                departmentId: parseInt(document.getElementById('empDepartmentId').value),
                isActive: document.getElementById('empIsActive').checked
            };
            
            try {
                if (empId) {
                    await api.put(`/employees/${empId}`, data);
                } else {
                    await api.post('/employees', data);
                }
                closeModal('employeeModal');
                await loadEmployeesData();
                if (window.showToast) {
                    window.showToast(empId ? 'Employee updated successfully' : 'Employee created successfully', 'success');
                }
            } catch (error) {
                console.error('Error saving employee:', error);
                const errorMessage = error.message || 'Failed to save employee';
                if (window.showToast) {
                    window.showToast(errorMessage, 'error');
                } else {
                    alert(errorMessage);
                }
            }
        });
    } catch (error) {
        console.error('Error loading employee modal data:', error);
        alert('Error: ' + (error.message || 'Failed to load employee form data'));
    }
}

async function editEmployee(id) {
    // Protect real employee accounts (IDs 1-30)
    if (id >= 1 && id <= 30) {
        if (window.showToast) {
            window.showToast('Cannot edit protected employee accounts. These are system accounts.', 'warning');
        } else {
            alert('Cannot edit protected employee accounts. These are system accounts.');
        }
        return;
    }
    await showEmployeeModal(id);
}

async function deleteEmployee(id) {
    // Protect real employee accounts (IDs 1-30)
    if (id >= 1 && id <= 30) {
        if (window.showToast) {
            window.showToast('Cannot delete protected employee accounts. These are system accounts.', 'warning');
        } else {
            alert('Cannot delete protected employee accounts. These are system accounts.');
        }
        return;
    }
    
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
        await api.delete(`/employees/${id}`);
        await loadEmployeesData();
        if (window.showToast) {
            window.showToast('Employee deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        const errorMessage = error.message || 'Failed to delete employee';
        if (window.showToast) {
            window.showToast(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    }
}

