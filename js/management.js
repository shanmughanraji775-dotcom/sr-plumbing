// Management page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeManagement();
    loadInvoices();
    loadCatalogItems();
});

const PAYMENT_PASSWORD_KEY = 'payment_password';
const DEFAULT_PAYMENT_PASSWORD = 'admin123';

function initializeManagement() {
    // Set today's date for card payment
    const cardDateInput = document.getElementById('card-date');
    if (cardDateInput) {
        cardDateInput.value = Utils.getTodayDate();
    }

    // Card payment form handler
    const cardPaymentForm = document.getElementById('card-payment-form');
    if (cardPaymentForm) {
        cardPaymentForm.addEventListener('submit', handleCardPayment);
    }

    // Password change form handler
    const passwordChangeForm = document.getElementById('password-change-form');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', handlePasswordChange);
    }
}

function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    const storedPassword = localStorage.getItem(PAYMENT_PASSWORD_KEY) || DEFAULT_PAYMENT_PASSWORD;
    
    // Verify current password
    if (currentPassword !== storedPassword) {
        alert('Current password is incorrect.');
        return;
    }
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }
    
    // Check minimum length
    if (newPassword.length < 4) {
        alert('Password must be at least 4 characters long.');
        return;
    }
    
    // Update password
    localStorage.setItem(PAYMENT_PASSWORD_KEY, newPassword);
    
    // Clear form
    e.target.reset();
    
    showNotification('Password changed successfully!');
}

function handleCardPayment(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('card-amount').value);
    const date = document.getElementById('card-date').value;
    const status = document.getElementById('card-status').value;
    const notes = document.getElementById('card-notes').value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    const payment = {
        method: 'CARD',
        amount: amount,
        status: status,
        date: date,
        notes: notes,
        createdAt: new Date().toISOString()
    };

    Storage.savePayment(payment);
    showNotification(`Card payment of ${Utils.formatCurrency(amount)} recorded successfully!`);
    
    // Reset form
    e.target.reset();
    document.getElementById('card-date').value = Utils.getTodayDate();
}

function loadInvoices() {
    const invoicesList = document.getElementById('invoices-list');
    if (!invoicesList) return;

    const invoices = Storage.getInvoices();
    const sortedInvoices = invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sortedInvoices.length === 0) {
        invoicesList.innerHTML = '<p class="empty-message">No invoices found.</p>';
        return;
    }

    invoicesList.innerHTML = sortedInvoices.map(invoice => {
        return `
            <div class="invoice-card">
                <div class="invoice-card-header">
                    <h3>Invoice: ${invoice.id}</h3>
                    <div class="invoice-actions">
                        <button class="btn btn-small" onclick="viewInvoice('${invoice.id}')">View</button>
                        <button class="btn btn-small btn-secondary" onclick="editInvoice('${invoice.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteInvoice('${invoice.id}')">Delete</button>
                    </div>
                </div>
                <div class="invoice-card-body">
                    <p><strong>Date:</strong> ${Utils.formatDate(invoice.date)}</p>
                    <p><strong>Items:</strong> ${invoice.items.length}</p>
                    <p><strong>Total Amount:</strong> ${Utils.formatCurrency(invoice.totalAmount)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function filterInvoices() {
    const dateInput = document.getElementById('filter-date');
    if (!dateInput || !dateInput.value) {
        loadInvoices();
        return;
    }

    const invoices = Storage.getInvoicesByDate(dateInput.value);
    const invoicesList = document.getElementById('invoices-list');
    
    if (invoices.length === 0) {
        invoicesList.innerHTML = '<p class="empty-message">No invoices found for selected date.</p>';
        return;
    }

    invoicesList.innerHTML = invoices.map(invoice => {
        return `
            <div class="invoice-card">
                <div class="invoice-card-header">
                    <h3>Invoice: ${invoice.id}</h3>
                    <div class="invoice-actions">
                        <button class="btn btn-small" onclick="viewInvoice('${invoice.id}')">View</button>
                        <button class="btn btn-small btn-secondary" onclick="editInvoice('${invoice.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteInvoice('${invoice.id}')">Delete</button>
                    </div>
                </div>
                <div class="invoice-card-body">
                    <p><strong>Date:</strong> ${Utils.formatDate(invoice.date)}</p>
                    <p><strong>Items:</strong> ${invoice.items.length}</p>
                    <p><strong>Total Amount:</strong> ${Utils.formatCurrency(invoice.totalAmount)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function clearFilter() {
    document.getElementById('filter-date').value = '';
    loadInvoices();
}

function viewInvoice(id) {
    const invoice = Storage.getInvoiceById(id);
    if (!invoice) {
        alert('Invoice not found.');
        return;
    }

    // Open invoice in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice - ${invoice.id}</title>
                <link rel="stylesheet" href="css/styles.css">
                <style>
                    body { margin: 0; padding: 20px; }
                    .invoice { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>
                ${generateInvoiceHTML(invoice)}
            </body>
        </html>
    `);
    printWindow.document.close();
}

function editInvoice(id) {
    // Redirect to billing page with invoice ID (can be enhanced to edit directly)
    if (confirm('Edit invoice? You will be redirected to the billing page.')) {
        window.location.href = `billing.html?invoice=${id}`;
    }
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
        if (Storage.deleteInvoice(id)) {
            showNotification('Invoice deleted successfully.');
            loadInvoices();
        } else {
            alert('Failed to delete invoice.');
        }
    }
}

function generateInvoiceHTML(invoice) {
    return `
        <div class="invoice" id="invoice-print">
            <div class="invoice-header">
                <img src="assets/logo.jpg" alt="SR Plumbing & Electrical Service" class="invoice-logo">
                <div class="invoice-company">
                    <h2>SR Plumbing & Electrical Service</h2>
                    <p>Sivan Kovil Street, Choolaimedu, Chennai-94</p>
                    <p>Phone: 9094599014</p>
                </div>
            </div>
            <div class="invoice-info">
                <p><strong>Invoice Number:</strong> ${invoice.id}</p>
                <p><strong>Date:</strong> ${Utils.formatDate(invoice.date)}</p>
            </div>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Sl. No.</th>
                        <th>Item Name with Size (inch, mm)</th>
                        <th>Rate</th>
                        <th>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                ${item.name}<br>
                                <small>Size: ${item.sizeInch || 'N/A'}" (${item.sizeMm || 'N/A'} mm)</small>
                            </td>
                            <td>${Utils.formatCurrency(item.rate)}</td>
                            <td>${Utils.formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>Grand Total</strong></td>
                        <td><strong>${Utils.formatCurrency(invoice.totalAmount)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            <div class="invoice-footer">
                <p class="slogan">Best work in affordable price</p>
            </div>
        </div>
    `;
}

function loadCatalogItems() {
    const catalogContainer = document.getElementById('catalog-items');
    if (!catalogContainer) return;

    const items = Storage.getItems();
    
    if (items.length === 0) {
        catalogContainer.innerHTML = '<p class="empty-message">No items in catalog.</p>';
        return;
    }

    catalogContainer.innerHTML = items.map(item => {
        return `
            <div class="catalog-item-card">
                <div class="catalog-item-photo">
                    ${item.photo ? `<img src="${item.photo}" alt="${item.name}">` : '<div class="no-photo">No Photo</div>'}
                </div>
                <div class="catalog-item-details">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.sizeInch || 'N/A'}" (${item.sizeMm || 'N/A'} mm)</p>
                    <p>Code: ${item.itemCode || 'N/A'}</p>
                    <p>Rate: ${Utils.formatCurrency(item.rate)}</p>
                    <div class="catalog-item-actions">
                        <button class="btn btn-small btn-danger" onclick="deleteCatalogItem('${item.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function deleteCatalogItem(id) {
    if (confirm('Are you sure you want to delete this item from catalog?')) {
        if (Storage.deleteItem(id)) {
            showNotification('Item deleted successfully.');
            loadCatalogItems();
        } else {
            alert('Failed to delete item.');
        }
    }
}

function exportItems() {
    const items = Storage.getItems();
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `items-catalog-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Items exported successfully!');
}

function importItems() {
    document.getElementById('import-file').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const items = JSON.parse(e.target.result);
            if (!Array.isArray(items)) {
                throw new Error('Invalid file format');
            }

            items.forEach(item => {
                // Generate new ID to avoid conflicts
                item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                Storage.saveItem(item);
            });

            showNotification(`${items.length} items imported successfully!`);
            loadCatalogItems();
        } catch (error) {
            alert('Error importing items: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

