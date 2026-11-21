// ==========================================
// HOSPITAL MANAGEMENT SYSTEM - DOCTOR LOGIC
// ==========================================

let currentDoctorId = 1;
let currentDoctor = null;

document.addEventListener('DOMContentLoaded', () => {
    // Role verification
    if (sessionStorage.getItem('loggedInRole') !== 'doctor') {
        window.location.href = 'index.html';
        return;
    }

    // Determine logged in doctor
    const storedId = sessionStorage.getItem('loggedInDoctorId');
    currentDoctorId = storedId ? Number(storedId) : 1;
    currentDoctor = getDoctorById(currentDoctorId) || doctors[0];

    setupTopDoctorSwitcher();
    setupPanelNavigation('doctor');
    initializeDoctorPanel();

    // Auto-refresh when returning to tab or when localStorage updates
    window.addEventListener('focus', () => {
        loadAllData();
        initializeDoctorPanel();
    });
    window.addEventListener('storage', () => {
        loadAllData();
        initializeDoctorPanel();
    });
});

function setupTopDoctorSwitcher() {
    const switcher = document.getElementById('doctor-top-switcher');
    if (!switcher) return;

    switcher.innerHTML = doctors.map(d => `
        <option value="${d.id}" ${Number(d.id) === Number(currentDoctorId) ? 'selected' : ''}>
            ${d.name} (${d.specialization})
        </option>
    `).join('');

    switcher.addEventListener('change', (e) => {
        currentDoctorId = Number(e.target.value);
        currentDoctor = getDoctorById(currentDoctorId) || doctors[0];
        sessionStorage.setItem('loggedInDoctorId', String(currentDoctorId));
        sessionStorage.setItem('loggedInUser', currentDoctor.name);
        initializeDoctorPanel();
        showToast(`Switched view to ${currentDoctor.name}`, 'info');
    });
}

function initializeDoctorPanel() {
    loadAllData(); // Ensure fresh data from localStorage
    currentDoctor = getDoctorById(currentDoctorId) || doctors[0];

    // Update profile displays
    if (currentDoctor) {
        const userDisplay = document.getElementById('doctor-user-display');
        const specDisplay = document.getElementById('doctor-spec-display');
        const welcomeTitle = document.getElementById('doctor-welcome-title');
        const switcher = document.getElementById('doctor-top-switcher');

        if (userDisplay) userDisplay.textContent = currentDoctor.name;
        if (specDisplay) specDisplay.textContent = currentDoctor.specialization;
        if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${currentDoctor.name}`;
        if (switcher && Number(switcher.value) !== Number(currentDoctorId)) {
            switcher.value = currentDoctorId;
        }
    }

    updateDoctorDashboard(currentDoctorId);
    renderDoctorAppointments(currentDoctorId);
    renderDoctorPatientDetails(currentDoctorId);
    renderDoctorPrescriptionForm(currentDoctorId);
    renderDoctorPharmacy();
}

// --- DASHBOARD UPDATES ---
function updateDoctorDashboard(docId) {
    const docApps = appointments.filter(a => Number(a.doctorId) === Number(docId));
    const todayDocApps = docApps.filter(a => a.date === today && a.status !== 'Cancelled');
    const upcomingDocApps = docApps.filter(a => a.date !== today && a.status !== 'Cancelled');
    const assignedPatIds = new Set(docApps.map(a => Number(a.patientId)));
    const docPrescriptions = prescriptions.filter(p => Number(p.doctorId) === Number(docId));

    const todayCountEl = document.getElementById('doctor-today-appointments');
    const patCountEl = document.getElementById('doctor-patients-assigned');
    const rxCountEl = document.getElementById('doctor-prescriptions-count');

    if (todayCountEl) todayCountEl.textContent = todayDocApps.length;
    if (patCountEl) patCountEl.textContent = assignedPatIds.size;
    if (rxCountEl) rxCountEl.textContent = docPrescriptions.length;

    // Queue list
    const queueBox = document.getElementById('doctor-today-queue');
    if (queueBox) {
        if (docApps.length === 0) {
            queueBox.innerHTML = `
                <div class="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                    <p class="text-sm font-semibold text-gray-700">No appointments scheduled for ${currentDoctor ? currentDoctor.name : 'this doctor'}.</p>
                    <p class="text-xs text-gray-500">If receptionist booked an appointment for another doctor, select their profile from the <strong>Viewing Profile</strong> dropdown above!</p>
                </div>
            `;
        } else {
            let html = '';
            
            if (todayDocApps.length > 0) {
                html += `
                    <div class="mb-3 flex items-center justify-between">
                        <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">Today's Schedule (${todayDocApps.length})</span>
                    </div>
                `;
                html += todayDocApps.map(a => renderAppointmentCard(a, true)).join('');
            }

            if (upcomingDocApps.length > 0) {
                html += `
                    <div class="mt-4 mb-3 flex items-center justify-between">
                        <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">Scheduled & Upcoming Appointments (${upcomingDocApps.length})</span>
                    </div>
                `;
                html += upcomingDocApps.map(a => renderAppointmentCard(a, false)).join('');
            }

            queueBox.innerHTML = html;
        }
    }
}

function renderAppointmentCard(a, isToday) {
    const pat = getPatientById(a.patientId);
    const isCompleted = a.status === 'Completed';
    return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl gap-3 mb-2">
            <div>
                <div class="flex items-center space-x-2">
                    <span class="font-bold text-gray-800 text-sm">${pat ? pat.name : 'Unknown Patient'}</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">${pat ? pat.bloodGroup : 'O+'}</span>
                    <span class="text-xs text-gray-500">${pat ? pat.gender + ', ' + pat.age + ' yrs' : ''}</span>
                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded ${isToday ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                        📅 ${a.date}
                    </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">Time: <span class="font-semibold text-gray-700">${a.time}</span> • Reason: ${a.notes || 'Routine checkup'}</p>
            </div>
            <div class="flex items-center space-x-2">
                ${!isCompleted ? `
                    <button class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition" onclick="doctorCompleteAppointment(${a.id})">
                        Mark Done
                    </button>
                ` : `
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Completed</span>
                `}
            </div>
        </div>
    `;
}

function doctorCompleteAppointment(appId) {
    const app = appointments.find(a => Number(a.id) === Number(appId));
    if (app) {
        app.status = 'Completed';
        saveAllData();
        initializeDoctorPanel();
        showToast('Consultation marked as completed', 'success');
    }
}

// --- 1. MY APPOINTMENTS ---
function renderDoctorAppointments(docId) {
    const section = document.getElementById('doctor-my-appointments');
    if (!section) return;
    section.innerHTML = '';

    const myAppointments = appointments.filter(a => Number(a.doctorId) === Number(docId));

    const appSection = createManagementSection({
        title: 'My Scheduled Consultations',
        tableHeaders: ['Appt ID', 'Patient Name', 'Age / Blood', 'Date & Time', 'Status', 'Clinical Notes'],
        data: myAppointments,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#APT-${id}</span>` },
            { key: 'patientId', formatter: (patId) => {
                const pat = getPatientById(patId);
                return pat ? `
                    <div>
                        <span class="font-semibold text-gray-900 block">${pat.name}</span>
                        <span class="text-xs text-gray-400 block">${pat.phone || 'No phone'}</span>
                    </div>
                ` : 'Unknown';
            } },
            { key: 'patientId', formatter: (patId) => {
                const pat = getPatientById(patId);
                return pat ? `${pat.age} yrs • <span class="font-bold text-rose-600">${pat.bloodGroup || 'N/A'}</span>` : 'N/A';
            } },
            { key: 'date', formatter: (d, item) => `${d} • <span class="font-semibold text-gray-800">${item.time}</span>` },
            { key: 'status', formatter: st => {
                const colors = {
                    Scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                };
                return `<span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[st] || 'bg-gray-100'}">${st || 'Scheduled'}</span>`;
            } },
            { key: 'notes', formatter: n => `<span class="text-xs text-gray-600">${n || 'Consultation'}</span>` }
        ],
        actionButtons: [
            {
                label: 'Complete',
                colorClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                handler: (id) => doctorCompleteAppointment(id)
            }
        ]
    });

    section.appendChild(appSection);
}

// --- 2. ASSIGNED PATIENTS ---
function renderDoctorPatientDetails(docId) {
    const section = document.getElementById('doctor-patient-details');
    if (!section) return;
    section.innerHTML = '';

    const myAppointments = appointments.filter(a => Number(a.doctorId) === Number(docId));
    const patientIds = new Set(myAppointments.map(a => Number(a.patientId)));
    const assignedPatients = patients.filter(p => patientIds.has(Number(p.id)));

    const patientSection = createManagementSection({
        title: 'Assigned Patient Records',
        tableHeaders: ['Patient ID', 'Name & Contact', 'Age / Gender', 'Blood Group', 'Allergies & Medical Notes'],
        data: assignedPatients.length > 0 ? assignedPatients : patients, // Show assigned or full hospital directory
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#PAT-${id}</span>` },
            { key: 'name', formatter: (name, item) => `
                <div>
                    <span class="font-semibold text-gray-900 block">${name}</span>
                    <span class="text-xs text-gray-400 block">${item.phone || 'N/A'}</span>
                </div>
            ` },
            { key: 'age', formatter: (age, item) => `${age} yrs • ${item.gender}` },
            { key: 'bloodGroup', formatter: bg => `<span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-md bg-rose-50 text-rose-700">${bg || 'N/A'}</span>` },
            { key: 'allergies', formatter: all => all ? `<span class="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-medium">${all}</span>` : '<span class="text-xs text-gray-400">None Recorded</span>' }
        ],
        actionButtons: [
            {
                label: 'Prescribe',
                colorClass: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
                handler: (patId) => {
                    // Switch to prescription tab and prefill patient
                    const rxLink = document.querySelector('.doctor-link[href="#write-prescription"]');
                    if (rxLink) rxLink.click();
                    setTimeout(() => {
                        const patSelect = document.getElementById('rx-patient-select');
                        if (patSelect) patSelect.value = patId;
                    }, 50);
                }
            }
        ]
    });

    section.appendChild(patientSection);
}

// --- 3. WRITE PRESCRIPTION ---
function renderDoctorPrescriptionForm(docId) {
    const section = document.getElementById('doctor-write-prescription');
    if (!section) return;
    section.innerHTML = '';

    const myPrescriptions = prescriptions.filter(p => Number(p.doctorId) === Number(docId));

    const rxSection = createManagementSection({
        title: 'Issue Medical Prescription',
        formFields: [
            { id: 'rx-patient-select', type: 'select', label: 'Select Patient', options: patients.map(p => ({ value: p.id, text: `${p.name} (#PAT-${p.id})` })) },
            { id: 'rx-med-select', type: 'select', label: 'Select Medication', options: medicines.map(m => ({ value: m.id, text: `${m.name} (In Stock: ${m.quantity})` })) },
            { id: 'rx-dosage', type: 'text', placeholder: 'e.g. 1 tablet twice a day', label: 'Dosage Instructions' },
            { id: 'rx-notes', type: 'text', placeholder: 'e.g. Take after meal for 5 days', label: 'Clinical Instructions / Notes' }
        ],
        tableHeaders: ['Rx ID', 'Patient', 'Prescribed Medicine', 'Dosage & Notes', 'Date', 'Status'],
        data: myPrescriptions,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#RX-${id}</span>` },
            { key: 'patientId', formatter: patId => {
                const pat = getPatientById(patId);
                return pat ? `<span class="font-semibold text-gray-900">${pat.name}</span>` : 'Unknown';
            } },
            { key: 'medicineId', formatter: medId => {
                const med = getMedicineById(medId);
                return med ? `<span class="font-semibold text-indigo-700">${med.name}</span>` : 'Unknown Medicine';
            } },
            { key: 'dosage', formatter: (dos, item) => `
                <div>
                    <span class="text-sm font-medium text-gray-800 block">${dos}</span>
                    <span class="text-xs text-gray-500 block">${item.notes || 'Follow standard protocol'}</span>
                </div>
            ` },
            { key: 'date', formatter: d => d || today },
            { key: 'status', formatter: st => {
                return st === 'Dispensed' 
                    ? `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Dispensed</span>`
                    : `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">⏳ Pending Pharmacy</span>`;
            } }
        ],
        onAdd: (e) => {
            e.preventDefault();
            const patientId = parseInt(document.getElementById('rx-patient-select').value);
            const medicineId = parseInt(document.getElementById('rx-med-select').value);
            const dosage = document.getElementById('rx-dosage').value.trim();
            const notes = document.getElementById('rx-notes').value.trim();

            if (!patientId || !medicineId || !dosage) {
                showToast('Please specify patient, medicine, and dosage', 'warning');
                return;
            }

            const newRx = {
                id: Date.now(),
                patientId,
                doctorId: docId,
                medicineId,
                dosage,
                notes: notes || 'As directed',
                status: 'Pending',
                date: today
            };

            prescriptions.push(newRx);
            saveAllData();
            initializeDoctorPanel();
            showToast('Prescription recorded and sent to Pharmacy!', 'success');
        },
        onRemove: (e) => {
            const id = Number(e.target.dataset.id);
            showConfirmDelete(`Prescription #RX-${id}`, () => {
                prescriptions = prescriptions.filter(p => p.id !== id);
                saveAllData();
                initializeDoctorPanel();
                showToast(`Prescription #RX-${id} removed`, 'info');
            });
        }
    });

    section.appendChild(rxSection);
}

// --- 4. PHARMACY STOCK LOOKUP ---
function renderDoctorPharmacy() {
    const section = document.getElementById('doctor-pharmacy');
    if (!section) return;
    section.innerHTML = '';

    const pharmacySection = createManagementSection({
        title: 'Pharmacy Stock Directory',
        tableHeaders: ['Item ID', 'Medicine Name', 'Availability', 'Stock Units', 'Unit Price (₹)'],
        data: medicines,
        dataItems: [
            { key: 'id', formatter: id => `<span class="font-mono text-xs font-semibold text-gray-500">#MED-${id}</span>` },
            { key: 'name', formatter: n => `<span class="font-semibold text-gray-900">${n}</span>` },
            { key: 'quantity', formatter: (qty, item) => {
                if (qty <= 0) {
                    return `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">Unavailable (0 units)</span>`;
                } else if (qty <= (item.minThreshold || 30)) {
                    return `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">Low Stock (${qty} units)</span>`;
                }
                return `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">In Stock</span>`;
            } },
            { key: 'quantity', formatter: qty => `${qty} units` },
            { key: 'unitPrice', formatter: p => `₹${(p || 5.00).toFixed(2)}` }
        ]
    });

    section.appendChild(pharmacySection);
}
