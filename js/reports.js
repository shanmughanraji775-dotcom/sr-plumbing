// Daily reports functionality

document.addEventListener('DOMContentLoaded', function() {
    // Set today's date by default
    const dateInput = document.getElementById('report-date');
    if (dateInput) {
        dateInput.value = Utils.getTodayDate();
    }
    loadDailyReport();
});

function setToday() {
    document.getElementById('report-date').value = Utils.getTodayDate();
    loadDailyReport();
}

function setYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    document.getElementById('report-date').value = yesterday.toISOString().split('T')[0];
    loadDailyReport();
}

function loadDailyReport() {
    const dateInput = document.getElementById('report-date');
    const date = dateInput ? dateInput.value : Utils.getTodayDate();
    
    if (!date) {
        return;
    }

    const report = Storage.getDailyReport(date);
    displayDailySummary(report);
    displayReportDetails(report);
}

function displayDailySummary(report) {
    const summaryContainer = document.getElementById('daily-summary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <h3>Total Invoices</h3>
                <p class="summary-value">${report.totalInvoices}</p>
            </div>
            <div class="summary-card">
                <h3>Total Amount</h3>
                <p class="summary-value">${Utils.formatCurrency(report.totalAmount)}</p>
            </div>
            <div class="summary-card">
                <h3>Date</h3>
                <p class="summary-value">${Utils.formatDate(report.date)}</p>
            </div>
        </div>
        <div class="payment-methods-breakdown">
            <h3>Payment Methods Breakdown</h3>
            ${Object.keys(report.paymentMethods).length > 0 ? 
                Object.entries(report.paymentMethods).map(([method, amount]) => `
                    <div class="payment-method-item">
                        <span class="method-name">${method}:</span>
                        <span class="method-amount">${Utils.formatCurrency(amount)}</span>
                    </div>
                `).join('') :
                '<p class="empty-message">No payment methods recorded for this date.</p>'
            }
        </div>
    `;
}

function displayReportDetails(report) {
    const detailsContainer = document.getElementById('report-details');
    if (!detailsContainer) return;

    if (report.invoices.length === 0) {
        detailsContainer.innerHTML = `
            <h2>Invoices for ${Utils.formatDate(report.date)}</h2>
            <p class="empty-message">No invoices found for this date.</p>
        `;
        return;
    }

    detailsContainer.innerHTML = `
        <h2>Invoices for ${Utils.formatDate(report.date)}</h2>
        <div class="invoices-table-container">
            <table class="reports-table">
                <thead>
                    <tr>
                        <th>Invoice No.</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.invoices.map(invoice => `
                        <tr>
                            <td>${invoice.id}</td>
                            <td>${Utils.formatDate(invoice.date)}</td>
                            <td>${invoice.items.length}</td>
                            <td>${Utils.formatCurrency(invoice.totalAmount)}</td>
                            <td>
                                <button class="btn btn-small" onclick="viewInvoiceReport('${invoice.id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function viewInvoiceReport(id) {
    const invoice = Storage.getInvoiceById(id);
    if (!invoice) {
        alert('Invoice not found.');
        return;
    }

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

function loadMonthlyReport() {
    const monthInput = document.getElementById('report-month');
    if (!monthInput || !monthInput.value) return;

    const [year, month] = monthInput.value.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const allInvoices = Storage.getInvoices();
    const monthlyInvoices = allInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    const totalAmount = monthlyInvoices.reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
    const totalPayments = Storage.getPayments().filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startDate && paymentDate <= endDate;
    });

    const paymentMethods = {};
    totalPayments.forEach(pay => {
        const method = pay.method || 'Unknown';
        paymentMethods[method] = (paymentMethods[method] || 0) + (parseFloat(pay.amount) || 0);
    });

    const monthlyContainer = document.getElementById('monthly-summary');
    if (monthlyContainer) {
        monthlyContainer.innerHTML = `
            <div class="summary-cards">
                <div class="summary-card">
                    <h3>Total Invoices</h3>
                    <p class="summary-value">${monthlyInvoices.length}</p>
                </div>
                <div class="summary-card">
                    <h3>Total Amount</h3>
                    <p class="summary-value">${Utils.formatCurrency(totalAmount)}</p>
                </div>
                <div class="summary-card">
                    <h3>Total Payments</h3>
                    <p class="summary-value">${totalPayments.length}</p>
                </div>
            </div>
            <div class="payment-methods-breakdown">
                <h3>Payment Methods Breakdown</h3>
                ${Object.keys(paymentMethods).length > 0 ? 
                    Object.entries(paymentMethods).map(([method, amount]) => `
                        <div class="payment-method-item">
                            <span class="method-name">${method}:</span>
                            <span class="method-amount">${Utils.formatCurrency(amount)}</span>
                        </div>
                    `).join('') :
                    '<p class="empty-message">No payment methods recorded for this month.</p>'
                }
            </div>
        `;
    }
}

function exportReport() {
    const dateInput = document.getElementById('report-date');
    const date = dateInput ? dateInput.value : Utils.getTodayDate();
    
    if (!date) {
        alert('Please select a date first.');
        return;
    }

    const report = Storage.getDailyReport(date);
    
    // Create CSV content
    let csv = `Daily Report - ${Utils.formatDate(date)}\n`;
    csv += `Date,${report.date}\n`;
    csv += `Total Invoices,${report.totalInvoices}\n`;
    csv += `Total Amount,${report.totalAmount}\n\n`;
    csv += `Invoice Number,Date,Items,Total Amount\n`;
    
    report.invoices.forEach(invoice => {
        csv += `${invoice.id},${invoice.date},${invoice.items.length},${invoice.totalAmount}\n`;
    });

    // Create and download file
    const dataBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-report-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Report exported successfully!');
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

