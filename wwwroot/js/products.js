// Mock data for products
const mockProducts = [
    { id: 1, productCode: "PROD001", productName: "Enterprise CRM Software", clientId: 1, category: "Software", description: "Comprehensive customer relationship management solution for enterprise clients", createdAt: "2024-01-15T00:00:00Z" },
    { id: 2, productCode: "PROD002", productName: "Cloud Storage Platform", clientId: 2, category: "Cloud Services", description: "Scalable cloud storage and backup solution", createdAt: "2024-01-20T00:00:00Z" },
    { id: 3, productCode: "PROD003", productName: "Marketing Analytics Tool", clientId: 3, category: "Analytics", description: "Advanced analytics platform for marketing campaigns", createdAt: "2024-02-01T00:00:00Z" },
    { id: 4, productCode: "PROD004", productName: "HR Management System", clientId: 4, category: "HR Software", description: "Complete human resources management and payroll system", createdAt: "2024-02-10T00:00:00Z" },
    { id: 5, productCode: "PROD005", productName: "Network Security Suite", clientId: 5, category: "Security", description: "Enterprise-grade network security and firewall solution", createdAt: "2024-02-15T00:00:00Z" },
    { id: 6, productCode: "PROD006", productName: "E-commerce Platform", clientId: 6, category: "E-commerce", description: "Full-featured online store and shopping cart system", createdAt: "2024-02-20T00:00:00Z" },
    { id: 7, productCode: "PROD007", productName: "Business Intelligence Dashboard", clientId: 7, category: "Analytics", description: "Real-time business intelligence and reporting dashboard", createdAt: "2024-03-01T00:00:00Z" },
    { id: 8, productCode: "PROD008", productName: "Project Management Tool", clientId: 8, category: "Productivity", description: "Collaborative project management and task tracking platform", createdAt: "2024-03-05T00:00:00Z" },
    { id: 9, productCode: "PROD009", productName: "Mobile App Development Kit", clientId: 9, category: "Development", description: "Complete toolkit for building cross-platform mobile applications", createdAt: "2024-03-10T00:00:00Z" },
    { id: 10, productCode: "PROD010", productName: "Customer Support Portal", clientId: 10, category: "Support", description: "Integrated customer support ticketing and knowledge base system", createdAt: "2024-03-15T00:00:00Z" },
    { id: 11, productCode: "PROD011", productName: "Data Integration Platform", clientId: 11, category: "Integration", description: "Enterprise data integration and ETL solution", createdAt: "2024-03-20T00:00:00Z" },
    { id: 12, productCode: "PROD012", productName: "Financial Planning Software", clientId: 12, category: "Finance", description: "Comprehensive financial planning and budgeting tool", createdAt: "2024-03-25T00:00:00Z" },
    { id: 13, productCode: "PROD013", productName: "Email Marketing Platform", clientId: 1, category: "Marketing", description: "Advanced email marketing automation and campaign management", createdAt: "2024-04-01T00:00:00Z" },
    { id: 14, productCode: "PROD014", productName: "Document Management System", clientId: 2, category: "Documentation", description: "Enterprise document storage, version control, and collaboration", createdAt: "2024-04-05T00:00:00Z" },
    { id: 15, productCode: "PROD015", productName: "API Gateway Service", clientId: 3, category: "Integration", description: "High-performance API gateway and management platform", createdAt: "2024-04-10T00:00:00Z" }
];

// Use mockClients from client-services.js (loaded before this file)
// Reference it via window or direct access
const getMockClients = () => {
    if (typeof mockClients !== 'undefined') {
        return mockClients;
    }
    // Fallback if not available
    return [
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
};

window.loadProducts = function() {
    // Check authentication before loading products
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-box"></i> Product Management</h1>
            <button class="btn btn-primary" onclick="showProductModal()">
                <i class="fas fa-plus"></i> Add Product
            </button>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterClient" onchange="loadProductsData()">
                    <option value="">All Clients</option>
                </select>
            </div>
            <div class="table-container">
                <table id="productsTable">
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Product Name</th>
                            <th>Client</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    const filterClient = document.getElementById('filterClient');
    
    getMockClients().forEach(c => {
        filterClient.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
    });

    loadProductsData();
}

window.loadProductsData = function loadProductsData() {
    try {
        const clientId = document.getElementById('filterClient')?.value;
        let products = mockProducts;
        
        // Filter by client if selected
        if (clientId) {
            products = products.filter(p => p.clientId === parseInt(clientId));
        }
        
        // Enrich with client data
        const clients = getMockClients();
        const enrichedProducts = products.map(product => {
            const client = clients.find(c => c.id === product.clientId);
            return {
                ...product,
                client: client ? { companyName: client.companyName } : null
            };
        });
        
        const tbody = document.querySelector('#productsTable tbody');
        
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        
        if (!enrichedProducts || enrichedProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No products found. Click "Add Product" to create one.</td></tr>';
            return;
        }
        
        tbody.innerHTML = enrichedProducts.map(product => `
            <tr>
                <td>${product.productCode}</td>
                <td>${product.productName}</td>
                <td>${product.client?.companyName || 'N/A'}</td>
                <td>${product.category}</td>
                <td>${product.description}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        const tbody = document.querySelector('#productsTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger-color);">Error loading products. Please refresh the page.</td></tr>';
        }
    }
};

window.showProductModal = function showProductModal(productId = null) {
    const product = productId ? mockProducts.find(p => p.id === productId) : null;
    const modal = createModal('productModal', productId ? 'Edit Product' : 'Add Product', `
        <form id="productForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Product Code</label>
                    <input type="text" id="productCode" value="${product?.productCode || ''}">
                </div>
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="productName" value="${product?.productName || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Client</label>
                    <select id="productClientId" required>
                        <option value="">Select Client</option>
                        ${getMockClients().map(c => `<option value="${c.id}" ${product?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" id="productCategory" value="${product?.category || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="productDescription" rows="3">${product?.description || ''}</textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('productModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: productId || 0,
            productCode: document.getElementById('productCode').value,
            productName: document.getElementById('productName').value,
            clientId: parseInt(document.getElementById('productClientId').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value
        };
        
        try {
            if (productId) {
                // Update existing
                const index = mockProducts.findIndex(p => p.id === productId);
                if (index !== -1) {
                    mockProducts[index] = {
                        ...data,
                        createdAt: mockProducts[index].createdAt
                    };
                }
            } else {
                // Create new
                const newId = Math.max(...mockProducts.map(p => p.id), 0) + 1;
                mockProducts.push({
                    ...data,
                    id: newId,
                    createdAt: new Date().toISOString()
                });
            }
            closeModal('productModal');
            loadProductsData();
            if (window.showToast) {
                window.showToast(productId ? 'Product updated successfully' : 'Product created successfully', 'success');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
};

window.editProduct = function editProduct(id) {
    showProductModal(id);
};

window.deleteProduct = function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            mockProducts.splice(index, 1);
        }
        loadProductsData();
        if (window.showToast) {
            window.showToast('Product deleted successfully', 'success');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

