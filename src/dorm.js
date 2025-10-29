// Global variables
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let roomData = JSON.parse(localStorage.getItem('roomData')) || null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserInfo();
    loadRoomData();
});

// Load user information
function loadUserInfo() {
    if (currentUser) {
        document.getElementById('userMssv').textContent = currentUser.mssv || '-';
        document.getElementById('userFullName').textContent = currentUser.name || '-';
        document.getElementById('userEmail').textContent = currentUser.email || '-';
        document.getElementById('userName').textContent = currentUser.name || 'Sinh viên';
        
        // Set avatar image
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = '../logo/cho.jpg';
        }
    }
}

// Load room data
function loadRoomData() {
    // If there's a global assignment created by admin, use it to populate local roomData
    try {
        const assignsRaw = localStorage.getItem('roomAssignments') || '[]';
        const assigns = JSON.parse(assignsRaw);
        if (currentUser && assigns && assigns.length) {
            const mine = assigns.find(a => a.email === currentUser.email);
            if (mine && !roomData) {
                // create a basic roomData record from assignment
                roomData = {
                    roomNumber: mine.roomNumber,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
                    months: 6,
                    status: 'active',
                    roommates: [mine.name || currentUser.name],
                    actionHistory: []
                };
                localStorage.setItem('roomData', JSON.stringify(roomData));
            }
        }
    } catch (e) {
        console.error('Không thể đọc roomAssignments', e);
    }

    if (!roomData) {
        // No room registered
        document.getElementById('noRoomInfo').style.display = 'block';
        document.getElementById('roomInfo').style.display = 'none';
        document.getElementById('renewReturnCard').style.display = 'none';
        document.getElementById('monitorContractCard').style.display = 'none';
        return;
    }
    
    // Has room registered
    document.getElementById('noRoomInfo').style.display = 'none';
    document.getElementById('roomInfo').style.display = 'block';
    document.getElementById('renewReturnCard').style.display = 'block';
    document.getElementById('monitorContractCard').style.display = 'block';
    
    // Display room information
    document.getElementById('roomNumber').textContent = roomData.roomNumber || '-';
    document.getElementById('roommates').textContent = roomData.roommates.join(', ') || '-';
    
    const roomStatus = document.getElementById('roomStatus');
    const statusText = roomData.status || 'active';
    roomStatus.textContent = getStatusText(statusText);
    roomStatus.className = 'status-badge ' + statusText;
    
    document.getElementById('contractStartDate').textContent = formatDate(roomData.startDate) || '-';
    document.getElementById('contractEndDate').textContent = formatDate(roomData.endDate) || '-';
    
    // Calculate days remaining
    const days = calculateDaysRemaining(roomData.endDate);
    const daysRemaining = document.getElementById('daysRemaining');
    if (days > 0) {
        daysRemaining.textContent = days + ' ngày';
        daysRemaining.style.color = '#28a745';
    } else {
        daysRemaining.textContent = 'Đã hết hạn';
        daysRemaining.style.color = '#e74c3c';
    }
    
    // Load action history
    if (roomData.actionHistory) {
        const lastAction = roomData.actionHistory[roomData.actionHistory.length - 1];
        if (lastAction) {
            document.getElementById('approvalStatus').textContent = getStatusText(lastAction.status);
            document.getElementById('approvalStatus').className = 'status-badge ' + lastAction.status;
        }
    }
}

// Calculate days remaining
function calculateDaysRemaining(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'active': 'Đang hoạt động',
        'pending': 'Chờ phê duyệt',
        'expired': 'Đã hết hạn',
        'approved': 'Đã phê duyệt',
        'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Show register modal
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.style.display = 'block';
    
    // Set today as minimum date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').setAttribute('min', today);
    
    // Set default start date to today
    if (!document.getElementById('startDate').value) {
        document.getElementById('startDate').value = today;
    }
}

// Close register modal
function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.style.display = 'none';
}

// Confirm register room
function confirmRegisterRoom() {
    const roomNumber = document.getElementById('selectRoom').value;
    const startDate = document.getElementById('startDate').value;
    const months = parseInt(document.getElementById('contractMonths').value);
    
    if (!roomNumber || !startDate) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    // Calculate end date
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    
    // Create room data
    const newRoomData = {
        roomNumber: roomNumber,
        startDate: startDate,
        endDate: end.toISOString().split('T')[0],
        months: months,
        status: 'active',
        roommates: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'],
        actionHistory: []
    };
    
    // Save to localStorage
    localStorage.setItem('roomData', JSON.stringify(newRoomData));
    roomData = newRoomData;
    
    // Reload page
    loadRoomData();
    closeRegisterModal();
    
    alert('Đăng ký phòng thành công!');
}

// Toggle reason field
function toggleReasonField() {
    const actionType = document.getElementById('actionType').value;
    const reasonGroup = document.getElementById('reasonGroup');
    const submitBtn = document.getElementById('submitActionBtn');
    const desiredGroup = document.getElementById('desiredRoomGroup');
    
    if (actionType) {
        reasonGroup.style.display = 'block';
        // if transfer, show desired room input
        if (actionType === 'transfer' && desiredGroup) desiredGroup.style.display = 'block';
        else if (desiredGroup) desiredGroup.style.display = 'none';
        submitBtn.disabled = false;
    } else {
        reasonGroup.style.display = 'none';
        if (desiredGroup) desiredGroup.style.display = 'none';
        submitBtn.disabled = true;
    }
}

// Submit action
function submitAction() {
    const actionType = document.getElementById('actionType').value;
    const reason = document.getElementById('reason').value.trim();
    const desiredRoomInput = document.getElementById('desiredRoom');
    const desiredRoom = desiredRoomInput ? desiredRoomInput.value.trim() : null;
    
    if (!reason) {
        alert('Vui lòng nhập lý do!');
        return;
    }
    if (actionType === 'transfer' && !desiredRoom) {
        alert('Vui lòng nhập mã phòng bạn muốn chuyển tới.');
        return;
    }
    
    // Create action record
    const action = {
        type: actionType,
        reason: reason,
        desiredRoom: desiredRoom || null,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    // Add to action history
    if (!roomData.actionHistory) {
        roomData.actionHistory = [];
    }
    roomData.actionHistory.push(action);
    
    // Save to localStorage
    localStorage.setItem('roomData', JSON.stringify(roomData));

    // Also create a serviceHistory entry so admin can review this request centrally
    try {
        const raw = localStorage.getItem('serviceHistory') || '[]';
        const serviceHistory = JSON.parse(raw);
        const serviceEntry = {
            id: Date.now(),
            service: 'room-action',
            serviceName: actionType === 'renew' ? 'Yêu cầu gia hạn phòng' : actionType === 'return' ? 'Yêu cầu trả phòng' : 'Yêu cầu phòng',
            type: actionType,
            description: reason,
            currentRoom: roomData ? roomData.roomNumber : null,
            desiredRoom: actionType === 'transfer' ? (desiredRoom || null) : null,
            status: 'pending',
            date: new Date().toISOString(),
            author: currentUser ? currentUser.name : 'Khách',
            authorEmail: currentUser ? currentUser.email : null
        };
        serviceHistory.unshift(serviceEntry);
        localStorage.setItem('serviceHistory', JSON.stringify(serviceHistory));
    } catch (e) {
        console.error('Không thể ghi yêu cầu phòng vào lịch sử dịch vụ', e);
    }
    
    // Show confirmation message
    const confirmationMessage = document.getElementById('confirmationMessage');
    const managerConfirmation = document.getElementById('managerConfirmation');
    
    if (actionType === 'renew') {
        managerConfirmation.textContent = 'Yêu cầu gia hạn của bạn đã được gửi. Vui lòng chờ quản lý phê duyệt.';
    } else if (actionType === 'return') {
        managerConfirmation.textContent = 'Yêu cầu trả phòng của bạn đã được gửi. Vui lòng chờ quản lý phê duyệt.';
    }
    
    confirmationMessage.style.display = 'block';
    confirmationMessage.className = 'alert alert-info';
    
    // Update approval status
    document.getElementById('approvalStatus').textContent = getStatusText('pending');
    document.getElementById('approvalStatus').className = 'status-badge pending';
    
    // Reset form
    document.getElementById('actionType').value = '';
    document.getElementById('reason').value = '';
    const desiredRoomInput2 = document.getElementById('desiredRoom');
    if (desiredRoomInput2) desiredRoomInput2.value = '';
    toggleReasonField();
}

// Download contract
function downloadContract() {
    if (!roomData) return;
    
    // Create a simple PDF-like content (in real app, this would generate actual PDF)
    const contractData = `
HỢP ĐỒNG Ở KÝ TÚC XÁ

Thông tin sinh viên:
- MSSV: ${currentUser.mssv}
- Họ và tên: ${currentUser.name}
- Phòng: ${roomData.roomNumber}
- Ngày bắt đầu: ${formatDate(roomData.startDate)}
- Ngày kết thúc: ${formatDate(roomData.endDate)}
- Thời hạn: ${roomData.months} tháng

© Van Lang University ${new Date().getFullYear()}
    `;
    
    // Create download link
    const blob = new Blob([contractData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hop-dong-ktx-' + roomData.roomNumber + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Đã tải hợp đồng thành công!');
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

