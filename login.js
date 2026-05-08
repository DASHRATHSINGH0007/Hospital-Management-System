// --- LOGIN LOGIC ---
function showLogin(role) {
    document.getElementById('login-options').classList.add('hidden');
    const loginForm = document.getElementById('login-form');
    const loginTitle = document.getElementById('login-title');
    const loginRole = document.getElementById('login-role');
    
    const roleColors = {
        admin: 'text-blue-600',
        doctor: 'text-green-600',
        receptionist: 'text-purple-600'
    };

    loginTitle.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
    loginTitle.className = `text-2xl font-semibold text-center ${roleColors[role]}`;
    loginRole.value = role;
    loginForm.classList.remove('hidden');
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('login-role').value;
    const errorMessage = document.getElementById('error-message');

    const credentials = {
        admin: { user: 'admin', pass: 'admin123' },
        doctor: { user: 'doctor', pass: 'doctor123' },
        receptionist: { user: 'receptionist', pass: 'rec123' }
    };

    if (credentials[role] && credentials[role].user === username && credentials[role].pass === password) {
        // Store role in sessionStorage to persist login across page refresh
        sessionStorage.setItem('loggedInRole', role);
        window.location.href = `${role}.html`;
    } else {
        errorMessage.textContent = 'Invalid username or password.';
    }
});
