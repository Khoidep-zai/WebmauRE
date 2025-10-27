// Toggle password visibility
document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        if (type === 'text') {
            togglePassword.classList.remove('fa-eye');
            togglePassword.classList.add('fa-eye-slash');
        } else {
            togglePassword.classList.remove('fa-eye-slash');
            togglePassword.classList.add('fa-eye');
        }
    });
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const mssv = document.getElementById('mssv').value;
        const password = document.getElementById('password').value;
        
        // Validate credentials
        const validMSSV = '2374802010247';
        const validPassword = '12345678';
        
        if (mssv === validMSSV && password === validPassword) {
            // Save user info to localStorage
            const userInfo = {
                mssv: mssv,
                email: mssv + '@vlu.edu.vn',
                name: 'Nguyễn Văn A',
                loggedIn: true
            };
            
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            // Redirect to feed page
            window.location.href = 'feed.html';
        } else {
            alert('MSSV hoặc mật khẩu không đúng!\n\nMSSV: 2374802010247\nMật khẩu: 12345678');
        }
    });
});

