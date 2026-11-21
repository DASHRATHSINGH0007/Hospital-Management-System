// ==========================================
// HOSPITAL MANAGEMENT SYSTEM - ADMIN LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Role verification
    if (sessionStorage.getItem('loggedInRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const userDisplay = document.getElementById('admin-user-display');
    if (userDisplay && sessionStorage.getItem('loggedInUser')) {
        userDisplay.textContent = sessionStorage.getItem('loggedInUser');
    }

    const resetBtn = document.getElementById('admin-reset-db-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            showModal({
                title: 'Reset Demo Data',
                bodyHtml: '<p>Are you sure you want to reset all records back to default factory seed data? Any new additions will be cleared.</p>',
                confirmText: 'Reset Data',
                confirmClass: 'bg-rose-600 hover:bg-rose-700',
                onConfirm: () => {
                    resetDatabase();
                    initializeAdminPanel();
                    showToast('Database reset to defaults!', 'info');
                    return true;
                }
            });
        });
    }

    setupPanelNavigation('admin');
    initializeAdminPanel();
});

function initializeAdminPanel() {
    updateAdminDashboard();
    renderAdminManageDoctors();
    renderAdminManagePatients();
    renderAdminManageAppointments();
    renderAdminPharmacy();
    renderAdminPrescriptions();
}

// --- DASHBOARD UPDATES ---
function updateAdminDashboard() {
    const docCountEl = document.getElementById('admin-doc-count');
    const patCountEl = document.getElementById('admin-pat-count');
    const appCountEl = document.getElementById('admin-app-today-count');
    const medCountEl = document.getElementById('admin-med-count');
    const lowStockCountEl = document.getElementById('admin-low-stock-count');

    if (docCountEl) docCountEl.textContent = doctors.length;
    if (patCountEl) patCountEl.textContent = patients.length;
    
    const todayApps = appointments.filter(a => a.date === today && a.status !== 'Cancelled');
    if (appCountEl) appCountEl.textContent = todayApps.length;
    if (medCountEl) medCountEl.textContent = medicines.length;

    // Low stock count
    const lowStockMeds = medicines.filter(m => m.quantity <= (m.minThreshold || 30));
    if (lowStockCountEl) {
        lowStockCountEl.textContent = `${lowStockMeds.length} Low Stock Alert${lowStockMeds.length === 1 ? '' : 's'}`;
    }

    // Dashboard Alerts: Stock Box
    const stockAlertsBox = document.getElementById('admin-dashboard-stock-alerts');
    if (stockAlertsBox) {
        if (lowStockMeds.length === 0) {
            stockAlertsBox.innerHTML = '<p class="text-xs text-emerald-600 font-medium">All medicines are adequately stocked.</p>';
        } else {
            stockAlertsBox.innerHTML = lowStockMeds.map(m => `
                <div class="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                    <div>
                        <p class="font-semibold text-gray-800 text-xs">${m.name}</p>
                        <p class="text-[11px] text-gray-500">Threshold: ${m.minThreshold || 30} units</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-800">${m.quantity} left</span>
                </div>
            `).join('');
        }
    }

    // Dashboard Alerts: Today's Appointments Box
    const todayAppsBox = document.getElementById('admin-dashboard-today-apps');
    if (todayAppsBox) {
        if (todayApps.length === 0) {
            todayAppsBox.innerHTML = '<p class="text-xs text-gray-400">No appointments scheduled for today.</p>';
        } else {
            todayAppsBox.innerHTML = todayApps.map(a => {
                const pat = getPatientById(a.patientId);
                const doc = getDoctorById(a.doctorId);
                return `
                    <div class="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <div>
                            <p class="font-semibold text-gray-800 text-xs">${pat ? pat.name : 'Unknown Patient'} with ${doc ? doc.name : 'Unknown Doctor'}</p>
                            <p class="text-[11px] text-gray-500">Time: ${a.time} • ${a.notes || 'Routine consultation'}</p>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${a.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}">${a.status}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

// --- 1. MANAGE DOCTORS ---
function renderAdminManageDoctors() {
    const section = document.getElementById('admin-manage-doctors');
    if (!section) return;
    section.innerHTML = '';

    const doctorSection = createManagementSection({
        title: 'Manage Doctors',
        formFields: [
            { id: 'doc-name', type: 'text', placeholder: 'Dr. Full Name', label: 'Doctor Name' },
            { id: 'doc-spec', type: 'text', placeholder: 'e.g. Cardiology', label: 'Specialization' },
            { id: 'doc-phone', type: 'text', placeholder: '+1 555-0100', label: 'Contact Phone' },
            { id: 'doc-email', type: 'email', placeholder: 'doctor@hospital.com', label: 'Email Address' }
        ],
        tableHeaders: ['Doctor ID', 'Name & Email', 'Specialization', 'Phone Contact'],
        data: doctors,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#DOC-${id}</span>` },
            { key: 'name', formatter: (name, item) => `
                <div>
                    <span class="font-semibold text-gray-900 block">${name}</span>
                    <span class="text-xs text-gray-400 block">${item.email || 'N/A'}</span>
                </div>
            ` },
            { key: 'specialization', formatter: spec => `<span class="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">${spec}</span>` },
            { key: 'phone', formatter: p => p || 'N/A' }
        ],
        onAdd: (e) => {
            e.preventDefault();
            const name = document.getElementById('doc-name').value.trim();
            const spec = document.getElementById('doc-spec').value.trim();
            const phone = document.getElementById('doc-phone').value.trim();
            const email = document.getElementById('doc-email').value.trim();

            if (!name || !spec) {
                showToast('Please fill in doctor name and specialization', 'warning');
                return;
            }

            const newDoc = {
                id: Date.now(),
                name,
                specialization: spec,
                phone: phone || '+1 555-0000',
                email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.com`
            };

            doctors.push(newDoc);
            saveAllData();
            initializeAdminPanel();
            showToast(`Added ${newDoc.name} to staff`, 'success');
        },
        onEdit: (e) => {
            const id = Number(e.target.dataset.id);
            const doc = getDoctorById(id);
            if (!doc) return;

            showModal({
                title: `Edit Doctor Profile: ${doc.name}`,
                bodyHtml: `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Doctor Name</label>
                            <input type="text" id="edit-doc-name" value="${doc.name}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Specialization</label>
                            <input type="text" id="edit-doc-spec" value="${doc.specialization}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Phone</label>
                            <input type="text" id="edit-doc-phone" value="${doc.phone || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Email</label>
                            <input type="email" id="edit-doc-email" value="${doc.email || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                    </div>
                `,
                confirmText: 'Save Changes',
                onConfirm: () => {
                    const newName = document.getElementById('edit-doc-name').value.trim();
                    const newSpec = document.getElementById('edit-doc-spec').value.trim();
                    if (!newName || !newSpec) {
                        showToast('Name and Specialization are required', 'warning');
                        return false;
                    }
                    doc.name = newName;
                    doc.specialization = newSpec;
                    doc.phone = document.getElementById('edit-doc-phone').value.trim();
                    doc.email = document.getElementById('edit-doc-email').value.trim();
                    saveAllData();
                    initializeAdminPanel();
                    showToast('Doctor profile updated successfully', 'success');
                    return true;
                }
            });
        },
        onRemove: (e) => {
            const id = Number(e.target.dataset.id);
            const doc = getDoctorById(id);
            const docName = doc ? doc.name : 'this doctor';

            showConfirmDelete(docName, () => {
                doctors = doctors.filter(d => d.id !== id);
                saveAllData();
                initializeAdminPanel();
                showToast(`Removed ${docName}`, 'info');
            });
        }
    });

    section.appendChild(doctorSection);
}

// --- 2. MANAGE PATIENTS ---
function renderAdminManagePatients() {
    const section = document.getElementById('admin-manage-patients');
    if (!section) return;
    section.innerHTML = '';

    const patientSection = createManagementSection({
        title: 'Manage Patients',
        formFields: [
            { id: 'pat-name', type: 'text', placeholder: 'Patient Full Name', label: 'Full Name' },
            { id: 'pat-age', type: 'number', placeholder: 'Age', label: 'Age' },
            { id: 'pat-gender', type: 'select', label: 'Gender', options: [{ value: 'Male', text: 'Male' }, { value: 'Female', text: 'Female' }, { value: 'Other', text: 'Other' }] },
            { id: 'pat-blood', type: 'select', label: 'Blood Group', options: [{ value: 'A+', text: 'A+' }, { value: 'A-', text: 'A-' }, { value: 'B+', text: 'B+' }, { value: 'B-', text: 'B-' }, { value: 'O+', text: 'O+' }, { value: 'O-', text: 'O-' }, { value: 'AB+', text: 'AB+' }, { value: 'AB-', text: 'AB-' }] },
            { id: 'pat-need', type: 'select', label: 'Care Need', options: [{ value: 'OPD Consultation', text: '🩺 OPD Consultation' }, { value: 'Emergency Care', text: '🚨 Emergency Care' }, { value: 'Inpatient Admission', text: '🛏️ Inpatient Bed Admission' }, { value: 'Diagnostic / Lab', text: '🧪 Diagnostic / Lab' }, { value: 'Health Checkup', text: '🛡️ Health Checkup' }] },
            { id: 'pat-dept', type: 'select', label: 'Department', options: [{ value: 'Cardiology', text: 'Cardiology' }, { value: 'Neurology', text: 'Neurology' }, { value: 'Pediatrics', text: 'Pediatrics' }, { value: 'Orthopedics', text: 'Orthopedics' }, { value: 'General Medicine', text: 'General Medicine' }, { value: 'Emergency', text: 'Emergency Medicine' }] },
            { id: 'pat-priority', type: 'select', label: 'Priority', options: [{ value: 'Routine', text: '🟢 Routine' }, { value: 'Urgent', text: '🟡 Urgent' }, { value: 'Emergency', text: '🔴 Emergency' }] },
            { id: 'pat-phone', type: 'text', placeholder: '+1 555-0200', label: 'Phone' },
            { id: 'pat-allergies', type: 'text', placeholder: 'e.g. Penicillin, None', label: 'Allergies / Notes' }
        ],
        tableHeaders: ['Patient ID', 'Name & Phone', 'Age / Gender', 'Blood Group', 'Care Need & Dept', 'Priority', 'Allergies', 'Registered'],
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
                    <span class="text-[11px] text-gray-500 block mt-0.5">${item.department || 'General'}</span>
                </div>
            ` },
            { key: 'priority', formatter: prio => {
                const color = prio === 'Emergency' ? 'bg-rose-100 text-rose-800 border-rose-300' : (prio === 'Urgent' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200');
                return `<span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-md border ${color}">${prio || 'Routine'}</span>`;
            } },
            { key: 'allergies', formatter: all => all ? `<span class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">${all}</span>` : '<span class="text-xs text-gray-400">None</span>' },
            { key: 'dateRegistered', formatter: d => d || today }
        ],
        onAdd: (e) => {
            e.preventDefault();
            const name = document.getElementById('pat-name').value.trim();
            const age = parseInt(document.getElementById('pat-age').value);
            const gender = document.getElementById('pat-gender').value;
            const bloodGroup = document.getElementById('pat-blood').value || 'O+';
            const careNeed = document.getElementById('pat-need').value || 'OPD Consultation';
            const department = document.getElementById('pat-dept').value || 'General Medicine';
            const priority = document.getElementById('pat-priority').value || 'Routine';
            const phone = document.getElementById('pat-phone').value.trim();
            const allergies = document.getElementById('pat-allergies').value.trim();

            if (!name || isNaN(age)) {
                showToast('Please provide valid patient details', 'warning');
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
                bedPreference: 'None (Outpatient)',
                phone: phone || '+1 555-0000',
                allergies: allergies || 'None',
                dateRegistered: today
            };

            patients.push(newPatient);
            saveAllData();
            initializeAdminPanel();
            showToast(`Patient ${newPatient.name} registered`, 'success');
        },
        onEdit: (e) => {
            const id = Number(e.target.dataset.id);
            const pat = getPatientById(id);
            if (!pat) return;

            showModal({
                title: `Edit Patient Record: ${pat.name}`,
                bodyHtml: `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Full Name</label>
                            <input type="text" id="edit-pat-name" value="${pat.name}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Age</label>
                                <input type="number" id="edit-pat-age" value="${pat.age}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Gender</label>
                                <select id="edit-pat-gender" class="w-full px-3 py-2 text-sm border rounded-lg">
                                    <option value="Male" ${pat.gender === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="Female" ${pat.gender === 'Female' ? 'selected' : ''}>Female</option>
                                    <option value="Other" ${pat.gender === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Blood Group</label>
                                <input type="text" id="edit-pat-blood" value="${pat.bloodGroup || 'O+'}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Phone</label>
                                <input type="text" id="edit-pat-phone" value="${pat.phone || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Allergies / Medical Notes</label>
                            <input type="text" id="edit-pat-allergies" value="${pat.allergies || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                    </div>
                `,
                confirmText: 'Save Patient',
                onConfirm: () => {
                    pat.name = document.getElementById('edit-pat-name').value.trim();
                    pat.age = parseInt(document.getElementById('edit-pat-age').value) || pat.age;
                    pat.gender = document.getElementById('edit-pat-gender').value;
                    pat.bloodGroup = document.getElementById('edit-pat-blood').value.trim();
                    pat.phone = document.getElementById('edit-pat-phone').value.trim();
                    pat.allergies = document.getElementById('edit-pat-allergies').value.trim();
                    saveAllData();
                    initializeAdminPanel();
                    showToast('Patient record updated', 'success');
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
                initializeAdminPanel();
                showToast(`Removed patient ${patName}`, 'info');
            });
        }
    });

    section.appendChild(patientSection);
}

// --- 3. MANAGE APPOINTMENTS ---
function renderAdminManageAppointments() {
    const section = document.getElementById('admin-manage-appointments');
    if (!section) return;
    section.innerHTML = '';

    const appSection = createManagementSection({
        title: 'Manage Appointments',
        formFields: [
            { id: 'app-patient', type: 'select', label: 'Patient', options: patients.map(p => ({ value: p.id, text: `${p.name} (#PAT-${p.id})` })) },
            { id: 'app-doctor', type: 'select', label: 'Doctor', options: doctors.map(d => ({ value: d.id, text: `${d.name} (${d.specialization})` })) },
            { id: 'app-date', type: 'date', label: 'Date' },
            { id: 'app-time', type: 'text', placeholder: 'e.g. 10:30 AM', label: 'Time' },
            { id: 'app-notes', type: 'text', placeholder: 'Reason / Symptom', label: 'Consultation Reason' }
        ],
        tableHeaders: ['Appt ID', 'Patient', 'Doctor', 'Date & Time', 'Status', 'Reason'],
        data: appointments,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#APT-${id}</span>` },
            { key: 'patientId', formatter: (id) => {
                const pat = getPatientById(id);
                return pat ? `<span class="font-medium text-gray-900">${pat.name}</span>` : '<span class="text-gray-400">Unknown</span>';
            } },
            { key: 'doctorId', formatter: (id) => {
                const doc = getDoctorById(id);
                return doc ? `<span class="text-indigo-600 font-medium">${doc.name}</span>` : '<span class="text-gray-400">Unknown</span>';
            } },
            { key: 'date', formatter: (d, item) => `${d} • <span class="font-semibold text-gray-700">${item.time}</span>` },
            { key: 'status', formatter: st => {
                const statusStyles = {
                    Scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                };
                return `<span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${statusStyles[st] || 'bg-gray-100 text-gray-700'}">${st || 'Scheduled'}</span>`;
            } },
            { key: 'notes', formatter: n => `<span class="text-xs text-gray-500">${n || 'Consultation'}</span>` }
        ],
        actionButtons: [
            {
                label: 'Complete',
                colorClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                handler: (id) => {
                    const app = appointments.find(a => Number(a.id) === Number(id));
                    if (app) {
                        app.status = 'Completed';
                        saveAllData();
                        initializeAdminPanel();
                        showToast(`Appointment #APT-${id} marked Completed`, 'success');
                    }
                }
            }
        ],
        onAdd: (e) => {
            e.preventDefault();
            const patientId = parseInt(document.getElementById('app-patient').value);
            const doctorId = parseInt(document.getElementById('app-doctor').value);
            const date = document.getElementById('app-date').value;
            const time = document.getElementById('app-time').value.trim();
            const notes = document.getElementById('app-notes').value.trim();

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
                showToast('Scheduling Conflict! Doctor is already booked at that date and time.', 'error');
                return;
            }

            const newApp = {
                id: Date.now(),
                patientId,
                doctorId,
                date,
                time,
                status: 'Scheduled',
                notes: notes || 'General Consultation'
            };

            appointments.push(newApp);
            saveAllData();
            initializeAdminPanel();
            showToast('Appointment successfully scheduled!', 'success');
        },
        onEdit: (e) => {
            const id = Number(e.target.dataset.id);
            const app = appointments.find(a => a.id === id);
            if (!app) return;

            showModal({
                title: `Edit Appointment #APT-${id}`,
                bodyHtml: `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Status</label>
                            <select id="edit-app-status" class="w-full px-3 py-2 text-sm border rounded-lg">
                                <option value="Scheduled" ${app.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                                <option value="Completed" ${app.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Cancelled" ${app.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Date</label>
                                <input type="date" id="edit-app-date" value="${app.date}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Time</label>
                                <input type="text" id="edit-app-time" value="${app.time}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Consultation Reason / Notes</label>
                            <input type="text" id="edit-app-notes" value="${app.notes || ''}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                    </div>
                `,
                confirmText: 'Save Changes',
                onConfirm: () => {
                    app.status = document.getElementById('edit-app-status').value;
                    app.date = document.getElementById('edit-app-date').value;
                    app.time = document.getElementById('edit-app-time').value.trim();
                    app.notes = document.getElementById('edit-app-notes').value.trim();
                    saveAllData();
                    initializeAdminPanel();
                    showToast('Appointment updated successfully', 'success');
                    return true;
                }
            });
        },
        onRemove: (e) => {
            const id = Number(e.target.dataset.id);
            showConfirmDelete(`Appointment #APT-${id}`, () => {
                appointments = appointments.filter(a => a.id !== id);
                saveAllData();
                initializeAdminPanel();
                showToast(`Removed Appointment #APT-${id}`, 'info');
            });
        }
    });

    section.appendChild(appSection);
}

// --- 4. PHARMACY INVENTORY ---
function renderAdminPharmacy() {
    const section = document.getElementById('admin-pharmacy');
    if (!section) return;
    section.innerHTML = '';

    const pharmacySection = createManagementSection({
        title: 'Pharmacy Inventory',
        formFields: [
            { id: 'med-name', type: 'text', placeholder: 'e.g. Paracetamol (500mg)', label: 'Medicine Name' },
            { id: 'med-qty', type: 'number', placeholder: 'Units in Stock', label: 'Stock Quantity' },
            { id: 'med-min', type: 'number', placeholder: 'Alert Below (e.g. 30)', label: 'Low Stock Threshold' },
            { id: 'med-price', type: 'number', placeholder: 'Price (₹)', label: 'Unit Price (₹)' }
        ],
        tableHeaders: ['Item ID', 'Medicine Name', 'Stock Status', 'Quantity', 'Unit Price (₹)'],
        data: medicines,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#MED-${id}</span>` },
            { key: 'name', formatter: name => `<span class="font-semibold text-gray-900">${name}</span>` },
            { key: 'quantity', formatter: (qty, item) => {
                const threshold = item.minThreshold || 30;
                if (qty <= 0) {
                    return `<span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">Out of Stock</span>`;
                } else if (qty <= threshold) {
                    return `<span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">Low Stock (≤ ${threshold})</span>`;
                }
                return `<span class="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Adequate</span>`;
            } },
            { key: 'quantity', formatter: (qty, item) => `
                <span class="text-sm font-bold ${qty <= (item.minThreshold || 30) ? 'text-amber-600' : 'text-gray-800'}">${qty} units</span>
            ` },
            { key: 'unitPrice', formatter: p => `₹${(p || 5.00).toFixed(2)}` }
        ],
        onAdd: (e) => {
            e.preventDefault();
            const name = document.getElementById('med-name').value.trim();
            const quantity = parseInt(document.getElementById('med-qty').value);
            const minThreshold = parseInt(document.getElementById('med-min').value) || 30;
            const unitPrice = parseFloat(document.getElementById('med-price').value) || 5.00;

            if (!name || isNaN(quantity)) {
                showToast('Please provide valid medicine name and quantity', 'warning');
                return;
            }

            const newMed = {
                id: Date.now(),
                name,
                quantity,
                minThreshold,
                unitPrice
            };

            medicines.push(newMed);
            saveAllData();
            initializeAdminPanel();
            showToast(`Added ${newMed.name} to pharmacy stock`, 'success');
        },
        onEdit: (e) => {
            const id = Number(e.target.dataset.id);
            const med = getMedicineById(id);
            if (!med) return;

            showModal({
                title: `Update Medicine Stock: ${med.name}`,
                bodyHtml: `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Medicine Name</label>
                            <input type="text" id="edit-med-name" value="${med.name}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Quantity in Stock</label>
                                <input type="number" id="edit-med-qty" value="${med.quantity}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Low Stock Alert Limit</label>
                                <input type="number" id="edit-med-min" value="${med.minThreshold || 30}" class="w-full px-3 py-2 text-sm border rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Unit Price (₹)</label>
                            <input type="number" step="0.01" id="edit-med-price" value="${med.unitPrice || 5.00}" class="w-full px-3 py-2 text-sm border rounded-lg">
                        </div>
                    </div>
                `,
                confirmText: 'Save Medicine',
                onConfirm: () => {
                    med.name = document.getElementById('edit-med-name').value.trim();
                    med.quantity = parseInt(document.getElementById('edit-med-qty').value) || 0;
                    med.minThreshold = parseInt(document.getElementById('edit-med-min').value) || 30;
                    med.unitPrice = parseFloat(document.getElementById('edit-med-price').value) || 5.00;
                    saveAllData();
                    initializeAdminPanel();
                    showToast('Pharmacy stock updated', 'success');
                    return true;
                }
            });
        },
        onRemove: (e) => {
            const id = Number(e.target.dataset.id);
            const med = getMedicineById(id);
            const medName = med ? med.name : 'this item';

            showConfirmDelete(medName, () => {
                medicines = medicines.filter(m => m.id !== id);
                saveAllData();
                initializeAdminPanel();
                showToast(`Removed ${medName}`, 'info');
            });
        }
    });

    section.appendChild(pharmacySection);
}

// --- 5. PRESCRIPTIONS & DISPENSARY ---
function renderAdminPrescriptions() {
    const section = document.getElementById('admin-prescriptions');
    if (!section) return;
    section.innerHTML = '';

    const rxSection = createManagementSection({
        title: 'Prescriptions & Dispensary',
        tableHeaders: ['Rx ID', 'Patient', 'Prescribing Doctor', 'Medicine & Dosage', 'Date', 'Status'],
        data: prescriptions,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#RX-${id}</span>` },
            { key: 'patientId', formatter: id => {
                const pat = getPatientById(id);
                return pat ? `<span class="font-medium text-gray-900">${pat.name}</span>` : 'Unknown';
            } },
            { key: 'doctorId', formatter: id => {
                const doc = getDoctorById(id);
                return doc ? `<span class="text-indigo-600 font-medium">${doc.name}</span>` : 'Unknown';
            } },
            { key: 'medicineId', formatter: (medId, item) => {
                const med = getMedicineById(medId);
                return `
                    <div>
                        <span class="font-semibold text-gray-800 block">${med ? med.name : 'Medicine #' + medId}</span>
                        <span class="text-xs text-gray-500 block">${item.dosage}</span>
                    </div>
                `;
            } },
            { key: 'date', formatter: d => d || today },
            { key: 'status', formatter: st => {
                return st === 'Dispensed' 
                    ? `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Dispensed</span>`
                    : `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">⏳ Pending</span>`;
            } }
        ],
        actionButtons: [
            {
                label: 'Dispense',
                colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
                handler: (id) => {
                    const result = dispensePrescription(id);
                    if (result.success) {
                        showToast(result.message, 'success');
                        initializeAdminPanel();
                    } else {
                        showToast(result.message, 'error');
                    }
                }
            }
        ],
        onRemove: (e) => {
            const id = Number(e.target.dataset.id);
            showConfirmDelete(`Prescription #RX-${id}`, () => {
                prescriptions = prescriptions.filter(p => p.id !== id);
                saveAllData();
                initializeAdminPanel();
                showToast(`Removed prescription #RX-${id}`, 'info');
            });
        }
    });

    section.appendChild(rxSection);
}
