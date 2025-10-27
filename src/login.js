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
        const studentPassword = '12345678'; // existing demo student password
        const adminPassword = '123456'; // admin password per request

        if (mssv === validMSSV && password === studentPassword) {
            // Save regular student info to localStorage
            const userInfo = {
                mssv: mssv,
                email: mssv + '@vlu.edu.vn',
                name: 'Nguyễn Văn A',
                loggedIn: true,
                isAdmin: false
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            // Redirect to feed page
            window.location.href = 'feed.html';
            return;
        }

        if (mssv === validMSSV && password === adminPassword) {
            // Save admin info to localStorage
            const userInfo = {
                mssv: mssv,
                email: mssv + '@vlu.edu.vn',
                name: 'Nguyễn Văn A (Admin)',
                loggedIn: true,
                isAdmin: true
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            // Redirect to admin page
            window.location.href = 'admin.html';
            return;
        }

        alert('MSSV hoặc mật khẩu không đúng!\n\nDemo credentials:\n- Sinh viên: MSSV 2374802010247, mật khẩu 12345678\n- Admin: MSSV 2374802010247, mật khẩu 123456');
    });
});

