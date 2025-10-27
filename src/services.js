// Global variables
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let selectedService = null;
let serviceHistory = JSON.parse(localStorage.getItem('serviceHistory')) || [];
let services = {
    'giặt-ủi': { name: 'Giặt ủi', price: 30000 },
    'sửa-chữa': { name: 'Sửa chữa', price: 50000 },
    'đặt-phòng-khách': { name: 'Đặt phòng khách', price: 100000 },
    'gửi-giữ-xe': { name: 'Gửi giữ xe', price: 0 },
    'internet': { name: 'Internet WiFi', price: 100000 },
    'vệ-sinh': { name: 'Vệ sinh phòng', price: 40000 }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserInfo();
    loadHistory();
    setupFormHandlers();
});

// Load user information
function loadUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || 'Sinh viên';
        
        // Set avatar image
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = '../logo/cho.jpg';
        }
    }
}

// Select service
function selectService(serviceKey) {
    selectedService = serviceKey;
    
    // Update UI
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    // Show request form
    const requestFormCard = document.getElementById('requestFormCard');
    requestFormCard.style.display = 'block';
    requestFormCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Update form
    const serviceData = services[serviceKey];
    document.getElementById('selectedServiceName').textContent = serviceData.name;
    document.getElementById('servicePrice').textContent = formatPrice(serviceData.price);
    updateTotalPrice();
    
    // Set default address if user has room
    const roomData = JSON.parse(localStorage.getItem('roomData'));
    if (roomData && roomData.roomNumber) {
        document.getElementById('serviceAddress').value = `Phòng ${roomData.roomNumber}`;
    }
    
    // Set default time to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const tomorrowStr = tomorrow.toISOString().slice(0, 16);
    document.getElementById('desiredTime').value = tomorrowStr;
}

// Update total price
function updateTotalPrice() {
    if (!selectedService) return;
    
    const serviceData = services[selectedService];
    const servicePrice = serviceData.price;
    const fee = 5000;
    const total = servicePrice + fee;
    
    document.getElementById('totalPrice').textContent = formatPrice(total);
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(price);
}

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('serviceRequestForm');
    form.addEventListener('input', function() {
        // Can add form validation here
    });
}

// Show payment options
function showPaymentOptions() {
    if (!selectedService) {
        alert('Vui lòng chọn dịch vụ!');
        return;
    }
    
    const description = document.getElementById('description').value.trim();
    if (!description) {
        alert('Vui lòng nhập mô tả chi tiết!');
        return;
    }
    
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'block';
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'none';
    
    // Reset payment confirmation
    const confirmation = document.getElementById('paymentConfirmation');
    confirmation.style.display = 'none';
    
    // Reset selected payment method
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('selected');
    });
}

// Select payment method
function selectPaymentMethod(method) {
    // Remove selected class from all
    document.querySelectorAll('.payment-method').forEach(m => {
        m.classList.remove('selected');
    });
    
    // Add to clicked
    event.currentTarget.classList.add('selected');
    
    // Proceed with payment
    setTimeout(() => {
        processPayment(method);
    }, 500);
}

// Process payment
function processPayment(method) {
    const serviceData = services[selectedService];
    const description = document.getElementById('description').value;
    const desiredTime = document.getElementById('desiredTime').value;
    const serviceAddress = document.getElementById('serviceAddress').value;
    
    // Create service request
    const request = {
        id: Date.now(),
        service: selectedService,
        serviceName: serviceData.name,
        description: description,
        desiredTime: desiredTime,
        address: serviceAddress,
        price: serviceData.price + 5000,
        paymentMethod: method,
        status: 'pending',
        date: new Date().toISOString(),
        rating: null,
        completed: false
    };
    
    // Add to history
    serviceHistory.unshift(request);
    localStorage.setItem('serviceHistory', JSON.stringify(serviceHistory));
    
    // Show confirmation
    const confirmation = document.getElementById('paymentConfirmation');
    confirmation.style.display = 'block';
    
    // Reload history
    setTimeout(() => {
        loadHistory();
        resetForm();
    }, 1000);
}

// Reset form
function resetForm() {
    document.getElementById('serviceRequestForm').reset();
    selectedService = null;
    
    // Reset service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Hide form
    document.getElementById('requestFormCard').style.display = 'none';
}

// Load history
function loadHistory() {
    const historyList = document.getElementById('historyList');
    
    if (serviceHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>Chưa có lịch sử dịch vụ</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    
    serviceHistory.forEach(request => {
        const historyItem = createHistoryItem(request);
        historyList.appendChild(historyItem);
    });
}

// Create history item
function createHistoryItem(request) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const statusText = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    
    div.innerHTML = `
        <div class="history-header">
            <div>
                <div class="history-title">${request.serviceName}</div>
                <div class="history-date">
                    <i class="far fa-calendar"></i>
                    ${formatDate(request.date)}
                </div>
            </div>
            <span class="status-badge ${request.status}">${statusText[request.status]}</span>
        </div>
        
        <div class="history-details">
            <div><strong>Mô tả:</strong> ${request.description}</div>
            <div><strong>Thời gian:</strong> ${formatDateTime(request.desiredTime)}</div>
            <div><strong>Địa điểm:</strong> ${request.address}</div>
            <div><strong>Giá:</strong> ${formatPrice(request.price)}</div>
            <div><strong>Thanh toán:</strong> ${getPaymentMethodText(request.paymentMethod)}</div>
        </div>
        
        ${request.status === 'completed' && !request.rating ? `
            <div class="history-actions">
                <span>Đánh giá dịch vụ:</span>
                <div class="rating-stars">
                    ${[1, 2, 3, 4, 5].map(i => 
                        `<i class="far fa-star star" onclick="rateService(${request.id}, ${i})"></i>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
        
        ${request.rating ? `
            <div class="history-actions">
                <span>Đánh giá: ${request.rating}/5</span>
            </div>
        ` : ''}
    `;
    
    return div;
}

// Rate service
function rateService(requestId, rating) {
    // Update rating in history
    const request = serviceHistory.find(r => r.id === requestId);
    if (request) {
        request.rating = rating;
        request.completed = true;
        localStorage.setItem('serviceHistory', JSON.stringify(serviceHistory));
        loadHistory();
        
        alert(`Cảm ơn bạn đã đánh giá ${rating} sao!`);
    }
}

// Get payment method text
function getPaymentMethodText(method) {
    const methods = {
        'wallet': 'Ví điện tử',
        'card': 'Thẻ tín dụng',
        'transfer': 'Chuyển khoản'
    };
    return methods[method] || method;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

// Logout
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        if (currentUser) {
            currentUser.loggedIn = false;
            localStorage.setItem('user', JSON.stringify(currentUser));
        }
        window.location.href = 'login.html';
    }
}

