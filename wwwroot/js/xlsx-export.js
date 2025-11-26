// XLSX Export Utility Functions
// This module provides functions to export data to Excel (XLSX) format

/**
 * Export an array of objects to XLSX file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions [{key: 'fieldName', label: 'Display Name'}, ...]
 * @param {String} filename - Name of the file to download (without extension)
 */
window.exportToXLSX = function(data, columns, filename = 'export') {
    if (!data || data.length === 0) {
        if (window.showToast) {
            window.showToast('No data to export', 'warning');
        } else {
            alert('No data to export');
        }
        return;
    }

    try {
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Prepare data array with headers
        const worksheetData = [];
        
        // Add header row
        const headers = columns.map(col => col.label || col.key);
        worksheetData.push(headers);
        
        // Add data rows
        data.forEach(item => {
            const row = columns.map(col => {
                let value = item[col.key];
                
                // Handle nested properties (e.g., 'client.name')
                if (col.key.includes('.')) {
                    const keys = col.key.split('.');
                    value = keys.reduce((obj, key) => obj && obj[key], item);
                }
                
                // Format dates
                if (value && col.type === 'date') {
                    value = new Date(value).toLocaleDateString('en-US');
                }
                
                // Format currency
                if (col.type === 'currency') {
                    value = typeof value === 'number' ? `$${value.toLocaleString()}` : value;
                }
                
                // Format boolean status (isActive, etc.)
                if (col.type === 'status' || col.type === 'boolean') {
                    if (typeof value === 'boolean') {
                        value = value ? 'Active' : 'Not Active';
                    } else if (value === true || value === 'true' || value === 1 || value === '1') {
                        value = 'Active';
                    } else if (value === false || value === 'false' || value === 0 || value === '0') {
                        value = 'Not Active';
                    }
                }
                
                // Handle null/undefined
                if (value === null || value === undefined) {
                    value = '';
                }
                
                // Remove HTML tags if present
                if (typeof value === 'string' && value.includes('<')) {
                    const div = document.createElement('div');
                    div.innerHTML = value;
                    value = div.textContent || div.innerText || '';
                }
                
                return value;
            });
            worksheetData.push(row);
        });
        
        // Create worksheet from data
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Set column widths
        const colWidths = columns.map((col, index) => {
            const maxLength = Math.max(
                (col.label || col.key).length,
                ...data.map(item => {
                    let value = item[col.key];
                    if (col.key.includes('.')) {
                        const keys = col.key.split('.');
                        value = keys.reduce((obj, key) => obj && obj[key], item);
                    }
                    return String(value || '').length;
                })
            );
            return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
        });
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const fullFilename = `${filename}_${timestamp}.xlsx`;
        
        // Write file and trigger download
        XLSX.writeFile(wb, fullFilename);
        
        if (window.showToast) {
            window.showToast(`Exported ${data.length} records to ${fullFilename}`, 'success');
        }
    } catch (error) {
        console.error('Error exporting to XLSX:', error);
        if (window.showToast) {
            window.showToast('Error exporting to Excel', 'error');
        } else {
            alert('Error exporting to Excel: ' + error.message);
        }
    }
};

/**
 * Export HTML table to XLSX file
 * @param {String|HTMLElement} tableSelector - CSS selector or table element
 * @param {String} filename - Name of the file to download (without extension)
 */
window.exportTableToXLSX = function(tableSelector, filename = 'table_export') {
    const table = typeof tableSelector === 'string' 
        ? document.querySelector(tableSelector) 
        : tableSelector;
    
    if (!table) {
        if (window.showToast) {
            window.showToast('Table not found', 'error');
        } else {
            alert('Table not found');
        }
        return;
    }
    
    try {
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert table to worksheet
        const ws = XLSX.utils.table_to_sheet(table);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const fullFilename = `${filename}_${timestamp}.xlsx`;
        
        // Write file and trigger download
        XLSX.writeFile(wb, fullFilename);
        
        if (window.showToast) {
            window.showToast(`Table exported to ${fullFilename}`, 'success');
        }
    } catch (error) {
        console.error('Error exporting table to XLSX:', error);
        if (window.showToast) {
            window.showToast('Error exporting table to Excel', 'error');
        } else {
            alert('Error exporting table to Excel: ' + error.message);
        }
    }
};

/**
 * Export report data with summary information
 * @param {Object} reportData - Report data object with summary and items
 * @param {Array} columns - Column definitions
 * @param {String} filename - Filename
 * @param {Object} summary - Optional summary data to include
 */
window.exportReportToXLSX = function(reportData, columns, filename = 'report', summary = null) {
    if (!reportData || (!Array.isArray(reportData) && !reportData.items)) {
        if (window.showToast) {
            window.showToast('No data to export', 'warning');
        }
        return;
    }
    
    try {
        const wb = XLSX.utils.book_new();
        const data = Array.isArray(reportData) ? reportData : reportData.items || [];
        
        // Prepare worksheet data
        const worksheetData = [];
        
        // Add summary section if provided
        if (summary) {
            worksheetData.push(['Report Summary']);
            worksheetData.push([]);
            Object.keys(summary).forEach(key => {
                worksheetData.push([key, summary[key]]);
            });
            worksheetData.push([]);
            worksheetData.push(['Report Data']);
            worksheetData.push([]);
        }
        
        // Add headers
        const headers = columns.map(col => col.label || col.key);
        worksheetData.push(headers);
        
        // Add data rows
        data.forEach(item => {
            const row = columns.map(col => {
                let value = item[col.key];
                
                // Handle nested properties
                if (col.key.includes('.')) {
                    const keys = col.key.split('.');
                    value = keys.reduce((obj, key) => obj && obj[key], item);
                }
                
                // Format dates
                if (value && col.type === 'date') {
                    value = new Date(value).toLocaleDateString('en-US');
                }
                
                // Format currency
                if (col.type === 'currency') {
                    value = typeof value === 'number' ? `$${value.toLocaleString()}` : value;
                }
                
                // Format boolean status (isActive, etc.)
                if (col.type === 'status' || col.type === 'boolean') {
                    if (typeof value === 'boolean') {
                        value = value ? 'Active' : 'Not Active';
                    } else if (value === true || value === 'true' || value === 1 || value === '1') {
                        value = 'Active';
                    } else if (value === false || value === 'false' || value === 0 || value === '0') {
                        value = 'Not Active';
                    }
                }
                
                // Handle null/undefined
                if (value === null || value === undefined) {
                    value = '';
                }
                
                // Remove HTML tags
                if (typeof value === 'string' && value.includes('<')) {
                    const div = document.createElement('div');
                    div.innerHTML = value;
                    value = div.textContent || div.innerText || '';
                }
                
                return value;
            });
            worksheetData.push(row);
        });
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Set column widths
        const colWidths = columns.map((col, index) => {
            const maxLength = Math.max(
                (col.label || col.key).length,
                ...data.map(item => {
                    let value = item[col.key];
                    if (col.key.includes('.')) {
                        const keys = col.key.split('.');
                        value = keys.reduce((obj, key) => obj && obj[key], item);
                    }
                    return String(value || '').length;
                })
            );
            return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
        });
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        
        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const fullFilename = `${filename}_${timestamp}.xlsx`;
        
        // Write file
        XLSX.writeFile(wb, fullFilename);
        
        if (window.showToast) {
            window.showToast(`Report exported to ${fullFilename}`, 'success');
        }
    } catch (error) {
        console.error('Error exporting report:', error);
        if (window.showToast) {
            window.showToast('Error exporting report', 'error');
        }
    }
};

