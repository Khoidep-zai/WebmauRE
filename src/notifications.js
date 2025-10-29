// notifications.js
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || null;
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('notificationsContainer');
    const markAllBtn = document.getElementById('markAllRead');
    const clearAllBtn = document.getElementById('clearAll');
    const composeBtn = document.getElementById('composeBtn');
    const composeModal = document.getElementById('composeModal');
    const closeCompose = document.getElementById('closeCompose');
    const sendCompose = document.getElementById('sendCompose');

    function loadNotifications() {
        const raw = localStorage.getItem('notifications') || '[]';
        let list = [];
        try { list = JSON.parse(raw); } catch(e) { list = []; }

        // show notifications addressed to this user or broadcasts (recipientEmail === null)
        const visible = list.filter(n => !n.recipientEmail || n.recipientEmail === currentUser.email);
        if (visible.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>Không có thông báo.</p></div>`;
            return;
        }

        container.innerHTML = '';
        visible.forEach(n => {
            const item = document.createElement('div');
            item.className = 'notification-item ' + (n.read ? '' : 'unread');
            item.innerHTML = `
                <div class="notification-body">
                    <div><strong>${escapeHtml(n.message)}</strong></div>
                    <div class="notification-time">${formatDateTime(n.time)}</div>
                </div>
            `;

            const actions = document.createElement('div');
            actions.className = 'notif-actions';

            const btnRead = document.createElement('button');
            btnRead.className = 'btn';
            btnRead.textContent = n.read ? 'Đã đọc' : 'Đánh dấu đã đọc';
            btnRead.onclick = () => markAsRead(n.id);

            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn btn-danger';
            btnDelete.textContent = 'Xóa';
            btnDelete.onclick = () => deleteNotification(n.id);

            const btnReply = document.createElement('button');
            btnReply.className = 'btn';
            btnReply.textContent = 'Phản hồi';
            btnReply.onclick = () => openComposeWith(n);

            actions.appendChild(btnRead);
            actions.appendChild(btnReply);
            actions.appendChild(btnDelete);

            item.appendChild(actions);
            container.appendChild(item);
        });
    }

    function markAsRead(id) {
        const raw = localStorage.getItem('notifications') || '[]';
        let list = [];
        try { list = JSON.parse(raw); } catch(e) { list = []; }
        const idx = list.findIndex(n => n.id === id || String(n.id) === String(id));
        if (idx !== -1) {
            list[idx].read = true;
            localStorage.setItem('notifications', JSON.stringify(list));
            loadNotifications();
        }
    }

    function deleteNotification(id) {
        const raw = localStorage.getItem('notifications') || '[]';
        let list = [];
        try { list = JSON.parse(raw); } catch(e) { list = []; }
        list = list.filter(n => !(n.id === id || String(n.id) === String(id)));
        localStorage.setItem('notifications', JSON.stringify(list));
        loadNotifications();
    }

    function markAllRead() {
        const raw = localStorage.getItem('notifications') || '[]';
        let list = [];
        try { list = JSON.parse(raw); } catch(e) { list = []; }
        list = list.map(n => {
            if (!n.recipientEmail || n.recipientEmail === currentUser.email) n.read = true;
            return n;
        });
        localStorage.setItem('notifications', JSON.stringify(list));
        loadNotifications();
    }

    function clearAll() {
        const raw = localStorage.getItem('notifications') || '[]';
        let list = [];
        try { list = JSON.parse(raw); } catch(e) { list = []; }
        // keep only notifications not for this user
        list = list.filter(n => n.recipientEmail && n.recipientEmail !== currentUser.email);
        localStorage.setItem('notifications', JSON.stringify(list));
        loadNotifications();
    }

    function openComposeWith(notification) {
        // open compose modal and prefill with reference
        composeModal.style.display = 'block';
        const text = document.getElementById('composeText');
        text.value = `Trả lời thông báo: "${notification.message}"\n`;
    }

    function openCompose() {
        composeModal.style.display = 'block';
        document.getElementById('composeText').value = '';
    }

    function sendCompose() {
        const text = document.getElementById('composeText').value.trim();
        if (!text) { alert('Nhập nội dung phản hồi'); return; }
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Khách', email: null };
        const item = { id: Date.now(), from: currentUser.email, fromName: currentUser.name, to: 'admin@vlu.edu.vn', message: text, time: new Date().toISOString() };
        feedbacks.unshift(item);
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        // also notify admin (simple notification)
        const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifs.unshift({ id: Date.now()+1, recipientEmail: 'admin@vlu.edu.vn', message: `Phản hồi từ ${currentUser.name}: ${text}`, time: new Date().toISOString(), read: false });
        localStorage.setItem('notifications', JSON.stringify(notifs));

        composeModal.style.display = 'none';
        alert('Đã gửi phản hồi.');
    }

    markAllBtn.addEventListener('click', markAllRead);
    clearAllBtn.addEventListener('click', clearAll);
    composeBtn.addEventListener('click', openCompose);
    closeCompose.addEventListener('click', () => composeModal.style.display = 'none');
    sendCompose.addEventListener('click', sendCompose);

    loadNotifications();
});

// helpers
function formatDateTime(iso) {
    try { return new Date(iso).toLocaleString('vi-VN'); } catch(e) { return iso || '-'; }
}

function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/[&<>\"'`]/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;','`':'&#96;'})[m]; });
}
