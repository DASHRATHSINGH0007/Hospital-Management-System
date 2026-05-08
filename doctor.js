document.addEventListener('DOMContentLoaded', () => {
    // Basic security check
    if (sessionStorage.getItem('loggedInRole') !== 'doctor') {
        window.location.href = 'index.html';
        return;
    }

    setupPanelNavigation('doctor');
    initializeDoctorPanel();
});


// --- DOCTOR PANEL SPECIFIC LOGIC ---
function initializeDoctorPanel() {
    // Assume doctor ID is 2 for demonstration
    const doctorId = 2; 
    updateDoctorDashboard(doctorId);
    renderDoctorPatientDetails(doctorId);
    renderDoctorPharmacy();
}

function updateDoctorDashboard(doctorId) {
    document.getElementById('doctor-today-appointments').textContent = appointments.filter(a => a.doctorId === doctorId && a.date === today).length;
    
    const patientIds = new Set(appointments.filter(a => a.doctorId === doctorId).map(a => a.patientId));
    document.getElementById('doctor-patients-assigned').textContent = patientIds.size;
}

function renderDoctorPatientDetails(doctorId) {
    const section = document.getElementById('doctor-patient-details');
    const patientIds = new Set(appointments.filter(a => a.doctorId === doctorId).map(a => a.patientId));
    const assignedPatients = patients.filter(p => patientIds.has(p.id));
    
    const tableRowsHtml = assignedPatients.map(item => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.age}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.gender}</td>
        </tr>
    `).join('');
    
    section.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Patient Details</h1>
        <div class="bg-white p-6 rounded-xl shadow-md">
             <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th></tr></thead>
                    <tbody class="bg-white divide-y divide-gray-200">${tableRowsHtml}</tbody>
                </table>
            </div>
        </div>`;
}

function renderDoctorPharmacy() {
    const section = document.getElementById('doctor-pharmacy');
    const tableHeaders = ['ID', 'Name', 'Quantity'];
    
    const tableRowsHtml = medicines.map(item => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity}</td>
        </tr>
    `).join('');
    
    section.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Pharmacy Inventory</h1>
        <div class="bg-white p-6 rounded-xl shadow-md">
             <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50"><tr>${tableHeaders.map(h => `<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${h}</th>`).join('')}</tr></thead>
                    <tbody class="bg-white divide-y divide-gray-200">${tableRowsHtml}</tbody>
                </table>
            </div>
        </div>`;
}
