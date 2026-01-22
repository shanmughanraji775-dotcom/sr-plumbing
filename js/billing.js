// Billing and invoice logic

let cart = [];
let currentInvoice = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeBilling();
    loadItems();
    loadCart();
});

function initializeBilling() {
    // Set today's date
    const dateInput = document.getElementById('invoice-date');
    if (dateInput) {
        dateInput.value = Utils.getTodayDate();
    }

    // Event listeners
    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleAddItem);
    }

    const generateInvoiceBtn = document.getElementById('generate-invoice');
    if (generateInvoiceBtn) {
        generateInvoiceBtn.addEventListener('click', generateInvoice);
    }

    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    const printInvoiceBtn = document.getElementById('print-invoice');
    if (printInvoiceBtn) {
        printInvoiceBtn.addEventListener('click', printInvoice);
    }

    const saveInvoiceBtn = document.getElementById('save-invoice');
    if (saveInvoiceBtn) {
        saveInvoiceBtn.addEventListener('click', saveInvoice);
    }
}

function handleAddItem(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const item = {
        name: formData.get('item-name'),
        sizeInch: formData.get('size-inch'),
        sizeMm: formData.get('size-mm'),
        itemCode: formData.get('item-code'),
        rate: parseFloat(formData.get('rate')) || 0,
        photo: null
    };

    // Handle photo upload
    const photoFile = formData.get('item-photo');
    if (photoFile && photoFile.size > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            item.photo = e.target.result;
            addItemToCatalog(item);
        };
        reader.readAsDataURL(photoFile);
    } else {
        addItemToCatalog(item);
    }

    e.target.reset();
}

function addItemToCatalog(item) {
    item.id = Date.now().toString();
    Storage.saveItem(item);
    displayItems();
    showNotification('Item added to catalog!');
}

function loadItems() {
    displayItems();
}

function displayItems() {
    const itemsContainer = document.getElementById('items-container');
    if (!itemsContainer) return;

    const items = Storage.getItems();
    itemsContainer.innerHTML = '';

    if (items.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-message">No items in catalog. Add items using the form above.</p>';
        return;
    }

    items.forEach(item => {
        const itemCard = createItemCard(item);
        itemsContainer.appendChild(itemCard);
    });
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-photo">
            ${item.photo ? `<img src="${item.photo}" alt="${item.name}">` : '<div class="no-photo">No Photo</div>'}
        </div>
        <div class="item-details">
            <h3>${item.name}</h3>
            <p class="item-size">Size: ${item.sizeInch || 'N/A'}" (${item.sizeMm || 'N/A'} mm)</p>
            <p class="item-code">Code: ${item.itemCode || 'N/A'}</p>
            <p class="item-rate">Rate: ${Utils.formatCurrency(item.rate)}</p>
            <div class="item-actions">
                <button class="btn btn-small" onclick="addToCart('${item.id}')">Add to Cart</button>
                <button class="btn btn-small btn-danger" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        </div>
    `;
    return card;
}

function addToCart(itemId) {
    const item = Storage.getItemById(itemId);
    if (!item) return;

    const cartItem = {
        ...item,
        quantity: 1,
        total: item.rate
    };

    cart.push(cartItem);
    updateCart();
    showNotification('Item added to cart!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    showNotification('Item removed from cart');
}

function updateQuantity(index, change) {
    cart[index].quantity = Math.max(1, cart[index].quantity + change);
    cart[index].total = cart[index].quantity * cart[index].rate;
    updateCart();
}

function updateItemPrice(index, newPrice) {
    cart[index].rate = parseFloat(newPrice) || 0;
    cart[index].total = cart[index].quantity * cart[index].rate;
    updateCart();
}

function updateCart() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-message">Cart is empty. Add items from the catalog.</p>';
        if (cartSummary) {
            cartSummary.innerHTML = '<p>Total: ₹0.00</p>';
        }
        return;
    }

    let totalAmount = 0;

    cart.forEach((item, index) => {
        totalAmount += item.total;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-photo">
                ${item.photo ? `<img src="${item.photo}" alt="${item.name}">` : '<div class="no-photo">No Photo</div>'}
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Size: ${item.sizeInch || 'N/A'}" (${item.sizeMm || 'N/A'} mm)</p>
                <p>Code: ${item.itemCode || 'N/A'}</p>
                <div class="cart-item-controls">
                    <label>Rate: ₹</label>
                    <input type="number" value="${item.rate}" step="0.01" min="0" 
                           onchange="updateItemPrice(${index}, this.value)" class="price-input">
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${index}, -1)">-</button>
                        <span>Qty: ${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <p class="item-total">Total: ${Utils.formatCurrency(item.total)}</p>
                    <button class="btn btn-small btn-danger" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    if (cartSummary) {
        cartSummary.innerHTML = `
            <h3>Cart Summary</h3>
            <p><strong>Total Items:</strong> ${cart.length}</p>
            <p><strong>Total Amount:</strong> ${Utils.formatCurrency(totalAmount)}</p>
        `;
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        updateCart();
        showNotification('Cart cleared');
    }
}

function generateInvoice() {
    if (cart.length === 0) {
        alert('Cart is empty. Add items to generate invoice.');
        return;
    }

    const dateInput = document.getElementById('invoice-date');
    const invoiceDate = dateInput ? dateInput.value : Utils.getTodayDate();

    currentInvoice = {
        id: Utils.generateInvoiceNumber(),
        date: invoiceDate,
        items: cart.map(item => ({ ...item })),
        totalAmount: cart.reduce((sum, item) => sum + item.total, 0),
        createdAt: new Date().toISOString()
    };

    displayInvoice(currentInvoice);
    showNotification('Invoice generated!');
}

function displayInvoice(invoice) {
    const invoiceSection = document.getElementById('invoice-section');
    const invoiceContainer = document.getElementById('invoice-container');
    if (!invoiceContainer) return;

    if (invoiceSection) {
        invoiceSection.style.display = 'block';
    }

    invoiceContainer.innerHTML = `
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
        <div class="invoice-actions">
            <button id="print-invoice" class="btn btn-primary">Print Invoice</button>
            <button id="save-invoice" class="btn btn-secondary">Save Invoice</button>
        </div>
    `;

    // Re-attach event listeners
    document.getElementById('print-invoice').addEventListener('click', printInvoice);
    document.getElementById('save-invoice').addEventListener('click', saveInvoice);
}

function printInvoice() {
    const invoiceElement = document.getElementById('invoice-print');
    if (!invoiceElement) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice - ${currentInvoice.id}</title>
                <link rel="stylesheet" href="css/styles.css">
                <style>
                    body { margin: 0; padding: 20px; }
                    .invoice { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>
                ${invoiceElement.outerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function saveInvoice() {
    if (!currentInvoice) {
        alert('No invoice to save. Generate an invoice first.');
        return;
    }

    Storage.saveInvoice(currentInvoice);
    showNotification('Invoice saved successfully!');
    
    // Clear cart after saving
    cart = [];
    updateCart();
    currentInvoice = null;
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item from catalog?')) {
        Storage.deleteItem(itemId);
        displayItems();
        showNotification('Item deleted');
    }
}

function loadCart() {
    updateCart();
}

function showNotification(message) {
    // Simple notification - can be enhanced with a toast library
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

