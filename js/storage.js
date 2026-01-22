// localStorage management for invoices, items, and payments

const Storage = {
    // Initialize storage with default structure
    init() {
        if (!localStorage.getItem('invoices')) {
            localStorage.setItem('invoices', JSON.stringify([]));
        }
        if (!localStorage.getItem('items')) {
            localStorage.setItem('items', JSON.stringify([]));
        }
        if (!localStorage.getItem('payments')) {
            localStorage.setItem('payments', JSON.stringify([]));
        }
    },

    // Invoice operations
    saveInvoice(invoice) {
        const invoices = this.getInvoices();
        invoice.id = invoice.id || Date.now().toString();
        invoice.createdAt = invoice.createdAt || new Date().toISOString();
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        return invoice.id;
    },

    getInvoices() {
        return JSON.parse(localStorage.getItem('invoices') || '[]');
    },

    getInvoiceById(id) {
        const invoices = this.getInvoices();
        return invoices.find(inv => inv.id === id);
    },

    getInvoicesByDate(date) {
        const invoices = this.getInvoices();
        const targetDate = new Date(date).toDateString();
        return invoices.filter(inv => {
            const invDate = new Date(inv.date).toDateString();
            return invDate === targetDate;
        });
    },

    updateInvoice(id, updatedInvoice) {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(inv => inv.id === id);
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...updatedInvoice };
            localStorage.setItem('invoices', JSON.stringify(invoices));
            return true;
        }
        return false;
    },

    deleteInvoice(id) {
        const invoices = this.getInvoices();
        const filtered = invoices.filter(inv => inv.id !== id);
        localStorage.setItem('invoices', JSON.stringify(filtered));
        return filtered.length < invoices.length;
    },

    // Item catalog operations
    saveItem(item) {
        const items = this.getItems();
        item.id = item.id || Date.now().toString();
        items.push(item);
        localStorage.setItem('items', JSON.stringify(items));
        return item.id;
    },

    getItems() {
        return JSON.parse(localStorage.getItem('items') || '[]');
    },

    getItemById(id) {
        const items = this.getItems();
        return items.find(item => item.id === id);
    },

    updateItem(id, updatedItem) {
        const items = this.getItems();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem };
            localStorage.setItem('items', JSON.stringify(items));
            return true;
        }
        return false;
    },

    deleteItem(id) {
        const items = this.getItems();
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem('items', JSON.stringify(filtered));
        return filtered.length < items.length;
    },

    // Payment operations
    savePayment(payment) {
        const payments = this.getPayments();
        payment.id = payment.id || Date.now().toString();
        payment.createdAt = payment.createdAt || new Date().toISOString();
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
        return payment.id;
    },

    getPayments() {
        return JSON.parse(localStorage.getItem('payments') || '[]');
    },

    getPaymentsByDate(date) {
        const payments = this.getPayments();
        const targetDate = new Date(date).toDateString();
        return payments.filter(pay => {
            const payDate = new Date(pay.date).toDateString();
            return payDate === targetDate;
        });
    },

    // Report calculations
    getDailyReport(date) {
        const invoices = this.getInvoicesByDate(date);
        const payments = this.getPaymentsByDate(date);
        
        const totalAmount = invoices.reduce((sum, inv) => {
            return sum + (parseFloat(inv.totalAmount) || 0);
        }, 0);

        const paymentMethods = {};
        payments.forEach(pay => {
            const method = pay.method || 'Unknown';
            paymentMethods[method] = (paymentMethods[method] || 0) + (parseFloat(pay.amount) || 0);
        });

        return {
            date: date,
            totalInvoices: invoices.length,
            totalAmount: totalAmount,
            invoices: invoices,
            payments: payments,
            paymentMethods: paymentMethods
        };
    },

    // Clear all data (for testing/reset)
    clearAll() {
        localStorage.removeItem('invoices');
        localStorage.removeItem('items');
        localStorage.removeItem('payments');
        this.init();
    }
};

// Initialize storage on load
Storage.init();

