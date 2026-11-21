// ==========================================
// HOSPITAL MANAGEMENT SYSTEM - RECEPTIONIST LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Role verification
    if (sessionStorage.getItem('loggedInRole') !== 'receptionist') {
        window.location.href = 'index.html';
        return;
    }

    const userDisplay = document.getElementById('rec-user-display');
    if (userDisplay && sessionStorage.getItem('loggedInUser')) {
        userDisplay.textContent = sessionStorage.getItem('loggedInUser');
    }

    setupPanelNavigation('receptionist');
    initializeReceptionistPanel();
});

function initializeReceptionistPanel() {
    updateReceptionistDashboard();
    renderReceptionistManagePatients();
    renderReceptionistScheduleAppointments();
    renderReceptionistDoctorDirectory();
}

// --- DASHBOARD UPDATES ---
function updateReceptionistDashboard() {
    const todayRegCount = patients.filter(p => p.dateRegistered === today).length;
    const todayApps = appointments.filter(a => a.date === today && a.status !== 'Cancelled');
    
    const regCountEl = document.getElementById('rec-new-patients-today');
    const appCountEl = document.getElementById('rec-appointments-today');
    const docCountEl = document.getElementById('rec-doctors-available');

    if (regCountEl) regCountEl.textContent = todayRegCount;
    if (appCountEl) appCountEl.textContent = todayApps.length;
    if (docCountEl) docCountEl.textContent = doctors.length;

    // Check-in Board
    const boardBox = document.getElementById('rec-today-board');
    if (boardBox) {
        if (todayApps.length === 0) {
            boardBox.innerHTML = '<p class="text-xs text-gray-400 py-3">No patient appointments scheduled for today.</p>';
        } else {
            boardBox.innerHTML = todayApps.map(a => {
                const pat = getPatientById(a.patientId);
                const doc = getDoctorById(a.doctorId);
                return `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl gap-3">
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="font-bold text-gray-800 text-sm">${pat ? pat.name : 'Unknown Patient'}</span>
                                <span class="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">Assigned: ${doc ? doc.name : 'Doctor'}</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Time: <span class="font-semibold text-gray-700">${a.time}</span> • ${a.notes || 'Routine consultation'}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${a.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}">${a.status}</span>
                            ${a.status !== 'Completed' ? `
                                <button class="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700" onclick="receptionistMarkCompleted(${a.id})">
                                    Check In / Done
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function receptionistMarkCompleted(appId) {
    const app = appointments.find(a => Number(a.id) === Number(appId));
    if (app) {
        app.status = 'Completed';
        saveAllData();
        initializeReceptionistPanel();
        showToast(`Appointment #APT-${appId} marked Completed`, 'success');
    }
}

// --- 1. MANAGE PATIENTS ---
function renderReceptionistManagePatients() {
    const section = document.getElementById('receptionist-manage-patients');
    if (!section) return;
    section.innerHTML = '';

    const patientSection = createManagementSection({
        title: 'Patient Admissions & Directory',
        formFields: [
            { id: 'rec-pat-name', type: 'text', placeholder: 'Patient Full Name', label: 'Full Name' },
            { id: 'rec-pat-age', type: 'number', placeholder: 'Age', label: 'Age' },
            { id: 'rec-pat-gender', type: 'select', label: 'Gender', options: [{ value: 'Male', text: 'Male' }, { value: 'Female', text: 'Female' }, { value: 'Other', text: 'Other' }] },
            { id: 'rec-pat-blood', type: 'select', label: 'Blood Group', options: [{ value: 'A+', text: 'A+' }, { value: 'A-', text: 'A-' }, { value: 'B+', text: 'B+' }, { value: 'B-', text: 'B-' }, { value: 'O+', text: 'O+' }, { value: 'O-', text: 'O-' }, { value: 'AB+', text: 'AB+' }, { value: 'AB-', text: 'AB-' }] },
            { id: 'rec-pat-need', type: 'select', label: 'Primary Need', options: [{ value: 'OPD Consultation', text: '🩺 OPD Consultation' }, { value: 'Emergency Care', text: '🚨 Emergency Care' }, { value: 'Inpatient Admission', text: '🛏️ Inpatient Bed Admission' }, { value: 'Diagnostic / Lab', text: '🧪 Diagnostic / Lab' }, { value: 'Health Checkup', text: '🛡️ Health Checkup' }] },
            { id: 'rec-pat-dept', type: 'select', label: 'Department', options: [{ value: 'Cardiology', text: 'Cardiology' }, { value: 'Neurology', text: 'Neurology' }, { value: 'Pediatrics', text: 'Pediatrics' }, { value: 'Orthopedics', text: 'Orthopedics' }, { value: 'General Medicine', text: 'General Medicine' }, { value: 'Emergency', text: 'Emergency Medicine' }] },
            { id: 'rec-pat-priority', type: 'select', label: 'Urgency Priority', options: [{ value: 'Routine', text: '🟢 Routine' }, { value: 'Urgent', text: '🟡 Urgent' }, { value: 'Emergency', text: '🔴 Emergency' }] },
            { id: 'rec-pat-bed', type: 'select', label: 'Bed Preference', options: [{ value: 'None (Outpatient)', text: 'None (Outpatient)' }, { value: 'General Ward', text: 'General Ward' }, { value: 'Semi-Private Room', text: 'Semi-Private Room' }, { value: 'Private AC Suite', text: 'Private AC Suite' }, { value: 'ICU Bed', text: 'ICU Bed' }] },
            { id: 'rec-pat-phone', type: 'text', placeholder: '+1 555-0200', label: 'Phone' },
            { id: 'rec-pat-assistance', type: 'select', label: 'Assistance Needed', options: [{ value: 'None', text: 'None (Ambulatory)' }, { value: 'Wheelchair Needed', text: '🦽 Wheelchair Needed' }, { value: 'Stretcher Required', text: '🛏️ Stretcher Required' }, { value: 'Oxygen Support', text: '💨 Oxygen Support' }, { value: 'Language Interpreter', text: '🗣️ Language Interpreter' }] },
            { id: 'rec-pat-allergies', type: 'text', placeholder: 'Known Allergies / History', label: 'Medical Notes' }
        ],
        tableHeaders: ['Patient ID', 'Name & Phone', 'Age / Gender', 'Blood Group', 'Chosen Care Need', 'Priority', 'Bed & Assistance', 'Allergies', 'Registered Date'],
        data: patients,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#PAT-${id}</span>` },
            { key: 'name', formatter: (name, item) => `
                <div>
                    <span class="font-semibold text-gray-900 block">${name}</span>
                    <span class="text-xs text-gray-400 block">${item.phone || 'No phone'}</span>
                </div>
            ` },
            { key: 'age', formatter: (age, item) => `${age} yrs • ${item.gender}` },
            { key: 'bloodGroup', formatter: bg => `<span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-md bg-rose-50 text-rose-700">${bg || 'N/A'}</span>` },
            { key: 'careNeed', formatter: (need, item) => `
                <div>
                    <span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700">${need || 'OPD Consultation'}</span>
                    <span class="text-[11px] text-gray-500 block mt-0.5">${item.department || 'General Medicine'}</span>
                </div>
            ` },
            { key: 'priority', formatter: prio => {
                const color = prio === 'Emergency' ? 'bg-rose-100 text-rose-800 border-rose-300' : (prio === 'Urgent' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200');
                return `<span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-md border ${color}">${prio || 'Routine'}</span>`;
            } },
            { key: 'bedPreference', formatter: (bed, item) => `
                <div class="text-xs">
                    <span class="font-semibold text-gray-700 block">${bed || 'None (Outpatient)'}</span>
                    <span class="text-[11px] text-indigo-600 block">${item.assistance || 'Standard'}</span>
                </div>
            ` },
            { key: 'allergies', formatter: all => all && all !== 'None' ? `<span class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">${all}</span>` : '<span class="text-xs text-gray-400">None</span>' },
            { key: 'dateRegistered', formatter: d => d || today }
        ],
        onAdd: (e) => {
            e.preventDefault();
            const name = document.getElementById('rec-pat-name').value.trim();
            const age = parseInt(document.getElementById('rec-pat-age').value);
            const gender = document.getElementById('rec-pat-gender').value;
            const bloodGroup = document.getElementById('rec-pat-blood').value || 'O+';
            const careNeed = document.getElementById('rec-pat-need').value || 'OPD Consultation';
            const department = document.getElementById('rec-pat-dept').value || 'General Medicine';
            const priority = document.getElementById('rec-pat-priority').value || 'Routine';
            const bedPreference = document.getElementById('rec-pat-bed').value || 'None (Outpatient)';
            const phone = document.getElementById('rec-pat-phone').value.trim();
            const assistance = document.getElementById('rec-pat-assistance').value || 'None';
            const allergies = document.getElementById('rec-pat-allergies').value.trim();

            if (!name || isNaN(age)) {
                showToast('Please provide valid patient name and age', 'warning');
                return;
            }

            const newPatient = {
                id: Date.now(),
                name,
                age,
                gender,
                bloodGroup,
                careNeed,
                department,
                priority,
                bedPreference,
                phone: phone || '+1 555-0000',
                assistance,
                allergies: allergies || 'None',
                dateRegistered: today
            };

            patients.push(newPatient);

            // Auto-schedule appointment / queue ticket if OPD or Emergency
            if (careNeed === 'OPD Consultation' || careNeed === 'Emergency Care') {
                const assignedDocId = department === 'Cardiology' ? 1 : (department === 'Neurology' ? 2 : (department === 'Pediatrics' ? 3 : 4));
                const newApp = {
                    id: Date.now() + 1,
                    patientId: newPatient.id,
                    doctorId: assignedDocId,
                    date: today,
                    time: priority === 'Emergency' ? 'IMMEDIATE' : '11:30 AM',
                    status: priority === 'Emergency' ? 'In Progress' : 'Scheduled',
                    notes: `[${careNeed}] Registered according to clinical need (${department})`
                };
                appointments.push(newApp);
            }

            saveAllData();
            initializeReceptionistPanel();
            showToast(`Patient ${newPatient.name} registered for ${newPatient.careNeed} (${newPatient.department})`, 'success');
        },
        onEdit: (e) => {
            const id = Number(e.target.dataset.id);
            const pat = getPatientById(id);
            if (!pat) return;

            showModal({
                title: `Edit Patient Information: ${pat.name}`,
                bodyHtml: `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Full Name</label>
                            <input type="text" id="edit-rec-pat-name" value="${pat.name}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Age</label>
                                <input type="number" id="edit-rec-pat-age" value="${pat.age}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Gender</label>
                                <select id="edit-rec-pat-gender" class="w-full px-3 py-2 text-sm border rounded-lg">
                                    <option value="Male" ${pat.gender === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="Female" ${pat.gender === 'Female' ? 'selected' : ''}>Female</option>
                                    <option value="Other" ${pat.gender === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Blood Group</label>
                                <input type="text" id="edit-rec-pat-blood" value="${pat.bloodGroup || 'O+'}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Phone</label>
                                <input type="text" id="edit-rec-pat-phone" value="${pat.phone || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Care Need</label>
                                <select id="edit-rec-pat-need" class="w-full px-3 py-2 text-sm border rounded-lg">
                                    <option value="OPD Consultation" ${pat.careNeed === 'OPD Consultation' ? 'selected' : ''}>OPD Consultation</option>
                                    <option value="Emergency Care" ${pat.careNeed === 'Emergency Care' ? 'selected' : ''}>Emergency Care</option>
                                    <option value="Inpatient Admission" ${pat.careNeed === 'Inpatient Admission' ? 'selected' : ''}>Inpatient Admission</option>
                                    <option value="Diagnostic / Lab" ${pat.careNeed === 'Diagnostic / Lab' ? 'selected' : ''}>Diagnostic / Lab</option>
                                    <option value="Health Checkup" ${pat.careNeed === 'Health Checkup' ? 'selected' : ''}>Health Checkup</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Priority</label>
                                <select id="edit-rec-pat-priority" class="w-full px-3 py-2 text-sm border rounded-lg">
                                    <option value="Routine" ${pat.priority === 'Routine' ? 'selected' : ''}>Routine</option>
                                    <option value="Urgent" ${pat.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                                    <option value="Emergency" ${pat.priority === 'Emergency' ? 'selected' : ''}>Emergency</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Allergies / Medical Notes</label>
                            <input type="text" id="edit-rec-pat-allergies" value="${pat.allergies || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                    </div>
                `,
                confirmText: 'Save Changes',
                onConfirm: () => {
                    pat.name = document.getElementById('edit-rec-pat-name').value.trim();
                    pat.age = parseInt(document.getElementById('edit-rec-pat-age').value) || pat.age;
                    pat.gender = document.getElementById('edit-rec-pat-gender').value;
                    pat.bloodGroup = document.getElementById('edit-rec-pat-blood').value.trim();
                    pat.phone = document.getElementById('edit-rec-pat-phone').value.trim();
                    pat.careNeed = document.getElementById('edit-rec-pat-need').value;
                    pat.priority = document.getElementById('edit-rec-pat-priority').value;
                    pat.allergies = document.getElementById('edit-rec-pat-allergies').value.trim();
                    saveAllData();
                    initializeReceptionistPanel();
                    showToast('Patient details updated', 'success');
                    return true;
                }
            });
        },
        onRemove: (e) => {
            const id = Number(e.target.dataset.id);
            const pat = getPatientById(id);
            const patName = pat ? pat.name : 'this patient';

            showConfirmDelete(patName, () => {
                patients = patients.filter(p => p.id !== id);
                saveAllData();
                initializeReceptionistPanel();
                showToast(`Removed patient ${patName}`, 'info');
            });
        }
    });

    section.appendChild(patientSection);
}

// --- 2. SCHEDULE APPOINTMENTS ---
function renderReceptionistScheduleAppointments() {
    const section = document.getElementById('receptionist-schedule-appointments');
    if (!section) return;
    section.innerHTML = '';

    const appSection = createManagementSection({
        title: 'Appointment Booking & Schedules',
        formFields: [
            { id: 'rec-app-patient', type: 'select', label: 'Select Patient', options: patients.map(p => ({ value: p.id, text: `${p.name} (#PAT-${p.id})` })) },
            { id: 'rec-app-doctor', type: 'select', label: 'Select Doctor', options: doctors.map(d => ({ value: d.id, text: `${d.name} (${d.specialization})` })) },
            { id: 'rec-app-date', type: 'date', label: 'Appointment Date' },
            { id: 'rec-app-time', type: 'text', placeholder: 'e.g. 10:00 AM', label: 'Time' },
            { id: 'rec-app-notes', type: 'text', placeholder: 'Reason for visit', label: 'Visit Reason' }
        ],
        tableHeaders: ['Appt ID', 'Patient', 'Attending Doctor', 'Date & Time', 'Status', 'Reason'],
        data: appointments,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#APT-${id}</span>` },
            { key: 'patientId', formatter: (id) => {
                const pat = getPatientById(id);
                return pat ? `<span class="font-medium text-gray-900">${pat.name}</span>` : 'Unknown';
            } },
            { key: 'doctorId', formatter: (id) => {
                const doc = getDoctorById(id);
                return doc ? `<span class="text-purple-600 font-medium">${doc.name}</span>` : 'Unknown';
            } },
            { key: 'date', formatter: (d, item) => `${d} • <span class="font-semibold text-gray-700">${item.time}</span>` },
            { key: 'status', formatter: st => {
                const statusStyles = {
                    Scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                };
                return `<span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${statusStyles[st] || 'bg-gray-100'}">${st || 'Scheduled'}</span>`;
            } },
            { key: 'notes', formatter: n => `<span class="text-xs text-gray-500">${n || 'Consultation'}</span>` }
        ],
        actionButtons: [
            {
                label: 'Complete',
                colorClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                handler: (id) => receptionistMarkCompleted(id)
            }
        ],
        onAdd: (e) => {
            e.preventDefault();
            const patientId = parseInt(document.getElementById('rec-app-patient').value);
            const doctorId = parseInt(document.getElementById('rec-app-doctor').value);
            const date = document.getElementById('rec-app-date').value;
            const time = document.getElementById('rec-app-time').value.trim();
            const notes = document.getElementById('rec-app-notes').value.trim();

            if (!patientId || !doctorId || !date || !time) {
                showToast('Please complete all appointment fields', 'warning');
                return;
            }

            // Conflict check
            const hasConflict = appointments.some(a => 
                a.doctorId === doctorId && 
                a.date === date && 
                a.time.toLowerCase() === time.toLowerCase() && 
                a.status !== 'Cancelled'
            );

            if (hasConflict) {
                showToast('Conflict: This doctor is already booked at this time slot!', 'error');
                return;
            }

            const newApp = {
                id: Date.now(),
                patientId,
                doctorId,
                date,
                time,
                status: 'Scheduled',
                notes: notes || 'General Visit'
            };

            appointments.push(newApp);
            saveAllData();
            initializeReceptionistPanel();
            showToast('Appointment booked successfully!', 'success');
        },
        onEdit: (e) => {
            const id = Number(e.target.dataset.id);
            const app = appointments.find(a => a.id === id);
            if (!app) return;

            showModal({
                title: `Modify Appointment #APT-${id}`,
                bodyHtml: `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Status</label>
                            <select id="edit-rec-app-status" class="w-full px-3 py-2 text-sm border rounded-lg">
                                <option value="Scheduled" ${app.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                                <option value="Completed" ${app.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Cancelled" ${app.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Date</label>
                                <input type="date" id="edit-rec-app-date" value="${app.date}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Time</label>
                                <input type="text" id="edit-rec-app-time" value="${app.time}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Reason / Notes</label>
                            <input type="text" id="edit-rec-app-notes" value="${app.notes || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                    </div>
                `,
                confirmText: 'Save Changes',
                onConfirm: () => {
                    app.status = document.getElementById('edit-rec-app-status').value;
                    app.date = document.getElementById('edit-rec-app-date').value;
                    app.time = document.getElementById('edit-rec-app-time').value.trim();
                    app.notes = document.getElementById('edit-rec-app-notes').value.trim();
                    saveAllData();
                    initializeReceptionistPanel();
                    showToast('Appointment updated', 'success');
                    return true;
                }
            });
        },
        onRemove: (e) => {
            const id = Number(e.target.dataset.id);
            showConfirmDelete(`Appointment #APT-${id}`, () => {
                appointments = appointments.filter(a => a.id !== id);
                saveAllData();
                initializeReceptionistPanel();
                showToast(`Appointment #APT-${id} cancelled and removed`, 'info');
            });
        }
    });

    section.appendChild(appSection);
}

// --- 3. DOCTOR DIRECTORY ---
function renderReceptionistDoctorDirectory() {
    const section = document.getElementById('receptionist-doctor-directory');
    if (!section) return;
    section.innerHTML = '';

    const dirSection = createManagementSection({
        title: 'Hospital Doctor Directory',
        tableHeaders: ['Doctor ID', 'Doctor Name', 'Department / Specialty', 'Contact Phone', 'Email'],
        data: doctors,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#DOC-${id}</span>` },
            { key: 'name', formatter: name => `<span class="font-bold text-gray-900">${name}</span>` },
            { key: 'specialization', formatter: spec => `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700">${spec}</span>` },
            { key: 'phone', formatter: p => p || 'N/A' },
            { key: 'email', formatter: em => `<span class="text-xs text-gray-500">${em || 'N/A'}</span>` }
        ],
        actionButtons: [
            {
                label: 'Book',
                colorClass: 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
                handler: (docId) => {
                    const appLink = document.querySelector('.receptionist-link[href="#schedule-appointments"]');
                    if (appLink) appLink.click();
                    setTimeout(() => {
                        const docSelect = document.getElementById('rec-app-doctor');
                        if (docSelect) docSelect.value = docId;
                    }, 50);
                }
            }
        ]
    });

    section.appendChild(dirSection);
}
