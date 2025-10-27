// Simple admin page logic
// Assumption: admin authentication is lightweight (prompt). Default admin password: admin123
// This is a demo; in production use proper server-side auth.

document.addEventListener('DOMContentLoaded', () => {
    // If user is already logged in as admin (from login page), skip prompt.
    const storedUser = JSON.parse(localStorage.getItem('user')) || null;

    if (storedUser && storedUser.isAdmin) {
        // populate UI with admin info
        setAdminUserInfo(storedUser);
        initButtons();
        loadRequests('pending');
        return;
    }

    // If not present or not admin, offer a one-time password prompt to become admin.
    const pw = prompt('Nhập mật khẩu quản trị viên (hoặc đăng nhập ở trang đăng nhập):');
    if (pw === null) {
        window.location.href = 'login.html';
        return;
    }

    const adminPassword = '123456';
    if (pw === adminPassword) {
        // create or update local user with admin flag so future navigations keep admin state
        const user = storedUser || { mssv: '2374802010247', email: 'admin@vlu.edu.vn', name: 'Quản trị viên' };
        user.isAdmin = true;
        user.loggedIn = true;
        user.name = user.name || 'Quản trị viên';
        localStorage.setItem('user', JSON.stringify(user));
        setAdminUserInfo(user);
        initButtons();
        loadRequests('pending');
        return;
    }

    alert('Mật khẩu không đúng. Bạn sẽ được chuyển đến trang đăng nhập.');
    window.location.href = 'login.html';
});

function initButtons() {
    document.getElementById('refreshBtn').addEventListener('click', loadRequests);
    document.getElementById('showAllBtn').addEventListener('click', () => loadRequests('all'));
    document.getElementById('showPendingBtn').addEventListener('click', () => loadRequests('pending'));
    document.getElementById('exportBtn').addEventListener('click', exportJSON);
}

function loadRequests(filter = 'all') {
    const container = document.getElementById('requestsContainer');
    const raw = localStorage.getItem('serviceHistory') || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch(e) { list = []; }

    if (filter === 'pending') {
        list = list.filter(r => r.status === 'pending');
    }

    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>Không có yêu cầu phù hợp.</p></div>`;
        return;
    }

    container.innerHTML = '';
    list.forEach(req => {
        const card = createRequestCard(req);
        container.appendChild(card);
    });
}

function createRequestCard(req) {
    const div = document.createElement('div');
    div.className = 'request-card';

    const info = document.createElement('div');
    info.className = 'request-info';
    info.innerHTML = `
        <div class="request-meta">
            <span class="small">ID: ${req.id}</span> • <span class="small">Ngày: ${formatDate(req.date)}</span>
        </div>
        <div class="request-title"><strong>${escapeHtml(req.serviceName || req.service)}</strong></div>
        <div class="request-body small">${escapeHtml(req.description || '-')}</div>
        <div class="request-body small">Địa điểm: ${escapeHtml(req.address || '-') } • Thời gian: ${formatDateTime(req.desiredTime || req.date)}</div>
        <div class="request-body small">Giá: ${formatPrice(req.price || 0)} • Thanh toán: ${escapeHtml(req.paymentMethod || '-')}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'request-actions';

    const statusSpan = document.createElement('span');
    statusSpan.className = 'status-badge ' + statusClass(req.status || 'pending');
    statusSpan.textContent = req.status || 'pending';

    const btnProcessing = document.createElement('button');
    btnProcessing.className = 'btn';
    btnProcessing.textContent = 'Đang xử lý';
    btnProcessing.onclick = () => updateStatus(req.id, 'processing');

    const btnComplete = document.createElement('button');
    btnComplete.className = 'btn btn-primary';
    btnComplete.textContent = 'Hoàn thành';
    btnComplete.onclick = () => updateStatus(req.id, 'completed');

    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-danger';
    btnCancel.textContent = 'Hủy';
    btnCancel.onclick = () => updateStatus(req.id, 'cancelled');

    const btnView = document.createElement('button');
    btnView.className = 'btn';
    btnView.textContent = 'Xem JSON';
    btnView.onclick = () => alert(JSON.stringify(req, null, 2));

    actions.appendChild(statusSpan);
    actions.appendChild(btnProcessing);
    actions.appendChild(btnComplete);
    actions.appendChild(btnCancel);
    actions.appendChild(btnView);

    div.appendChild(info);
    div.appendChild(actions);

    return div;
}

function updateStatus(id, newStatus) {
    const raw = localStorage.getItem('serviceHistory') || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch(e) { list = []; }

    const idx = list.findIndex(r => r.id === id || String(r.id) === String(id));
    if (idx === -1) { alert('Yêu cầu không tìm thấy.'); return; }

    list[idx].status = newStatus;
    // add admin note/updated time
    list[idx].adminUpdatedAt = new Date().toISOString();

    localStorage.setItem('serviceHistory', JSON.stringify(list));
    loadRequests('all');
}

function exportJSON() {
    const raw = localStorage.getItem('serviceHistory') || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'serviceHistory.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Helpers
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(price || 0);
}

function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString('vi-VN'); } catch(e) { return iso || '-'; }
}

function formatDateTime(iso) {
    try { return new Date(iso).toLocaleString('vi-VN'); } catch(e) { return iso || '-'; }
}

function statusClass(status) {
    switch(status) {
        case 'processing': return 'status-processing';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/[&<>"'`]/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'})[m]; });
}

// Populate admin user info in sidebar
function setAdminUserInfo(user) {
    try {
        const nameEl = document.getElementById('adminUserName');
        const badgeEl = document.getElementById('adminUserBadge');
        const avatarEl = document.getElementById('adminAvatar');
        if (nameEl) nameEl.textContent = user.name || 'Quản trị viên';
        if (badgeEl) badgeEl.textContent = user.isAdmin ? 'Admin' : 'Người dùng';
        if (avatarEl) avatarEl.src = '../logo/cho.jpg';

        // ensure admin menu stays highlighted
        const adminMenu = document.getElementById('adminMenuItem');
        if (adminMenu) adminMenu.classList.add('active');
    } catch (e) {
        // ignore
    }
}
