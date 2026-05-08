// --- SIMULATED DATABASE ---
// In a real application, this data would come from a server/database.

const today = new Date().toISOString().split('T')[0];

let doctors = [
    { id: 1, name: 'Dr. John Smith', specialization: 'Cardiology' },
    { id: 2, name: 'Dr. Emily Jones', specialization: 'Neurology' },
    { id: 3, name: 'Dr. Sarah Davis', specialization: 'Pediatrics' }
];

let patients = [
    { id: 101, name: 'Alice Johnson', age: 34, gender: 'Female', dateRegistered: '2025-09-10' },
    { id: 102, name: 'Bob Williams', age: 45, gender: 'Male', dateRegistered: today },
    { id: 103, name: 'Charlie Brown', age: 28, gender: 'Male', dateRegistered: '2025-09-12' }
];

let appointments = [
    { id: 201, patientId: 101, doctorId: 1, date: today, time: '10:00 AM' },
    { id: 202, patientId: 102, doctorId: 2, date: today, time: '11:30 AM' },
    { id: 203, patientId: 103, doctorId: 1, date: '2025-09-18', time: '02:00 PM' }
];

let medicines = [
    { id: 301, name: 'Aspirin', quantity: 150 },
    { id: 302, name: 'Paracetamol', quantity: 200 },
    { id: 303, name: 'Ibuprofen', quantity: 120 }
];

let prescriptions = [
    { id: 401, patientId: 101, doctorId: 1, medicineId: 301, dosage: '1 tablet twice a day', status: 'Completed' },
    { id: 402, patientId: 102, doctorId: 2, medicineId: 302, dosage: '2 tablets after meal', status: 'Pending' }
];
