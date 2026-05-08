document.addEventListener('DOMContentLoaded', () => {
    // Basic security check
    if (sessionStorage.getItem('loggedInRole') !== 'receptionist') {
        window.location.href = 'index.html';
        return;
    }

    setupPanelNavigation('receptionist');
    initializeReceptionistPanel();
});

// --- RECEPTIONIST PANEL SPECIFIC LOGIC ---
function initializeReceptionistPanel() {
    updateReceptionistDashboard();
    renderReceptionistManagePatients();
    renderReceptionistScheduleAppointments();
}

function updateReceptionistDashboard() {
    document.getElementById('rec-new-patients-today').textContent = patients.filter(p => p.dateRegistered === today).length;
    document.getElementById('rec-appointments-today').textContent = appointments.filter(a => a.date === today).length;
}

function renderReceptionistManagePatients() {
    // Receptionist shares patient management with admin. We can reuse the logic.
    const section = document.getElementById('receptionist-manage-patients');
    section.innerHTML = '';
    section.appendChild(createManagementSection({
        title: 'Manage Patients',
        formFields: [
            { id: 'rec-pat-name', type: 'text', placeholder: 'Patient Name', label: 'Name' },
            { id: 'rec-pat-age', type: 'number', placeholder: 'Age', label: 'Age' },
            { id: 'rec-pat-gender', type: 'select', label: 'Gender', options: [{value: 'Male', text: 'Male'}, {value: 'Female', text: 'Female'}, {value: 'Other', text: 'Other'}]}
        ],
        tableHeaders: ['ID', 'Name', 'Age', 'Gender', 'Date Registered'],
        data: patients,
        dataItems: [{key: 'id'}, {key: 'name'}, {key: 'age'}, {key: 'gender'}, {key: 'dateRegistered'}],
        onAdd: e => {
            e.preventDefault();
            const name = document.getElementById('rec-pat-name').value;
            const age = document.getElementById('rec-pat-age').value;
            const gender = document.getElementById('rec-pat-gender').value;
            if(name && age && gender) {
                patients.push({ id: Date.now(), name, age, gender, dateRegistered: today });
                renderReceptionistManagePatients();
                updateReceptionistDashboard();
            }
        },
        onRemove: e => {
            patients = patients.filter(p => p.id !== parseInt(e.target.dataset.id));
            renderReceptionistManagePatients();
            updateReceptionistDashboard();
        }
    }));
}

function renderReceptionistScheduleAppointments() {
    // Receptionist shares appointment scheduling with admin.
    const section = document.getElementById('receptionist-schedule-appointments');
    section.innerHTML = '';
    section.appendChild(createManagementSection({
        title: 'Schedule Appointments',
        formFields: [
            { id: 'rec-app-patient', type: 'select', label: 'Patient', options: patients.map(p => ({value: p.id, text: p.name}))},
            { id: 'rec-app-doctor', type: 'select', label: 'Doctor', options: doctors.map(d => ({value: d.id, text: d.name}))},
            { id: 'rec-app-date', type: 'date', label: 'Date' },
            { id: 'rec-app-time', type: 'time', label: 'Time' },
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
            const patientId = parseInt(document.getElementById('rec-app-patient').value);
            const doctorId = parseInt(document.getElementById('rec-app-doctor').value);
            const date = document.getElementById('rec-app-date').value;
            const time = document.getElementById('rec-app-time').value;
            if(patientId && doctorId && date && time) {
                appointments.push({ id: Date.now(), patientId, doctorId, date, time });
                renderReceptionistScheduleAppointments();
                updateReceptionistDashboard();
            }
        },
        onRemove: e => {
            appointments = appointments.filter(a => a.id !== parseInt(e.target.dataset.id));
            renderReceptionistScheduleAppointments();
            updateReceptionistDashboard();
        }
    }));
}

