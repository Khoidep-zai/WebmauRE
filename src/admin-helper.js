// admin-helper.js
// Show admin link in sidebar and populate user profile from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user')) || null;

    // Update sidebar user info if present
    try {
        const nameEl = document.getElementById('userName') || document.getElementById('adminUserName');
        const avatarEl = document.getElementById('userAvatar') || document.getElementById('adminAvatar');
        const badgeEl = document.querySelector('.user-badge') || document.getElementById('adminUserBadge');
        if (user) {
            if (nameEl) nameEl.textContent = user.name || nameEl.textContent;
            if (avatarEl) avatarEl.src = '../logo/cho.jpg';
            if (badgeEl) badgeEl.textContent = user.isAdmin ? 'Admin' : (user.loggedIn ? 'Sinh viên' : badgeEl.textContent);
        }
    } catch (e) {
        // ignore
    }

    // Show/hide admin link
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        if (user && user.isAdmin) {
            adminLink.style.display = 'flex';
            adminLink.addEventListener('click', () => { window.location.href = 'admin.html'; });
            // also show rooms management link if present
            const adminRoomsLink = document.getElementById('adminRoomsLink');
            if (adminRoomsLink) {
                adminRoomsLink.style.display = 'flex';
                adminRoomsLink.addEventListener('click', () => { window.location.href = 'admin-rooms.html'; });
            }
        } else {
            adminLink.style.display = 'none';
        }
    }

    // Update notification dot if unread notifications exist for current user
    try {
        const rawNotifs = localStorage.getItem('notifications') || '[]';
        const notifs = JSON.parse(rawNotifs);
        const unreadCount = notifs.filter(n => !n.read && (!n.recipientEmail || (user && n.recipientEmail === user.email))).length;
        const navDot = document.getElementById('navNotificationDot');
        if (navDot) {
            navDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    } catch (e) {
        // ignore
    }
});
