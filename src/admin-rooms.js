// admin-rooms.js — simple client-side room management stored in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user')) || null;
  if (!user || !user.isAdmin) {
    alert('Bạn cần đăng nhập với quyền Admin để truy cập trang này.');
    window.location.href = 'login.html';
    return;
  }

  const roomsKey = 'roomList';
  let rooms = JSON.parse(localStorage.getItem(roomsKey) || '[]');
  const tbody = document.getElementById('roomsTbody');
  const noRooms = document.getElementById('noRooms');

  const addBtn = document.getElementById('addRoomBtn');
  const importBtn = document.getElementById('importSample');
  const searchInput = document.getElementById('searchInput');

  const modal = document.getElementById('roomModal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const roomCodeInput = document.getElementById('roomCode');
  const roomTypeInput = document.getElementById('roomType');
  const roomBedsInput = document.getElementById('roomBeds');
  const roomStatusSelect = document.getElementById('roomStatus');
  const saveRoomBtn = document.getElementById('saveRoomBtn');

  let editingId = null;

  function saveRooms() {
    localStorage.setItem(roomsKey, JSON.stringify(rooms));
  }

  function render(filterText='') {
    const visible = rooms.filter(r => !filterText || (r.code && r.code.toLowerCase().includes(filterText)) || (r.type && r.type.toLowerCase().includes(filterText)));
    tbody.innerHTML = '';
    if (visible.length === 0) {
      noRooms.style.display = 'block';
      return;
    } else {
      noRooms.style.display = 'none';
    }

    visible.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(r.code)}</td>
        <td>${escapeHtml(r.type)}</td>
        <td>${r.beds || 0}</td>
        <td><span class="status-badge ${r.status}">${statusLabel(r.status)}</span></td>
        <td>
          <div class="rooms-actions">
            <button class="btn" data-edit="${r.id}">Sửa</button>
            <button class="btn" data-toggle="${r.id}">${r.status === 'available' ? 'Đặt' : 'Đặt lại'}</button>
            <button class="btn btn-danger" data-delete="${r.id}">Xóa</button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // attach handlers
    tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-edit');
      openEdit(id);
    }));
    tbody.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-toggle');
      toggleStatus(id);
    }));
    tbody.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-delete');
      deleteRoom(id);
    }));
  }

  function statusLabel(s) {
    switch(s) {
      case 'occupied': return 'Đã đủ';
      case 'maintenance': return 'Bảo trì';
      default: return 'Trống';
    }
  }

  function openAdd() {
    editingId = null;
    modalTitle.textContent = 'Thêm phòng';
    roomCodeInput.value = '';
    roomTypeInput.value = '';
    roomBedsInput.value = 1;
    roomStatusSelect.value = 'available';
    modal.style.display = 'block';
  }

  function openEdit(id) {
    const r = rooms.find(x => String(x.id) === String(id));
    if (!r) return alert('Phòng không tìm thấy');
    editingId = r.id;
    modalTitle.textContent = 'Sửa phòng ' + r.code;
    roomCodeInput.value = r.code;
    roomTypeInput.value = r.type || '';
    roomBedsInput.value = r.beds || 1;
    roomStatusSelect.value = r.status || 'available';
    modal.style.display = 'block';
  }

  function deleteRoom(id) {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;
    rooms = rooms.filter(r => String(r.id) !== String(id));
    saveRooms();
    render(searchInput.value.trim().toLowerCase());
  }

  function toggleStatus(id) {
    const r = rooms.find(x => String(x.id) === String(id));
    if (!r) return;
    // cycle statuses available -> occupied -> maintenance -> available
    if (r.status === 'available') r.status = 'occupied';
    else if (r.status === 'occupied') r.status = 'maintenance';
    else r.status = 'available';
    saveRooms();
    render(searchInput.value.trim().toLowerCase());
  }

  saveRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim();
    const type = roomTypeInput.value.trim();
    const beds = parseInt(roomBedsInput.value) || 1;
    const status = roomStatusSelect.value;
    if (!code) return alert('Nhập mã phòng');

    if (editingId) {
      const r = rooms.find(x => x.id === editingId);
      if (r) {
        r.code = code;
        r.type = type;
        r.beds = beds;
        r.status = status;
      }
    } else {
      // avoid duplicate code
      if (rooms.some(x => x.code === code)) return alert('Mã phòng đã tồn tại');
      rooms.unshift({ id: Date.now(), code, type, beds, status });
    }

    saveRooms();
    modal.style.display = 'none';
    render(searchInput.value.trim().toLowerCase());
  });

  addBtn.addEventListener('click', openAdd);
  closeModal.addEventListener('click', () => modal.style.display = 'none');
  searchInput.addEventListener('input', (e) => render(e.target.value.trim().toLowerCase()));

  importBtn.addEventListener('click', () => {
    // sample rooms
    const sample = [
      { id: Date.now()+1, code: 'A101', type: '4-giường', beds: 4, status: 'available' },
      { id: Date.now()+2, code: 'A102', type: '2-giường', beds: 2, status: 'occupied' },
      { id: Date.now()+3, code: 'B201', type: '2-giường', beds: 2, status: 'maintenance' }
    ];
    rooms = sample.concat(rooms);
    saveRooms();
    render('');
  });

  // initial render
  render('');
});

function escapeHtml(s) { if (!s && s !== 0) return ''; return String(s).replace(/[&<>\"'`]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;','`':'&#96;'})[m]); }
