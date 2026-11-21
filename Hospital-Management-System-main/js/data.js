// ==========================================
// HOSPITAL MANAGEMENT SYSTEM - DATA & STORAGE LAYER
// ==========================================

const today = new Date().toISOString().split('T')[0];

const INITIAL_DOCTORS = [
    { id: 1, name: 'Dr. John Smith', specialization: 'Cardiology', phone: '+1 555-0101', email: 'john.smith@hospital.com' },
    { id: 2, name: 'Dr. Emily Jones', specialization: 'Neurology', phone: '+1 555-0102', email: 'emily.jones@hospital.com' },
    { id: 3, name: 'Dr. Sarah Davis', specialization: 'Pediatrics', phone: '+1 555-0103', email: 'sarah.davis@hospital.com' },
    { id: 4, name: 'Dr. Michael Chen', specialization: 'Orthopedics', phone: '+1 555-0104', email: 'michael.chen@hospital.com' }
];

const INITIAL_PATIENTS = [
    { id: 101, name: 'Alice Johnson', age: 34, gender: 'Female', phone: '+1 555-0201', bloodGroup: 'A+', allergies: 'Penicillin', dateRegistered: '2026-10-15', careNeed: 'OPD Consultation', department: 'Cardiology', priority: 'Routine', bedPreference: 'None (Outpatient)', assistance: 'Diabetic Care' },
    { id: 102, name: 'Bob Williams', age: 45, gender: 'Male', phone: '+1 555-0202', bloodGroup: 'O+', allergies: 'None', dateRegistered: today, careNeed: 'Emergency Care', department: 'Neurology', priority: 'Urgent', bedPreference: 'Semi-Private Room', assistance: 'Wheelchair Needed' },
    { id: 103, name: 'Charlie Brown', age: 28, gender: 'Male', phone: '+1 555-0203', bloodGroup: 'B-', allergies: 'Peanuts', dateRegistered: '2026-10-28', careNeed: 'Diagnostic / Lab', department: 'General Medicine', priority: 'Routine', bedPreference: 'None (Outpatient)', assistance: 'None' },
    { id: 104, name: 'Diana Prince', age: 39, gender: 'Female', phone: '+1 555-0204', bloodGroup: 'AB+', allergies: 'Sulfa drugs', dateRegistered: today, careNeed: 'Inpatient Admission', department: 'Pediatrics', priority: 'Urgent', bedPreference: 'Private AC Suite', assistance: 'Oxygen Support' }
];

const INITIAL_APPOINTMENTS = [
    { id: 201, patientId: 101, doctorId: 1, date: today, time: '10:00 AM', status: 'Scheduled', notes: 'Routine cardiac checkup' },
    { id: 202, patientId: 102, doctorId: 2, date: today, time: '11:30 AM', status: 'Completed', notes: 'Migraine consultation' },
    { id: 203, patientId: 103, doctorId: 1, date: today, time: '02:00 PM', status: 'Scheduled', notes: 'High BP follow-up' },
    { id: 204, patientId: 104, doctorId: 3, date: '2026-11-05', time: '09:00 AM', status: 'Scheduled', notes: 'Pediatric immunization consult' }
];

const INITIAL_MEDICINES = [
    { id: 301, name: 'Aspirin (100mg)', quantity: 150, minThreshold: 30, unitPrice: 5.00 },
    { id: 302, name: 'Paracetamol (500mg)', quantity: 24, minThreshold: 50, unitPrice: 3.50 }, // Low stock demo
    { id: 303, name: 'Ibuprofen (400mg)', quantity: 120, minThreshold: 40, unitPrice: 7.20 },
    { id: 304, name: 'Amoxicillin (250mg)', quantity: 18, minThreshold: 40, unitPrice: 12.00 }, // Low stock demo
    { id: 305, name: 'Metformin (500mg)', quantity: 200, minThreshold: 50, unitPrice: 8.50 },
    { id: 306, name: 'Cetirizine (10mg)', quantity: 95, minThreshold: 30, unitPrice: 4.00 }
];

const INITIAL_PRESCRIPTIONS = [
    { id: 401, patientId: 101, doctorId: 1, medicineId: 301, dosage: '1 tablet once daily', notes: 'Take after breakfast', status: 'Dispensed', date: '2026-10-25' },
    { id: 402, patientId: 102, doctorId: 2, medicineId: 302, dosage: '1 tablet twice a day', notes: 'When headache occurs', status: 'Pending', date: today },
    { id: 403, patientId: 103, doctorId: 1, medicineId: 305, dosage: '1 tablet twice daily', notes: 'Monitor blood sugar levels', status: 'Pending', date: today }
];

// In-memory working state
let doctors = [];
let patients = [];
let appointments = [];
let medicines = [];
let prescriptions = [];

// Storage Keys
const STORAGE_KEYS = {
    DOCTORS: 'hms_doctors',
    PATIENTS: 'hms_patients',
    APPOINTMENTS: 'hms_appointments',
    MEDICINES: 'hms_medicines',
    PRESCRIPTIONS: 'hms_prescriptions',
    INITIALIZED: 'hms_initialized_v2'
};

// Initialize & Load Data from LocalStorage
function loadAllData() {
    try {
        const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
        if (!isInit) {
            resetDatabase(false);
            return;
        }

        doctors = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS)) || INITIAL_DOCTORS;
        patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS)) || INITIAL_PATIENTS;
        appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || INITIAL_APPOINTMENTS;
        medicines = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICINES)) || INITIAL_MEDICINES;
        prescriptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) || INITIAL_PRESCRIPTIONS;
    } catch (e) {
        console.error('Error loading data from localStorage, falling back to defaults:', e);
        resetDatabase(false);
    }
}

// Save Current State to LocalStorage
function saveAllData() {
    try {
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
        localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch (e) {
        console.error('Error saving data to localStorage:', e);
    }
}

// Reset Database to Seed Data
function resetDatabase(notify = true) {
    doctors = [...INITIAL_DOCTORS];
    patients = [...INITIAL_PATIENTS];
    appointments = [...INITIAL_APPOINTMENTS];
    medicines = [...INITIAL_MEDICINES];
    prescriptions = [...INITIAL_PRESCRIPTIONS];
    saveAllData();
    if (notify && typeof showToast === 'function') {
        showToast('Database reset to default seed data.', 'info');
    }
}

// Helper lookup functions
function getDoctorById(id) {
    return doctors.find(d => Number(d.id) === Number(id));
}

function getPatientById(id) {
    return patients.find(p => Number(p.id) === Number(id));
}

function getMedicineById(id) {
    return medicines.find(m => Number(m.id) === Number(id));
}

// Dispense Prescription helper: checks stock and deducts
function dispensePrescription(prescriptionId) {
    const rx = prescriptions.find(p => Number(p.id) === Number(prescriptionId));
    if (!rx) return { success: false, message: 'Prescription not found' };
    if (rx.status === 'Dispensed') return { success: false, message: 'Prescription has already been dispensed' };

    const med = getMedicineById(rx.medicineId);
    if (!med) return { success: false, message: 'Prescribed medicine not found in inventory' };
    if (med.quantity <= 0) return { success: false, message: `Out of stock: ${med.name}` };

    med.quantity -= 1;
    rx.status = 'Dispensed';
    saveAllData();
    return { success: true, message: `Dispensed 1 unit of ${med.name}. Remaining: ${med.quantity}` };
}

// Run load on script evaluation
loadAllData();
