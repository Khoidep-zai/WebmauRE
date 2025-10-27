// Global variables
let currentPostType = '';
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set user info
    displayUserInfo();
    
    // Load posts
    loadFeed();
    
    // Setup file preview
    setupFilePreview();
    
    // Setup form submission
    setupPostForm();
    
    // Setup notifications
    checkNotifications();
});

// Display user information
function displayUserInfo() {
    const userName = currentUser.name || 'User';
    const initials = getInitials(userName);
    
    // Note: userInitials is no longer needed since we use image
    document.getElementById('userName').textContent = userName;
    // Avatar is now an image, no need to set text content
    document.getElementById('createPostName').textContent = userName;
}

function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Load feed
function loadFeed() {
    const postsContainer = document.getElementById('postsContainer');
    
    // Hide create post form
    closePostForm();
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>Chưa có bài viết nào</h3>
                <p>Hãy là người đầu tiên chia sẻ thông tin!</p>
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = '';
    posts.forEach((post, index) => {
        const postElement = createPostElement(post, index);
        postsContainer.appendChild(postElement);
    });
}

// Create post element
function createPostElement(post, index) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
        <div class="post-header">
            <div class="post-author-info">
                <div class="post-author-avatar">${getInitials(post.author)}</div>
                <div class="post-author-details">
                    <div class="post-author-name">${post.author}</div>
                    <div class="post-meta">
                        <span><i class="far fa-clock"></i> ${post.time}</span>
                        <span class="post-type-badge ${post.type}">${getTypeLabel(post.type)}</span>
                        ${post.permission === 'internal' ? '<span class="post-type-badge" style="background: #fff3cd; color: #856404;"><i class="fas fa-lock"></i> Nội bộ KTX</span>' : ''}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="post-content">
            <div class="post-title">${post.title}</div>
            <div class="post-text">${post.content}</div>
            
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
            
            ${post.tags && post.tags.length > 0 ? `
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="post-actions">
            <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${index})">
                <i class="fas fa-heart"></i>
                <span>Thích</span>
                <span class="action-count">${post.likes || 0}</span>
            </button>
            <button class="action-btn" onclick="toggleComments(${index})">
                <i class="fas fa-comment"></i>
                <span>Bình luận</span>
                <span class="action-count">${post.comments ? post.comments.length : 0}</span>
            </button>
        </div>
        
        <div class="comments-section" id="commentsSection${index}" style="display: none;">
            ${post.comments && post.comments.length > 0 ? post.comments.map(comment => `
                <div class="comment">
                    <div class="comment-avatar">${getInitials(comment.author)}</div>
                    <div class="comment-content">
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-text">${comment.text}</div>
                    </div>
                </div>
            `).join('') : ''}
            
            <div class="comment-input-area">
                <input type="text" class="comment-input" placeholder="Viết bình luận..." onkeypress="handleCommentKeypress(event, ${index})">
                <button class="comment-submit-btn" onclick="addComment(${index})">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    return div;
}

function getTypeLabel(type) {
    const labels = {
        'thong-bao': 'Thông báo',
        'hoi-dap': 'Hỏi đáp',
        'trao-doi': 'Trao đổi'
    };
    return labels[type] || type;
}

// Show create post
function showCreatePost() {
    document.getElementById('postTypeSelector').style.display = 'block';
}

// Show post form
function showPostForm(type) {
    currentPostType = type;
    const titles = {
        'thong-bao': 'Tạo thông báo mới',
        'hoi-dap': 'Đặt câu hỏi',
        'trao-doi': 'Tạo cuộc trao đổi'
    };
    
    document.getElementById('formTitle').textContent = titles[type] || 'Tạo bài viết mới';
    document.getElementById('postTypeSelector').style.display = 'none';
    document.getElementById('createPostForm').style.display = 'block';
    
    // Scroll to form
    document.getElementById('createPostForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Close post form
function closePostForm() {
    document.getElementById('postTypeSelector').style.display = 'none';
    document.getElementById('createPostForm').style.display = 'none';
    document.getElementById('postForm').reset();
    document.getElementById('filePreview').innerHTML = '';
    currentPostType = '';
}

// Setup file preview
function setupFilePreview() {
    const fileInput = document.getElementById('postImage');
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('filePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Setup post form submission
function setupPostForm() {
    const form = document.getElementById('postForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentPostType) {
            alert('Vui lòng chọn loại bài viết!');
            return;
        }
        
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const tags = document.getElementById('postTags').value;
        const permission = document.querySelector('input[name="postPermission"]:checked').value;
        const fileInput = document.getElementById('postImage');
        
        const newPost = {
            id: Date.now(),
            type: currentPostType,
            title: title,
            content: content,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            permission: permission,
            author: currentUser.name,
            authorEmail: currentUser.email,
            time: getCurrentTime(),
            likes: 0,
            liked: false,
            comments: [],
            image: fileInput.files.length > 0 ? URL.createObjectURL(fileInput.files[0]) : null
        };
        
        posts.unshift(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // Notify other users (simulation)
        notifyUsers('Bạn có bài viết mới: ' + title);
        
        // Reload feed
        loadFeed();
        
        // Reset form
        closePostForm();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Toggle like
function toggleLike(index) {
    const post = posts[index];
    if (post.liked) {
        post.likes--;
        post.liked = false;
    } else {
        post.likes++;
        post.liked = true;
        
        // Notify author
        if (post.authorEmail !== currentUser.email) {
            notifyUsers(currentUser.name + ' đã thích bài viết của bạn');
        }
    }
    localStorage.setItem('posts', JSON.stringify(posts));
    loadFeed();
}

// Toggle comments
function toggleComments(index) {
    const commentsSection = document.getElementById('commentsSection' + index);
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

// Add comment
function addComment(index) {
    const commentsSection = document.getElementById('commentsSection' + index);
    const commentInput = commentsSection.querySelector('.comment-input');
    const commentText = commentInput.value.trim();
    
    if (!commentText) return;
    
    const post = posts[index];
    if (!post.comments) post.comments = [];
    
    post.comments.push({
        author: currentUser.name,
        text: commentText,
        time: getCurrentTime()
    });
    
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // Notify author
    if (post.authorEmail !== currentUser.email) {
        notifyUsers(currentUser.name + ' đã bình luận bài viết của bạn');
    }
    
    commentInput.value = '';
    loadFeed();
    
    // Keep comments section open
    setTimeout(() => toggleComments(index), 100);
}

// Handle comment keypress
function handleCommentKeypress(event, index) {
    if (event.key === 'Enter') {
        addComment(index);
    }
}

// Get current time
function getCurrentTime() {
    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return now.toLocaleDateString('vi-VN', options);
}

// Notifications
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];

function notifyUsers(message) {
    const notification = {
        message: message,
        time: getCurrentTime(),
        read: false
    };
    
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    checkNotifications();
}

function checkNotifications() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const notificationDot = document.getElementById('notificationDot');
    const navNotificationDot = document.getElementById('navNotificationDot');
    
    if (unreadCount > 0) {
        notificationDot.style.display = 'block';
        navNotificationDot.style.display = 'block';
    } else {
        notificationDot.style.display = 'none';
        navNotificationDot.style.display = 'none';
    }
}

// Logout
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.setItem('user', JSON.stringify({ ...currentUser, loggedIn: false }));
        window.location.href = 'login.html';
    }
}

