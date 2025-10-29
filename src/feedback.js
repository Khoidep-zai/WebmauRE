document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackStatus = document.getElementById('feedbackStatus');
    const feedbackHistory = document.getElementById('feedbackHistory');

    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Cập nhật thông tin người dùng trong sidebar
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = currentUser.name || 'Sinh viên';
    
    // Hiển thị link admin nếu là admin
    const adminLink = document.getElementById('adminLink');
    if (adminLink && currentUser.isAdmin) {
        adminLink.style.display = 'block';
        adminLink.onclick = () => window.location.href = 'admin.html';
    }

    // Xử lý gửi phản ánh mới
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const feedback = {
            id: Date.now().toString(),
            userId: currentUser.mssv,
            userName: currentUser.name,
            room: currentUser.room || 'Chưa có phòng',
            issueType: document.getElementById('issueType').value,
            description: document.getElementById('description').value,
            priority: document.getElementById('priority').value,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updates: []
        };

        // Lưu phản ánh vào localStorage
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        feedbacks.push(feedback);
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        // Hiển thị thông báo thành công
        feedbackStatus.className = 'feedback-status success';
        feedbackStatus.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Phản ánh của bạn đã được gửi thành công!
        `;
        
        // Reset form và cập nhật lịch sử
        feedbackForm.reset();
        loadFeedbackHistory();

        // Xóa thông báo sau 3 giây
        setTimeout(() => {
            feedbackStatus.className = 'feedback-status';
            feedbackStatus.innerHTML = '';
        }, 3000);
    });

    // Hàm format thời gian
    function formatDateTime(iso) {
        try {
            return new Date(iso).toLocaleString('vi-VN');
        } catch(e) {
            return iso;
        }
    }

    // Hàm lấy class cho badge ưu tiên
    function getPriorityClass(priority) {
        switch(priority) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return '';
        }
    }

    // Hàm lấy tên tiếng Việt cho loại sự cố
    function getIssueTypeName(type) {
        const types = {
            water: 'Nước',
            electricity: 'Điện',
            facility: 'Cơ sở vật chất',
            other: 'Khác'
        };
        return types[type] || type;
    }

    // Hàm hiển thị lịch sử phản ánh
    function loadFeedbackHistory() {
        if (!feedbackHistory) return;

        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        const userFeedbacks = feedbacks.filter(f => f.userId === currentUser.mssv);

        if (userFeedbacks.length === 0) {
            feedbackHistory.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Bạn chưa có phản ánh nào.</p>
                </div>
            `;
            return;
        }

        feedbackHistory.innerHTML = '';
        userFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(feedback => {
                const card = document.createElement('div');
                card.className = 'feedback-history-item';
                card.innerHTML = `
                    <div class="feedback-header">
                        <div class="feedback-meta">
                            <span class="feedback-date">
                                <i class="fas fa-clock"></i>
                                ${formatDateTime(feedback.createdAt)}
                            </span>
                            <span class="priority-badge ${getPriorityClass(feedback.priority)}">
                                ${feedback.priority === 'high' ? 'Cao' : feedback.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </span>
                            <span class="status-badge ${feedback.status === 'resolved' ? 'status-completed' : 'status-pending'}">
                                ${feedback.status === 'resolved' ? 'Đã xử lý' : 'Đang chờ'}
                            </span>
                        </div>
                        <div class="feedback-title">
                            <strong>${getIssueTypeName(feedback.issueType)}</strong>
                        </div>
                    </div>
                    <div class="feedback-content">
                        ${feedback.description}
                    </div>
                    ${feedback.updates.length > 0 ? `
                        <div class="feedback-updates">
                            ${feedback.updates.map(update => `
                                <div class="feedback-update">
                                    <strong>${formatDateTime(update.time)}:</strong>
                                    ${update.message}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                `;
                feedbackHistory.appendChild(card);
            });
    }

    // Load feedback history on page load
    loadFeedbackHistory();
});