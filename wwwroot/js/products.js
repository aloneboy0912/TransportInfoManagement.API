// Product Management Page - Uses API calls instead of mock data

window.loadProducts = async function() {
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

    // Load clients from API
    try {
        const clients = await api.get('/clients');
        const clientsArray = Array.isArray(clients) ? clients : [];
        const filterClient = document.getElementById('filterClient');
        
        clientsArray.forEach(c => {
            const clientId = c.id ?? c.Id ?? 0;
            const companyName = c.companyName ?? c.CompanyName ?? 'N/A';
            filterClient.innerHTML += `<option value="${clientId}">${companyName}</option>`;
        });
    } catch (error) {
        console.error('Error loading clients:', error);
    }

    await loadProductsData();
}

window.loadProductsData = async function loadProductsData() {
    try {
        const clientId = document.getElementById('filterClient')?.value;
        const url = clientId ? `/products?clientId=${clientId}` : '/products';
        
        // Load products from API
        const products = await api.get(url);
        const productsArray = Array.isArray(products) ? products : [];
        
        // Helper function to safely get property value
        const getProp = (obj, ...keys) => {
            for (const key of keys) {
                if (obj && (obj[key] !== undefined && obj[key] !== null)) {
                    return obj[key];
                }
            }
            return null;
        };
        
        // Enrich with client data (data should already include related entities from API)
        const enrichedProducts = productsArray.map(product => {
            const clientId = getProp(product, 'clientId', 'ClientId');
            const client = product.client || product.Client;
            
            return {
                id: getProp(product, 'id', 'Id'),
                productCode: getProp(product, 'productCode', 'ProductCode') ?? 'N/A',
                productName: getProp(product, 'productName', 'ProductName') ?? 'N/A',
                clientId: clientId,
                category: getProp(product, 'category', 'Category') ?? 'N/A',
                description: getProp(product, 'description', 'Description') ?? '',
                client: client ? { 
                    companyName: getProp(client, 'companyName', 'CompanyName') ?? 'N/A' 
                } : null
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

window.showProductModal = async function showProductModal(productId = null) {
    // Load product if editing
    let product = null;
    if (productId) {
        try {
            product = await api.get(`/products/${productId}`);
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }
    
    // Load clients from API
    let clients = [];
    try {
        const clientsData = await api.get('/clients');
        clients = Array.isArray(clientsData) ? clientsData : [];
    } catch (error) {
        console.error('Error loading clients:', error);
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
    
    const modal = createModal('productModal', productId ? 'Edit Product' : 'Add Product', `
        <form id="productForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Product Code</label>
                    <input type="text" id="productCode" value="${getProp(product, 'productCode', 'ProductCode') || ''}">
                </div>
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="productName" value="${getProp(product, 'productName', 'ProductName') || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Client</label>
                    <select id="productClientId" required>
                        <option value="">Select Client</option>
                        ${clients.map(c => {
                            const clientId = getProp(c, 'id', 'Id');
                            const companyName = getProp(c, 'companyName', 'CompanyName') ?? 'N/A';
                            const currentClientId = getProp(product, 'clientId', 'ClientId');
                            return `<option value="${clientId}" ${currentClientId === clientId ? 'selected' : ''}>${companyName}</option>`;
                        }).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" id="productCategory" value="${getProp(product, 'category', 'Category') || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="productDescription" rows="3">${getProp(product, 'description', 'Description') || ''}</textarea>
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
                // Update existing via API
                await api.put(`/products/${productId}`, data);
            } else {
                // Create new via API
                await api.post('/products', data);
            }
            closeModal('productModal');
            await loadProductsData();
            if (window.showToast) {
                window.showToast(productId ? 'Product updated successfully' : 'Product created successfully', 'success');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error: ' + (error.message || 'Failed to save product'));
        }
    });
};

window.editProduct = function editProduct(id) {
    showProductModal(id);
};

window.deleteProduct = async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await api.delete(`/products/${id}`);
        await loadProductsData();
        if (window.showToast) {
            window.showToast('Product deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error: ' + (error.message || 'Failed to delete product'));
    }
};

