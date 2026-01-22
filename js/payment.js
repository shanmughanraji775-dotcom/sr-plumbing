// Payment processing

// Security: Default password (can be changed in management)
const DEFAULT_PAYMENT_PASSWORD = 'admin123';
const PAYMENT_PASSWORD_KEY = 'payment_password';

document.addEventListener('DOMContentLoaded', function() {
    loadRecentPayments();
    initializePaymentSecurity();
});

function initializePaymentSecurity() {
    // Set default password if not exists
    if (!localStorage.getItem(PAYMENT_PASSWORD_KEY)) {
        localStorage.setItem(PAYMENT_PASSWORD_KEY, DEFAULT_PAYMENT_PASSWORD);
    }
    
    // Check if already unlocked in this session
    const isUnlocked = sessionStorage.getItem('payment_unlocked') === 'true';
    if (isUnlocked) {
        showPaymentDetails();
    } else {
        hidePaymentDetails();
    }
}

function unlockPaymentDetails() {
    const passwordInput = document.getElementById('payment-password');
    const enteredPassword = passwordInput.value;
    const correctPassword = localStorage.getItem(PAYMENT_PASSWORD_KEY) || DEFAULT_PAYMENT_PASSWORD;
    
    if (enteredPassword === correctPassword) {
        showPaymentDetails();
        sessionStorage.setItem('payment_unlocked', 'true');
        passwordInput.value = '';
        showNotification('Payment details unlocked successfully!');
    } else {
        passwordInput.value = '';
        showNotification('Incorrect password. Access denied.', 'error');
        // Shake animation
        const securityDiv = document.getElementById('payment-security');
        securityDiv.classList.add('shake');
        setTimeout(() => securityDiv.classList.remove('shake'), 500);
    }
}

function lockPaymentDetails() {
    hidePaymentDetails();
    sessionStorage.removeItem('payment_unlocked');
    showNotification('Payment details locked for security.');
}

function showPaymentDetails() {
    const securityDiv = document.getElementById('payment-security');
    const detailsDiv = document.getElementById('payment-details-content');
    
    if (securityDiv) securityDiv.style.display = 'none';
    if (detailsDiv) detailsDiv.style.display = 'block';
}

function hidePaymentDetails() {
    const securityDiv = document.getElementById('payment-security');
    const detailsDiv = document.getElementById('payment-details-content');
    
    if (securityDiv) securityDiv.style.display = 'block';
    if (detailsDiv) detailsDiv.style.display = 'none';
}

// Allow Enter key to unlock
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('payment-password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                unlockPaymentDetails();
            }
        });
    }
});

function selectPaymentMethod(method) {
    // Update button states
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');

    // Show/hide payment sections
    document.querySelectorAll('.payment-details').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${method}-payment`).classList.add('active');
}

function copyUPI() {
    const upiId = 'shanmughanraji775@okaxis';
    navigator.clipboard.writeText(upiId).then(() => {
        showNotification('UPI ID copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = upiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('UPI ID copied to clipboard!');
    });
}

function processPayment(method) {
    const amountInput = method === 'upi' ? 
        document.getElementById('payment-amount') : 
        document.getElementById('card-payment-amount');
    const statusInput = method === 'upi' ? 
        document.getElementById('payment-status') : 
        document.getElementById('card-payment-status');

    const amount = parseFloat(amountInput.value);
    const status = statusInput.value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    const payment = {
        method: method.toUpperCase(),
        amount: amount,
        status: status,
        date: new Date().toISOString(),
        upiId: method === 'upi' ? 'shanmughanraji775@okaxis' : null
    };

    Storage.savePayment(payment);
    showNotification(`Payment of ${Utils.formatCurrency(amount)} recorded successfully!`);
    
    // Reset form
    amountInput.value = '';
    statusInput.value = 'pending';
    
    // Reload payments list
    loadRecentPayments();
}

function loadRecentPayments() {
    const paymentsList = document.getElementById('payments-list');
    if (!paymentsList) return;

    const payments = Storage.getPayments();
    const recentPayments = payments.slice(-10).reverse(); // Last 10 payments, most recent first

    if (recentPayments.length === 0) {
        paymentsList.innerHTML = '<p class="empty-message">No payments recorded yet.</p>';
        return;
    }

    paymentsList.innerHTML = recentPayments.map(payment => {
        const date = new Date(payment.date);
        return `
            <div class="payment-item">
                <div class="payment-info">
                    <h4>${payment.method} Payment</h4>
                    <p><strong>Amount:</strong> ${Utils.formatCurrency(payment.amount)}</p>
                    <p><strong>Date:</strong> ${Utils.formatDate(payment.date)}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${payment.status}">${payment.status}</span></p>
                    ${payment.upiId ? `<p><strong>UPI ID:</strong> ${payment.upiId}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
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

