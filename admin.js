document.addEventListener('DOMContentLoaded', () => {
    // Basic security check
    if (sessionStorage.getItem('loggedInRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    setupPanelNavigation('admin');
    initializeAdminPanel();
});

// --- ADMIN PANEL SPECIFIC LOGIC ---
function initializeAdminPanel() {
    updateAdminDashboard();
    renderAdminManageDoctors();
    renderAdminManagePatients();
    renderAdminManageAppointments();
    renderAdminPharmacy();
}

function updateAdminDashboard() {
    document.getElementById('admin-doc-count').textContent = doctors.length;
    document.getElementById('admin-pat-count').textContent = patients.length;
    document.getElementById('admin-app-today-count').textContent = appointments.filter(a => a.date === today).length;
    document.getElementById('admin-med-count').textContent = medicines.length;
}

function renderAdminManageDoctors() {
    const section = document.getElementById('admin-manage-doctors');
    section.innerHTML = '';
    const doctorSection = createManagementSection({
        title: 'Manage Doctors',
        formFields: [
            { id: 'doc-name', type: 'text', placeholder: 'Dr. Name', label: 'Name' },
            { id: 'doc-spec', type: 'text', placeholder: 'Specialization', label: 'Specialization' }
        ],
        tableHeaders: ['ID', 'Name', 'Specialization'],
        data: doctors,
        dataItems: [{ key: 'id'}, {key: 'name'}, {key: 'specialization'}],
        onAdd: (e) => {
            e.preventDefault();
            const name = document.getElementById('doc-name').value;
            const spec = document.getElementById('doc-spec').value;
            if(name && spec) {
                doctors.push({ id: Date.now(), name, specialization: spec });
                renderAdminManageDoctors();
                updateAdminDashboard();
            }
        },
        onRemove: (e) => {
            const id = parseInt(e.target.dataset.id);
            doctors = doctors.filter(d => d.id !== id);
            renderAdminManageDoctors();
            updateAdminDashboard();
        }
    });
    section.appendChild(doctorSection);
}

function renderAdminManagePatients() {
    const section = document.getElementById('admin-manage-patients');
    section.innerHTML = '';
    section.appendChild(createManagementSection({
        title: 'Manage Patients',
        formFields: [
            { id: 'pat-name', type: 'text', placeholder: 'Patient Name', label: 'Name' },
            { id: 'pat-age', type: 'number', placeholder: 'Age', label: 'Age' },
            { id: 'pat-gender', type: 'select', label: 'Gender', options: [{value: 'Male', text: 'Male'}, {value: 'Female', text: 'Female'}, {value: 'Other', text: 'Other'}]}
        ],
        tableHeaders: ['ID', 'Name', 'Age', 'Gender', 'Date Registered'],
        data: patients,
        dataItems: [{key: 'id'}, {key: 'name'}, {key: 'age'}, {key: 'gender'}, {key: 'dateRegistered'}],
        onAdd: e => {
            e.preventDefault();
            const name = document.getElementById('pat-name').value;
            const age = document.getElementById('pat-age').value;
            const gender = document.getElementById('pat-gender').value;
            if(name && age && gender) {
                patients.push({ id: Date.now(), name, age, gender, dateRegistered: today });
                renderAdminManagePatients();
                updateAdminDashboard();
            }
        },
        onRemove: e => {
            patients = patients.filter(p => p.id !== parseInt(e.target.dataset.id));
            renderAdminManagePatients();
            updateAdminDashboard();
        }
    }));
}

function renderAdminManageAppointments() {
    const section = document.getElementById('admin-manage-appointments');
    section.innerHTML = '';
    section.appendChild(createManagementSection({
        title: 'Manage Appointments',
        formFields: [
            { id: 'app-patient', type: 'select', label: 'Patient', options: patients.map(p => ({value: p.id, text: p.name}))},
            { id: 'app-doctor', type: 'select', label: 'Doctor', options: doctors.map(d => ({value: d.id, text: d.name}))},
            { id: 'app-date', type: 'date', label: 'Date' },
            { id: 'app-time', type: 'time', label: 'Time' },
        ],
        tableHeaders: ['ID', 'Patient', 'Doctor', 'Date', 'Time'],
        data: appointments,
        dataItems: [
            {key: 'id'},
            {key: 'patientId', formatter: id => patients.find(p => p.id === id)?.name || 'N/A'},
            {key: 'doctorId', formatter: id => doctors.find(d => d.id === id)?.name || 'N/A'},
            {key: 'date'},
            {key: 'time'},
        ],
        onAdd: e => {
            e.preventDefault();
            const patientId = parseInt(document.getElementById('app-patient').value);
            const doctorId = parseInt(document.getElementById('app-doctor').value);
            const date = document.getElementById('app-date').value;
            const time = document.getElementById('app-time').value;
            if(patientId && doctorId && date && time) {
                appointments.push({ id: Date.now(), patientId, doctorId, date, time });
                renderAdminManageAppointments();
                updateAdminDashboard();
            }
        },
        onRemove: e => {
            appointments = appointments.filter(a => a.id !== parseInt(e.target.dataset.id));
            renderAdminManageAppointments();
            updateAdminDashboard();
        }
    }));
}

function renderAdminPharmacy() {
    const section = document.getElementById('admin-pharmacy');
    section.innerHTML = '';
    section.appendChild(createManagementSection({
        title: 'Pharmacy Inventory',
        formFields: [
            {id: 'med-name', type: 'text', placeholder: 'Medicine Name', label: 'Name'},
            {id: 'med-qty', type: 'number', placeholder: 'Quantity', label: 'Quantity'},
        ],
        tableHeaders: ['ID', 'Name', 'Quantity'],
        data: medicines,
        dataItems: [{key: 'id'}, {key: 'name'}, {key: 'quantity'}],
        onAdd: e => {
            e.preventDefault();
            const name = document.getElementById('med-name').value;
            const quantity = parseInt(document.getElementById('med-qty').value);
            if (name && quantity) {
                medicines.push({id: Date.now(), name, quantity});
                renderAdminPharmacy();
                updateAdminDashboard();
            }
        },
        onRemove: e => {
            medicines = medicines.filter(m => m.id !== parseInt(e.target.dataset.id));
            renderAdminPharmacy();
            updateAdminDashboard();
        }
    }));
}
