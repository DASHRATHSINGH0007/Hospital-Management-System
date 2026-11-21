// ==========================================
// HOSPITAL MANAGEMENT SYSTEM - LOGIN LOGIC
// ==========================================

const DOCTOR_ACCOUNTS = [
    { id: 1, name: 'Dr. John Smith', user: 'doctor1', pass: 'doctor123', specialization: 'Cardiology' },
    { id: 2, name: 'Dr. Emily Jones', user: 'doctor2', pass: 'doctor123', specialization: 'Neurology' },
    { id: 3, name: 'Dr. Sarah Davis', user: 'doctor3', pass: 'doctor123', specialization: 'Pediatrics' },
    { id: 4, name: 'Dr. Michael Chen', user: 'doctor4', pass: 'doctor123', specialization: 'Orthopedics' },
    // Generic fallback account
    { id: 1, name: 'Dr. John Smith', user: 'doctor', pass: 'doctor123', specialization: 'Cardiology' }
];

function showLogin(role) {
    document.getElementById('login-options').classList.add('hidden');
    const loginForm = document.getElementById('login-form');
    const loginTitle = document.getElementById('login-title');
    const loginRole = document.getElementById('login-role');
    const doctorSelectorWrap = document.getElementById('doctor-selector-wrap');
    const hintBox = document.getElementById('credential-hint');
    
    const roleConfig = {
        admin: {
            title: 'Admin Portal Login',
            color: 'text-indigo-600',
            user: 'admin',
            pass: 'admin123',
            hint: 'Username: <span class="font-mono font-bold">admin</span> | Password: <span class="font-mono font-bold">admin123</span>'
        },
        doctor: {
            title: 'Doctor Portal Login',
            color: 'text-emerald-600',
            user: 'doctor',
            pass: 'doctor123',
            hint: 'Username: <span class="font-mono font-bold">doctor</span> (or <span class="font-mono">doctor1</span> / <span class="font-mono">doctor2</span>) | Password: <span class="font-mono font-bold">doctor123</span>'
        },
        receptionist: {
            title: 'Receptionist Desk Login',
            color: 'text-purple-600',
            user: 'receptionist',
            pass: 'rec123',
            hint: 'Username: <span class="font-mono font-bold">receptionist</span> | Password: <span class="font-mono font-bold">rec123</span>'
        }
    };

    const config = roleConfig[role] || roleConfig.admin;

    loginTitle.textContent = config.title;
    loginTitle.className = `text-2xl font-bold text-center ${config.color}`;
    loginRole.value = role;

    // Show doctor selection dropdown if doctor role
    if (doctorSelectorWrap) {
        if (role === 'doctor') {
            doctorSelectorWrap.classList.remove('hidden');
            populateDoctorSelector();
        } else {
            doctorSelectorWrap.classList.add('hidden');
        }
    }

    if (hintBox) {
        hintBox.innerHTML = config.hint;
    }

    // Prefill username for demo convenience
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = config.user;
    if (passwordInput) passwordInput.value = config.pass;

    loginForm.classList.remove('hidden');
}

function populateDoctorSelector() {
    const select = document.getElementById('doctor-profile-select');
    if (!select) return;

    // Use doctors from data.js or default DOCTOR_ACCOUNTS
    const docList = (typeof doctors !== 'undefined' && doctors.length > 0) ? doctors : DOCTOR_ACCOUNTS;

    select.innerHTML = docList.map(d => `
        <option value="${d.id}">${d.name} (${d.specialization})</option>
    `).join('');
}

function backToRoles() {
    const loginForm = document.getElementById('login-form');
    const loginOptions = document.getElementById('login-options');
    const errorMessage = document.getElementById('error-message');

    if (errorMessage) errorMessage.textContent = '';
    if (loginForm) loginForm.classList.add('hidden');
    if (loginOptions) loginOptions.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.getElementById('login-role').value;
        const errorMessage = document.getElementById('error-message');

        errorMessage.textContent = '';

        if (role === 'admin') {
            if (username === 'admin' && password === 'admin123') {
                sessionStorage.setItem('loggedInRole', 'admin');
                sessionStorage.setItem('loggedInUser', 'System Administrator');
                window.location.href = 'admin.html';
                return;
            }
        } else if (role === 'receptionist') {
            if (username === 'receptionist' && password === 'rec123') {
                sessionStorage.setItem('loggedInRole', 'receptionist');
                sessionStorage.setItem('loggedInUser', 'Front Desk Receptionist');
                window.location.href = 'receptionist.html';
                return;
            }
        } else if (role === 'doctor') {
            // Find doctor match by user or selector
            const doctorSelect = document.getElementById('doctor-profile-select');
            const selectedDocId = doctorSelect ? Number(doctorSelect.value) : 1;

            const matchedDoc = DOCTOR_ACCOUNTS.find(d => d.user === username && d.pass === password);
            if (matchedDoc || (username === 'doctor' && password === 'doctor123')) {
                // If generic 'doctor' username is used, respect the selected doctor profile from dropdown
                const finalDoctorId = (username === 'doctor' && selectedDocId) ? selectedDocId : (matchedDoc ? matchedDoc.id : selectedDocId);
                const docObj = (typeof doctors !== 'undefined' ? doctors.find(d => d.id === finalDoctorId) : null) || matchedDoc || DOCTOR_ACCOUNTS.find(d => d.id === finalDoctorId) || DOCTOR_ACCOUNTS[0];

                sessionStorage.setItem('loggedInRole', 'doctor');
                sessionStorage.setItem('loggedInDoctorId', String(finalDoctorId));
                sessionStorage.setItem('loggedInUser', docObj.name);
                window.location.href = 'doctor.html';
                return;
            }
        }

        errorMessage.textContent = 'Invalid credentials. Please verify your username and password.';
    });
});
