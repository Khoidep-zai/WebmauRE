// Simple admin page logic
// Assumption: admin authentication is lightweight (prompt). Default admin password: admin123
// This is a demo; in production use proper server-side auth.

// Khởi tạo danh sách người dùng mẫu nếu chưa có
function initializeUserList() {
    if (!localStorage.getItem('userList')) {
        const defaultUsers = [
            {
                id: '1',
                fullName: 'Quản trị viên',
                username: 'admin',
                password: '123456', // Trong thực tế nên mã hóa mật khẩu
                email: 'admin@vlu.edu.vn',
                phone: '0123456789',
                role: 'admin',
                status: 'active'
            }
        ];
        localStorage.setItem('userList', JSON.stringify(defaultUsers));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUserList();
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
        // default to service admin view
        adminMode = 'services';
        lastFilter = 'pending';
        loadRequests('pending');
        return;
    }

    alert('Mật khẩu không đúng. Bạn sẽ được chuyển đến trang đăng nhập.');
    window.location.href = 'login.html';
});

let adminMode = 'services';
let lastFilter = 'all';

function initButtons() {
    const refreshBtn = document.getElementById('refreshBtn');
    const showAllBtn = document.getElementById('showAllBtn');
    const showPendingBtn = document.getElementById('showPendingBtn');
    const exportBtn = document.getElementById('exportBtn');
    const svcBtn = document.getElementById('showServiceAdminBtn');
    const roomBtn = document.getElementById('showRoomAdminBtn');
    const reportsBtn = document.getElementById('showReportsBtn');
    const feedbackBtn = document.getElementById('showFeedbackBtn');

    if (refreshBtn) refreshBtn.addEventListener('click', () => loadRequests(lastFilter));
    
    if (feedbackBtn) feedbackBtn.addEventListener('click', () => {
        adminMode = 'feedback';
        feedbackBtn.classList.add('active');
        if (svcBtn) svcBtn.classList.remove('active');
        if (roomBtn) roomBtn.classList.remove('active');
        if (reportsBtn) reportsBtn.classList.remove('active');
        if (userAdminBtn) userAdminBtn.classList.remove('active');
        document.querySelector('.page-title').textContent = 'Quản lý phản ánh sự cố';
        // Ẩn phần phân quyền và quản lý tài khoản
        const accessControlSection = document.getElementById('accessControlSection');
        const userManagementSection = document.getElementById('userManagementSection');
        if (accessControlSection) accessControlSection.style.display = 'none';
        if (userManagementSection) userManagementSection.style.display = 'none';
        loadFeedback();
    });

    // Thêm xử lý cho nút Quản lý tài khoản
    const userAdminBtn = document.getElementById('showUserAdminBtn');
    if (userAdminBtn) userAdminBtn.addEventListener('click', () => {
        adminMode = 'users';
        userAdminBtn.classList.add('active');
        if (svcBtn) svcBtn.classList.remove('active');
        if (roomBtn) roomBtn.classList.remove('active');
        if (reportsBtn) reportsBtn.classList.remove('active');
        if (feedbackBtn) feedbackBtn.classList.remove('active');
        document.querySelector('.page-title').textContent = 'Quản lý tài khoản';
        // Ẩn phần phân quyền và hiển thị quản lý tài khoản
        const accessControlSection = document.getElementById('accessControlSection');
        const userManagementSection = document.getElementById('userManagementSection');
        const requestsContainer = document.getElementById('requestsContainer');
        if (accessControlSection) accessControlSection.style.display = 'none';
        if (userManagementSection) userManagementSection.style.display = 'block';
        if (requestsContainer) requestsContainer.style.display = 'none';
        loadUserList();
    });
    if (showAllBtn) showAllBtn.addEventListener('click', () => { lastFilter = 'all'; loadRequests('all'); });
    if (showPendingBtn) showPendingBtn.addEventListener('click', () => { lastFilter = 'pending'; loadRequests('pending'); });
    if (exportBtn) exportBtn.addEventListener('click', exportJSON);

    if (svcBtn) svcBtn.addEventListener('click', () => {
        adminMode = 'services';
        svcBtn.classList.add('active');
        if (roomBtn) roomBtn.classList.remove('active');
        if (reportsBtn) reportsBtn.classList.remove('active');
        if (feedbackBtn) feedbackBtn.classList.remove('active');
        document.querySelector('.page-title').textContent = 'Phân quyền truy cập';
        // Hiển thị phần phân quyền
        const accessControlSection = document.getElementById('accessControlSection');
        if (accessControlSection) {
            accessControlSection.style.display = 'block';
        }
        loadRequests(lastFilter);
    });
    if (roomBtn) roomBtn.addEventListener('click', () => {
        adminMode = 'rooms';
        roomBtn.classList.add('active');
        if (svcBtn) svcBtn.classList.remove('active');
        if (reportsBtn) reportsBtn.classList.remove('active');
        if (feedbackBtn) feedbackBtn.classList.remove('active');
        document.querySelector('.page-title').textContent = 'Quản lý đơn chuyển/trả phòng';
        // Ẩn phần phân quyền
        const accessControlSection = document.getElementById('accessControlSection');
        if (accessControlSection) {
            accessControlSection.style.display = 'none';
        }
        loadRequests(lastFilter);
    });
    if (reportsBtn) reportsBtn.addEventListener('click', () => {
        adminMode = 'reports';
        reportsBtn.classList.add('active');
        if (svcBtn) svcBtn.classList.remove('active');
        if (roomBtn) roomBtn.classList.remove('active');
        if (feedbackBtn) feedbackBtn.classList.remove('active');
        document.querySelector('.page-title').textContent = 'Báo cáo & Thống kê';
        // Ẩn phần phân quyền
        const accessControlSection = document.getElementById('accessControlSection');
        if (accessControlSection) {
            accessControlSection.style.display = 'none';
        }
        loadRequests(lastFilter);
    });

    // ensure initial active state reflects adminMode
    try {
        if (adminMode === 'rooms') {
            if (roomBtn) roomBtn.classList.add('active');
            if (svcBtn) svcBtn.classList.remove('active');
            if (reportsBtn) reportsBtn.classList.remove('active');
            const title = document.querySelector('.page-title'); if (title) title.textContent = 'Quản lý đơn chuyển/trả phòng';
        } else {
            if (svcBtn) svcBtn.classList.add('active');
            if (roomBtn) roomBtn.classList.remove('active');
            if (reportsBtn) reportsBtn.classList.remove('active');
            const title = document.querySelector('.page-title'); if (title) title.textContent = 'Quản lý yêu cầu dịch vụ';
        }
    } catch (e) {
        // ignore
    }
}

function loadRequests(filter = 'all') {
    const container = document.getElementById('requestsContainer');
    // If in reports mode, render reports instead
    if (adminMode === 'reports') {
        renderReports();
        return;
    }
    const raw = localStorage.getItem('serviceHistory') || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch(e) { list = []; }

    // Filter by admin mode: service vs room requests
    if (adminMode === 'rooms') {
        list = list.filter(r => r.service === 'room-action' || (r.type && ['renew','return','transfer'].includes(r.type)));
    } else {
        list = list.filter(r => !(r.service === 'room-action' || (r.type && ['renew','return','transfer'].includes(r.type))));
    }

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

    // If this is a room-related request, show a dedicated approve-and-assign button
    let btnAssign = null;
    const isRoomRequest = (req.service === 'room-action') || (req.type && ['renew','return','transfer'].includes(req.type));
    if (isRoomRequest) {
        btnAssign = document.createElement('button');
        btnAssign.className = 'btn btn-success';
        btnAssign.textContent = 'Phê duyệt & Gán phòng';
        btnAssign.onclick = () => approveRoomRequest(req.id);
    }

    actions.appendChild(statusSpan);
    actions.appendChild(btnProcessing);
    actions.appendChild(btnComplete);
    actions.appendChild(btnCancel);
    actions.appendChild(btnView);
    if (btnAssign) actions.appendChild(btnAssign);

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

    // Create a notification for the request author if available
    try {
        const notifRaw = localStorage.getItem('notifications') || '[]';
        const notifs = JSON.parse(notifRaw);
        const req = list[idx];
        const recipient = req.authorEmail || null;
        const message = `Yêu cầu dịch vụ "${req.serviceName || req.service}" của bạn đã được cập nhật: ${newStatus}`;
        const notification = {
            id: Date.now(),
            recipientEmail: recipient,
            message: message,
            relatedRequestId: req.id,
            time: new Date().toISOString(),
            read: false
        };
        // push to front
        notifs.unshift(notification);
        // keep recent 200
        if (notifs.length > 200) notifs.splice(200);
        localStorage.setItem('notifications', JSON.stringify(notifs));
    } catch (e) {
        console.error('Could not write notification', e);
    }

    loadRequests('all');
}

// Approve room-action request and assign an available room
function approveRoomRequest(id) {
    const raw = localStorage.getItem('serviceHistory') || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch(e) { list = []; }

    const idx = list.findIndex(r => r.id === id || String(r.id) === String(id));
    if (idx === -1) { alert('Yêu cầu không tìm thấy.'); return; }

    const req = list[idx];
    // Load global room list
    const roomsRaw = localStorage.getItem('roomList') || '[]';
    let rooms = [];
    try { rooms = JSON.parse(roomsRaw); } catch(e) { rooms = []; }

    const available = rooms.filter(r => r.status === 'available');
    if (available.length === 0) {
        alert('Không có phòng trống để gán. Vui lòng thêm phòng hoặc giải phóng phòng trước.');
        return;
    }

    // If student requested a specific room, prefer it if available
    const preferred = req.desiredRoom || null;
    let target = null;
    if (preferred) {
        const prefRoom = rooms.find(r => r.code === preferred);
        if (prefRoom && prefRoom.status === 'available') {
            const ok = confirm('Sinh viên yêu cầu chuyển tới ' + preferred + '. Bạn có muốn gán phòng này không?');
            if (ok) target = prefRoom;
        } else {
            // preferred not available
            alert('Phòng yêu cầu (' + preferred + ') hiện không trống. Vui lòng chọn phòng khác.');
        }
    }

    if (!target) {
        const options = available.map(r => r.code).join(', ');
        const selectedCode = prompt('Phòng trống: ' + options + '\nNhập mã phòng để gán cho sinh viên:');
        if (!selectedCode) return;
        target = rooms.find(r => r.code === selectedCode);
        if (!target || target.status !== 'available') {
            alert('Mã phòng không hợp lệ hoặc không còn trống.');
            return;
        }
    }

    // Mark target room occupied and record occupant
    target.status = 'occupied';
    target.occupantName = req.author || null;
    target.occupantEmail = req.authorEmail || null;

    // Optionally, free previous room if any in global assignments
    const assignmentsRaw = localStorage.getItem('roomAssignments') || '[]';
    let assignments = [];
    try { assignments = JSON.parse(assignmentsRaw); } catch(e) { assignments = []; }

    // Find existing assignment for this user and free previous room
    const existing = assignments.find(a => a.email === req.authorEmail);
    if (existing && existing.roomNumber) {
        const prev = rooms.find(r => r.code === existing.roomNumber);
        if (prev) {
            prev.status = 'available';
            prev.occupantName = null;
            prev.occupantEmail = null;
        }
    }

    // Upsert assignment for this user
    const newAssign = {
        email: req.authorEmail || null,
        name: req.author || null,
        roomNumber: target.code,
        assignedAt: new Date().toISOString()
    };
    if (existing) {
        existing.roomNumber = newAssign.roomNumber;
        existing.assignedAt = newAssign.assignedAt;
    } else {
        assignments.unshift(newAssign);
    }

    // Persist rooms and assignments
    localStorage.setItem('roomList', JSON.stringify(rooms));
    localStorage.setItem('roomAssignments', JSON.stringify(assignments));

    // Update request status and record assignment
    list[idx].status = 'completed';
    list[idx].adminUpdatedAt = new Date().toISOString();
    list[idx].assignedRoom = target.code;
    localStorage.setItem('serviceHistory', JSON.stringify(list));

    // Create notification to inform student
    try {
        const notifRaw = localStorage.getItem('notifications') || '[]';
        const notifs = JSON.parse(notifRaw);
        const recipient = req.authorEmail || null;
        const message = `Yêu cầu phòng của bạn đã được phê duyệt. Phòng mới: ${target.code}`;
        const notification = {
            id: Date.now(),
            recipientEmail: recipient,
            message: message,
            relatedRequestId: req.id,
            time: new Date().toISOString(),
            read: false
        };
        notifs.unshift(notification);
        if (notifs.length > 200) notifs.splice(200);
        localStorage.setItem('notifications', JSON.stringify(notifs));
    } catch (e) {
        console.error('Could not write notification', e);
    }

    alert('Đã gán phòng ' + target.code + ' cho ' + (req.author || 'sinh viên') + '.');
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

// ---------- Reports rendering ----------
function renderReports() {
    const container = document.getElementById('requestsContainer');
    const raw = localStorage.getItem('serviceHistory') || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch(e) { list = []; }

    const roomsRaw = localStorage.getItem('roomList') || '[]';
    let rooms = [];
    try { rooms = JSON.parse(roomsRaw); } catch(e) { rooms = []; }

    // Metrics
    const totalRequests = list.length;
    const pending = list.filter(r => r.status === 'pending').length;
    const completed = list.filter(r => r.status === 'completed').length;
    const uniqueEmails = Array.from(new Set(list.map(r => r.authorEmail).filter(Boolean)));
    const totalStudents = uniqueEmails.length;

    const roomCounts = { available:0, occupied:0, maintenance:0 };
    rooms.forEach(r => { if (r.status === 'available') roomCounts.available++; else if (r.status === 'occupied') roomCounts.occupied++; else if (r.status === 'maintenance') roomCounts.maintenance++; });

    // Service counts
    const serviceCounts = {};
    list.forEach(r => {
        const key = r.serviceName || r.service || 'unknown';
        serviceCounts[key] = (serviceCounts[key] || 0) + 1;
    });

    // Monthly counts (last 6 months)
    const months = [];
    const now = new Date();
    for (let i=5;i>=0;i--) {
        const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
        const label = d.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
        months.push({ label, year: d.getFullYear(), month: d.getMonth(), count: 0 });
    }
    list.forEach(r => {
        const d = new Date(r.date);
        months.forEach(m => { if (d.getFullYear() === m.year && d.getMonth() === m.month) m.count++; });
    });

    // Build HTML
    container.innerHTML = '';
    const summary = document.createElement('div'); summary.className = 'reports-summary';
    const cards = [
        { title: 'Tổng yêu cầu', value: totalRequests },
        { title: 'Chờ duyệt', value: pending },
        { title: 'Hoàn thành', value: completed },
        { title: 'Sinh viên', value: totalStudents },
        { title: 'Phòng trống', value: roomCounts.available },
        { title: 'Phòng có người', value: roomCounts.occupied }
    ];
    cards.forEach(c => {
        const card = document.createElement('div'); card.className = 'report-card';
        card.innerHTML = `<h3>${c.title}</h3><div class="value">${c.value}</div>`;
        summary.appendChild(card);
    });
    container.appendChild(summary);

    // Chart area
    // Add feedback statistics
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const feedbackStats = {
        total: feedbacks.length,
        pending: feedbacks.filter(f => f.status === 'pending').length,
        resolved: feedbacks.filter(f => f.status === 'resolved').length,
        byType: {},
        byPriority: {
            low: 0,
            medium: 0,
            high: 0
        }
    };

    feedbacks.forEach(f => {
        feedbackStats.byType[f.issueType] = (feedbackStats.byType[f.issueType] || 0) + 1;
        feedbackStats.byPriority[f.priority] = (feedbackStats.byPriority[f.priority] || 0) + 1;
    });

    // Add feedback stats cards
    const feedbackSummary = document.createElement('div');
    feedbackSummary.className = 'reports-summary';
    feedbackSummary.innerHTML = `
        <h3>Thống kê phản ánh sự cố</h3>
        <div class="report-cards">
            <div class="report-card">
                <h4>Tổng số phản ánh</h4>
                <div class="value">${feedbackStats.total}</div>
            </div>
            <div class="report-card">
                <h4>Đang xử lý</h4>
                <div class="value">${feedbackStats.pending}</div>
            </div>
            <div class="report-card">
                <h4>Đã giải quyết</h4>
                <div class="value">${feedbackStats.resolved}</div>
            </div>
        </div>
        <div class="feedback-type-stats">
            <h4>Phân loại sự cố</h4>
            ${Object.entries(feedbackStats.byType).map(([type, count]) => `
                <div class="stat-row">
                    <span>${escapeHtml(type)}</span>
                    <span>${count}</span>
                </div>
            `).join('')}
        </div>
        <div class="feedback-priority-stats">
            <h4>Phân loại mức độ ưu tiên</h4>
            ${Object.entries(feedbackStats.byPriority).map(([priority, count]) => `
                <div class="stat-row">
                    <span>${escapeHtml(priority)}</span>
                    <span>${count}</span>
                </div>
            `).join('')}
        </div>
    `;
    container.appendChild(feedbackSummary);

    const chartWrap = document.createElement('div'); chartWrap.className = 'chart-area';
    chartWrap.innerHTML = `<h3>Yêu cầu theo tháng (6 tháng)</h3>`;
    const barChart = document.createElement('div'); barChart.className = 'bar-chart';
    const max = Math.max(1, ...months.map(m=>m.count));
    months.forEach(m => {
        const h = Math.round((m.count / max) * 100);
        const bar = document.createElement('div'); bar.className = 'bar'; bar.style.height = (h + '%'); bar.title = `${m.label}: ${m.count}`;
        bar.textContent = m.count > 0 ? m.count : '';
        barChart.appendChild(bar);
    });
    chartWrap.appendChild(barChart);
    const labels = document.createElement('div'); labels.className = 'chart-labels';
    months.forEach(m => { const s = document.createElement('span'); s.textContent = m.label.split(' ')[0]; labels.appendChild(s); });
    chartWrap.appendChild(labels);
    container.appendChild(chartWrap);

    // Services table
    const svcDiv = document.createElement('div'); svcDiv.className = 'chart-area';
    svcDiv.innerHTML = '<h3>Số lượng theo dịch vụ</h3>';
    const table = document.createElement('table'); table.className = 'services-table';
    table.innerHTML = '<thead><tr><th>Dịch vụ</th><th>Số lượng</th></tr></thead>';
    const tbody = document.createElement('tbody');
    Object.keys(serviceCounts).sort((a,b)=>serviceCounts[b]-serviceCounts[a]).forEach(k=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(k)}</td><td>${serviceCounts[k]}</td>`;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    svcDiv.appendChild(table);

    // Export report button
    const exportBtn = document.createElement('button'); exportBtn.className = 'btn'; exportBtn.textContent = 'Xuất báo cáo (JSON)';
    exportBtn.addEventListener('click', exportReports);
    svcDiv.appendChild(exportBtn);

    container.appendChild(svcDiv);
}

function exportReports() {
    const data = {
        serviceHistory: JSON.parse(localStorage.getItem('serviceHistory') || '[]'),
        roomList: JSON.parse(localStorage.getItem('roomList') || '[]'),
        roomAssignments: JSON.parse(localStorage.getItem('roomAssignments') || '[]'),
        generatedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'maubao_cao_' + new Date().toISOString().slice(0,10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
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

// User Management Functions
function loadUserList(filter = 'all') {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    const tableBody = document.getElementById('userTableBody');
    const filteredUsers = filter === 'all' ? userList : userList.filter(user => user.status === filter);

    tableBody.innerHTML = '';
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        
        // Xác định text trạng thái
        let statusText = '';
        switch(user.status) {
            case 'active': statusText = 'Hoạt động'; break;
            case 'locked': statusText = 'Đã khóa'; break;
            case 'deleted': statusText = 'Đã xóa'; break;
            default: statusText = user.status;
        }

        row.innerHTML = `
            <td>${escapeHtml(user.fullName)}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.phone || '')}</td>
            <td>${escapeHtml(user.role)}</td>
            <td><span class="status-${user.status}">${statusText}</span></td>
            <td class="user-actions">
                ${user.status !== 'deleted' ? `
                    <button class="btn" onclick="editUser('${user.id}')" ${user.status === 'deleted' ? 'disabled' : ''}>Sửa</button>
                    <button class="btn ${user.status === 'active' ? 'btn-danger' : 'btn-primary'}" 
                            onclick="toggleUserStatus('${user.id}')">
                        ${user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser('${user.id}')">Xóa</button>
                ` : `
                    <button class="btn btn-success" onclick="restoreUser('${user.id}')">Khôi phục</button>
                `}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function resetUserForm() {
    const form = document.getElementById('userForm');
    form.reset();
    document.getElementById('userId').value = '';
}

function saveUser(event) {
    event.preventDefault();
    const userId = document.getElementById('userId').value;
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const role = document.getElementById('userRole').value;

    const userList = JSON.parse(localStorage.getItem('userList')) || [];

    if (userId) {
        // Cập nhật tài khoản hiện có
        const index = userList.findIndex(u => u.id === userId);
        if (index !== -1) {
            const updatedUser = {
                ...userList[index],
                fullName,
                username,
                email,
                phone,
                role
            };
            if (password) {
                updatedUser.password = password;
            }
            userList[index] = updatedUser;
            alert('Cập nhật tài khoản thành công!');
        }
    } else {
        // Thêm tài khoản mới
        if (!password) {
            alert('Vui lòng nhập mật khẩu cho tài khoản mới!');
            return;
        }
        const newUser = {
            id: Date.now().toString(),
            fullName,
            username,
            password,
            email,
            phone,
            role,
            status: 'active'
        };
        userList.push(newUser);
        alert('Tạo tài khoản thành công!');
    }

    localStorage.setItem('userList', JSON.stringify(userList));
    resetUserForm();
    loadUserList();
}

function editUser(userId) {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    const user = userList.find(u => u.id === userId);
    if (user) {
        document.getElementById('userId').value = user.id;
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('username').value = user.username;
        document.getElementById('password').value = '';
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('userRole').value = user.role;
    }
}

function toggleUserStatus(userId) {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    const index = userList.findIndex(u => u.id === userId);
    if (index !== -1) {
        userList[index].status = userList[index].status === 'active' ? 'locked' : 'active';
        localStorage.setItem('userList', JSON.stringify(userList));
        loadUserList();
        
        // Hiển thị thông báo
        const action = userList[index].status === 'active' ? 'mở khóa' : 'khóa';
        alert(`Đã ${action} tài khoản "${userList[index].username}" thành công!`);
    }
}

function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
        return;
    }

    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    const index = userList.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        // Kiểm tra nếu là admin duy nhất
        if (userList[index].role === 'admin' && 
            userList.filter(u => u.role === 'admin' && u.status === 'active').length <= 1) {
            alert('Không thể xóa tài khoản admin duy nhất!');
            return;
        }

        userList[index].status = 'deleted';
        localStorage.setItem('userList', JSON.stringify(userList));
        loadUserList();
        alert(`Đã xóa tài khoản "${userList[index].username}" thành công!`);
    }
}

function restoreUser(userId) {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    const index = userList.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        userList[index].status = 'active';
        localStorage.setItem('userList', JSON.stringify(userList));
        loadUserList();
        alert(`Đã khôi phục tài khoản "${userList[index].username}" thành công!`);
    }
}

// Thêm event listeners cho quản lý tài khoản
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', saveUser);
    }

    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', resetUserForm);
    }

    const userStatusFilter = document.getElementById('userStatusFilter');
    if (userStatusFilter) {
        userStatusFilter.addEventListener('change', (e) => {
            loadUserList(e.target.value);
        });
    }
});

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

// Feedback management functions
function loadFeedback() {
    const container = document.getElementById('requestsContainer');
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    
    if (feedbacks.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Chưa có phản ánh nào.</p>
        </div>`;
        return;
    }

    container.innerHTML = '';
    feedbacks.forEach(feedback => {
        const card = createFeedbackCard(feedback);
        container.appendChild(card);
    });
}

function createFeedbackCard(feedback) {
    const div = document.createElement('div');
    div.className = 'feedback-card request-card';

    const info = document.createElement('div');
    info.className = 'feedback-info request-info';
    
    const priorityClass = {
        low: 'priority-low',
        medium: 'priority-medium',
        high: 'priority-high'
    }[feedback.priority] || '';

    info.innerHTML = `
        <div class="request-meta">
            <span class="small">ID: ${feedback.id}</span> • 
            <span class="small">Ngày: ${formatDateTime(feedback.createdAt)}</span> •
            <span class="priority-badge ${priorityClass}">Mức độ: ${feedback.priority}</span>
        </div>
        <div class="request-title">
            <strong>${escapeHtml(feedback.userName)} - Phòng ${escapeHtml(feedback.room)}</strong>
        </div>
        <div class="request-subtitle">
            <strong>Loại sự cố: ${escapeHtml(feedback.issueType)}</strong>
        </div>
        <div class="request-body">
            ${escapeHtml(feedback.description)}
        </div>
        ${feedback.updates.map(update => `
            <div class="feedback-update">
                <strong>${formatDateTime(update.time)}:</strong> ${escapeHtml(update.message)}
            </div>
        `).join('')}
    `;

    const actions = document.createElement('div');
    actions.className = 'request-actions';

    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${statusClass(feedback.status)}`;
    statusBadge.textContent = feedback.status;
    actions.appendChild(statusBadge);

    const updateBtn = document.createElement('button');
    updateBtn.className = 'btn';
    updateBtn.textContent = 'Cập nhật trạng thái';
    updateBtn.onclick = () => updateFeedbackStatus(feedback);
    actions.appendChild(updateBtn);

    const resolveBtn = document.createElement('button');
    resolveBtn.className = 'btn btn-primary';
    resolveBtn.textContent = 'Đánh dấu đã xử lý';
    resolveBtn.onclick = () => resolveFeedback(feedback.id);
    if (feedback.status === 'resolved') resolveBtn.disabled = true;
    actions.appendChild(resolveBtn);

    div.appendChild(info);
    div.appendChild(actions);

    return div;
}

function updateFeedbackStatus(feedback) {
    const message = prompt('Nhập cập nhật mới:');
    if (!message) return;

    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const index = feedbacks.findIndex(f => f.id === feedback.id);
    
    if (index === -1) {
        alert('Không tìm thấy phản ánh!');
        return;
    }

    feedbacks[index].updates.push({
        time: new Date().toISOString(),
        message: message
    });

    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    loadFeedback();
}

function resolveFeedback(id) {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const index = feedbacks.findIndex(f => f.id === id);
    
    if (index === -1) {
        alert('Không tìm thấy phản ánh!');
        return;
    }

    feedbacks[index].status = 'resolved';
    feedbacks[index].updates.push({
        time: new Date().toISOString(),
        message: 'Sự cố đã được xử lý'
    });

    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    loadFeedback();
}
