// ==========================================
// MediCore Database Seeder
// Seeds synthetic healthcare dataset across all 8 roles
// ==========================================

import bcrypt from 'bcryptjs';

export async function getSeedDataset() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('medicore123', salt);
  const adminHash = await bcrypt.hash('admin123', salt);
  const doctorHash = await bcrypt.hash('doctor123', salt);

  const users = [
    {
      id: 'usr-super-admin-01',
      email: 'superadmin@medicore.com',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'SuperAdmin',
      phone: '+1 555-0001',
      isActive: true,
    },
    {
      id: 'usr-hospital-admin-01',
      email: 'admin@medicore.com',
      passwordHash: adminHash,
      role: 'HOSPITAL_ADMIN',
      firstName: 'Eleanor',
      lastName: 'Vance',
      phone: '+1 555-0002',
      isActive: true,
    },
    {
      id: 'usr-doctor-01',
      email: 'dr.smith@medicore.com',
      passwordHash: doctorHash,
      role: 'DOCTOR',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1 555-0101',
      isActive: true,
    },
    {
      id: 'usr-doctor-02',
      email: 'dr.jones@medicore.com',
      passwordHash: doctorHash,
      role: 'DOCTOR',
      firstName: 'Emily',
      lastName: 'Jones',
      phone: '+1 555-0102',
      isActive: true,
    },
    {
      id: 'usr-doctor-03',
      email: 'dr.davis@medicore.com',
      passwordHash: doctorHash,
      role: 'DOCTOR',
      firstName: 'Sarah',
      lastName: 'Davis',
      phone: '+1 555-0103',
      isActive: true,
    },
    {
      id: 'usr-receptionist-01',
      email: 'receptionist@medicore.com',
      passwordHash: await bcrypt.hash('rec123', salt),
      role: 'RECEPTIONIST',
      firstName: 'Clara',
      lastName: 'Oswald',
      phone: '+1 555-0201',
      isActive: true,
    },
    {
      id: 'usr-nurse-01',
      email: 'nurse@medicore.com',
      passwordHash: await bcrypt.hash('nurse123', salt),
      role: 'NURSE',
      firstName: 'Rory',
      lastName: 'Williams',
      phone: '+1 555-0301',
      isActive: true,
    },
    {
      id: 'usr-pharmacist-01',
      email: 'pharmacist@medicore.com',
      passwordHash: await bcrypt.hash('pharma123', salt),
      role: 'PHARMACIST',
      firstName: 'Grace',
      lastName: 'Hopper',
      phone: '+1 555-0401',
      isActive: true,
    },
    {
      id: 'usr-labtech-01',
      email: 'labtech@medicore.com',
      passwordHash: await bcrypt.hash('lab123', salt),
      role: 'LAB_TECHNICIAN',
      firstName: 'Rosalind',
      lastName: 'Franklin',
      phone: '+1 555-0501',
      isActive: true,
    },
    {
      id: 'usr-patient-01',
      email: 'alice@medicore.com',
      passwordHash: await bcrypt.hash('patient123', salt),
      role: 'PATIENT',
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '+1 555-0601',
      isActive: true,
    },
    {
      id: 'usr-patient-02',
      email: 'bob@medicore.com',
      passwordHash: await bcrypt.hash('patient123', salt),
      role: 'PATIENT',
      firstName: 'Bob',
      lastName: 'Williams',
      phone: '+1 555-0602',
      isActive: true,
    },
    // Production Demo Aliases (.io domain matching README documentation)
    {
      id: 'usr-super-admin-io',
      email: 'superadmin@medicore.io',
      passwordHash: await bcrypt.hash('Admin@123', salt),
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'SuperAdmin',
      phone: '+1 555-0001',
      isActive: true,
    },
    {
      id: 'usr-hospital-admin-io',
      email: 'admin@medicore.io',
      passwordHash: await bcrypt.hash('Admin@123', salt),
      role: 'HOSPITAL_ADMIN',
      firstName: 'Eleanor',
      lastName: 'Vance',
      phone: '+1 555-0002',
      isActive: true,
    },
    {
      id: 'usr-doctor-smith-io',
      email: 'doctor.smith@medicore.io',
      passwordHash: await bcrypt.hash('Doctor@123', salt),
      role: 'DOCTOR',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1 555-0101',
      isActive: true,
    },
    {
      id: 'usr-receptionist-io',
      email: 'reception@medicore.io',
      passwordHash: await bcrypt.hash('Recep@123', salt),
      role: 'RECEPTIONIST',
      firstName: 'Clara',
      lastName: 'Oswald',
      phone: '+1 555-0201',
      isActive: true,
    },
    {
      id: 'usr-nurse-io',
      email: 'nurse.clara@medicore.io',
      passwordHash: await bcrypt.hash('Nurse@123', salt),
      role: 'NURSE',
      firstName: 'Clara',
      lastName: 'Nurse',
      phone: '+1 555-0301',
      isActive: true,
    },
    {
      id: 'usr-pharmacy-io',
      email: 'pharmacy@medicore.io',
      passwordHash: await bcrypt.hash('Pharm@123', salt),
      role: 'PHARMACIST',
      firstName: 'Grace',
      lastName: 'Hopper',
      phone: '+1 555-0401',
      isActive: true,
    },
    {
      id: 'usr-lab-io',
      email: 'lab@medicore.io',
      passwordHash: await bcrypt.hash('Lab@123', salt),
      role: 'LAB_TECHNICIAN',
      firstName: 'Rosalind',
      lastName: 'Franklin',
      phone: '+1 555-0501',
      isActive: true,
    },
    {
      id: 'usr-patient-io',
      email: 'patient.alice@medicore.io',
      passwordHash: await bcrypt.hash('Patient@123', salt),
      role: 'PATIENT',
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '+1 555-0601',
      isActive: true,
    }
  ];

  const departments = [
    { id: 'dept-cardio', name: 'Cardiology', code: 'CARD', description: 'Comprehensive heart & cardiovascular care' },
    { id: 'dept-neuro', name: 'Neurology', code: 'NEUR', description: 'Brain, spinal cord & nervous system disorders' },
    { id: 'dept-pediatrics', name: 'Pediatrics', code: 'PED', description: 'Infant, child & adolescent health services' },
    { id: 'dept-ortho', name: 'Orthopedics', code: 'ORTH', description: 'Musculoskeletal system, bones & joints' },
    { id: 'dept-emergency', name: 'Emergency Medicine', code: 'ER', description: '24/7 Trauma and emergency triage services' },
  ];

  const doctors = [
    {
      id: 'doc-01',
      userId: 'usr-doctor-01',
      departmentId: 'dept-cardio',
      specialization: 'Cardiology',
      licenseNumber: 'MD-CARD-8841',
      consultationFee: 120.00,
      roomNumber: 'OPD-101',
      scheduleJson: JSON.stringify({ days: ['Monday', 'Wednesday', 'Friday'], hours: '09:00 AM - 01:00 PM' }),
    },
    {
      id: 'doc-02',
      userId: 'usr-doctor-02',
      departmentId: 'dept-neuro',
      specialization: 'Neurology',
      licenseNumber: 'MD-NEUR-7729',
      consultationFee: 150.00,
      roomNumber: 'OPD-102',
      scheduleJson: JSON.stringify({ days: ['Tuesday', 'Thursday'], hours: '10:00 AM - 03:00 PM' }),
    },
    {
      id: 'doc-03',
      userId: 'usr-doctor-03',
      departmentId: 'dept-pediatrics',
      specialization: 'Pediatrics',
      licenseNumber: 'MD-PED-5510',
      consultationFee: 100.00,
      roomNumber: 'OPD-201',
      scheduleJson: JSON.stringify({ days: ['Monday', 'Tuesday', 'Thursday', 'Saturday'], hours: '08:30 AM - 12:30 PM' }),
    }
  ];

  const patients = [
    {
      id: 'pat-01',
      userId: 'usr-patient-01',
      patientCode: 'PAT-10021',
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: new Date('1990-05-14'),
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 555-0601',
      address: '742 Evergreen Terrace, Springfield',
      emergencyContact: '+1 555-9988 (Husband: Mark)',
      allergies: 'Penicillin, Latex',
      medicalHistory: 'Mild Hypertension (diagnosed 2022)',
    },
    {
      id: 'pat-02',
      userId: 'usr-patient-02',
      patientCode: 'PAT-10022',
      firstName: 'Bob',
      lastName: 'Williams',
      dateOfBirth: '1979-11-23',
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 555-0602',
      address: '124 Conch Street, Pacific Grove',
      emergencyContact: '+1 555-7766 (Sister: Sarah)',
      allergies: 'None recorded',
      medicalHistory: 'Type-2 Diabetes mellitus',
    },
    {
      id: 'pat-03',
      userId: null,
      patientCode: 'PAT-10023',
      firstName: 'Charlie',
      lastName: 'Brown',
      dateOfBirth: '1996-03-08',
      gender: 'Male',
      bloodGroup: 'B-',
      phone: '+1 555-0603',
      address: '32 Pine Street, Hill Valley',
      emergencyContact: '+1 555-3344 (Mother: Sally)',
      allergies: 'Peanuts',
      medicalHistory: 'Asthma in childhood',
    }
  ];

  const today = new Date().toISOString().split('T')[0];

  const appointments = [
    {
      id: 'apt-01',
      patientId: 'pat-01',
      doctorId: 'doc-01',
      appointmentDate: today,
      timeSlot: '10:00 AM',
      type: 'GENERAL_CHECKUP',
      status: 'CONFIRMED',
      reason: 'Routine cardiac evaluation & blood pressure review',
    },
    {
      id: 'apt-02',
      patientId: 'pat-02',
      doctorId: 'doc-02',
      appointmentDate: today,
      timeSlot: '11:30 AM',
      type: 'SPECIALIST_CONSULTATION',
      status: 'SCHEDULED',
      reason: 'Recurring tension headaches and numbness in fingertips',
    },
    {
      id: 'apt-03',
      patientId: 'pat-03',
      doctorId: 'doc-01',
      appointmentDate: today,
      timeSlot: '02:00 PM',
      type: 'FOLLOW_UP',
      status: 'COMPLETED',
      reason: 'Post-medication ECG follow-up review',
    }
  ];

  const medicines = [
    {
      id: 'med-01',
      name: 'Aspirin (100mg)',
      genericName: 'Acetylsalicylic acid',
      category: 'Analgesics / Antithrombotic',
      dosageForm: 'Tablet',
      batchNumber: 'ASP-2026-B1',
      stockQuantity: 150,
      minThreshold: 30,
      unitPrice: 5.50,
      expiryDate: '2027-12-31',
    },
    {
      id: 'med-02',
      name: 'Paracetamol (500mg)',
      genericName: 'Acetaminophen',
      category: 'Antipyretics / Analgesics',
      dosageForm: 'Tablet',
      batchNumber: 'PCM-2026-B9',
      stockQuantity: 24, // Low stock demo
      minThreshold: 50,
      unitPrice: 3.00,
      expiryDate: '2026-08-15',
    },
    {
      id: 'med-03',
      name: 'Amoxicillin (250mg)',
      genericName: 'Amoxicillin Trihydrate',
      category: 'Antibiotics',
      dosageForm: 'Capsule',
      batchNumber: 'AMX-2025-C4',
      stockQuantity: 18, // Low stock demo
      minThreshold: 40,
      unitPrice: 12.00,
      expiryDate: '2026-06-30',
    },
    {
      id: 'med-04',
      name: 'Metformin (500mg)',
      genericName: 'Metformin Hydrochloride',
      category: 'Antidiabetic',
      dosageForm: 'Tablet',
      batchNumber: 'MET-2026-A2',
      stockQuantity: 210,
      minThreshold: 50,
      unitPrice: 8.50,
      expiryDate: '2027-09-20',
    },
    {
      id: 'med-05',
      name: 'Atorvastatin (20mg)',
      genericName: 'Atorvastatin Calcium',
      category: 'Cardiovascular / Statin',
      dosageForm: 'Tablet',
      batchNumber: 'ATV-2026-E1',
      stockQuantity: 95,
      minThreshold: 35,
      unitPrice: 16.00,
      expiryDate: '2027-11-10',
    }
  ];

  const labTests = [
    {
      id: 'lab-01',
      name: 'Complete Blood Count (CBC)',
      code: 'CBC-01',
      category: 'Hematology',
      price: 35.00,
      normalRange: 'WBC: 4.5-11.0, RBC: 4.3-5.9, Hb: 13.5-17.5',
      unit: 'cells/mcL',
    },
    {
      id: 'lab-02',
      name: 'Lipid Profile Panel',
      code: 'LIPID-02',
      category: 'Biochemistry',
      price: 55.00,
      normalRange: 'Total Chol < 200, LDL < 100, HDL > 40',
      unit: 'mg/dL',
    },
    {
      id: 'lab-03',
      name: 'Fasting Blood Glucose',
      code: 'GLU-03',
      category: 'Biochemistry',
      price: 20.00,
      normalRange: '70 - 99',
      unit: 'mg/dL',
    },
    {
      id: 'lab-04',
      name: 'Serum Electrolytes (Na, K, Cl)',
      code: 'ELEC-04',
      category: 'Biochemistry',
      price: 45.00,
      normalRange: 'Na: 135-145, K: 3.5-5.0, Cl: 96-106',
      unit: 'mEq/L',
    }
  ];

  const wards = [
    { id: 'ward-01', name: 'Cardiology General Ward', departmentId: 'dept-cardio', wardType: 'GENERAL', floor: '2nd Floor' },
    { id: 'ward-02', name: 'Intensive Care Unit (ICU)', departmentId: 'dept-emergency', wardType: 'ICU', floor: '3rd Floor' },
    { id: 'ward-03', name: 'Private Suites', departmentId: 'dept-neuro', wardType: 'PRIVATE', floor: '4th Floor' },
  ];

  const beds = [
    { id: 'bed-01', wardId: 'ward-01', bedNumber: 'BED-101', bedType: 'GENERAL', status: 'OCCUPIED', dailyRate: 150.00 },
    { id: 'bed-02', wardId: 'ward-01', bedNumber: 'BED-102', bedType: 'GENERAL', status: 'AVAILABLE', dailyRate: 150.00 },
    { id: 'bed-03', wardId: 'ward-01', bedNumber: 'BED-103', bedType: 'GENERAL', status: 'AVAILABLE', dailyRate: 150.00 },
    { id: 'bed-04', wardId: 'ward-02', bedNumber: 'ICU-B01', bedType: 'ICU', status: 'OCCUPIED', dailyRate: 650.00 },
    { id: 'bed-05', wardId: 'ward-02', bedNumber: 'ICU-B02', bedType: 'ICU', status: 'AVAILABLE', dailyRate: 650.00 },
    { id: 'bed-06', wardId: 'ward-03', bedNumber: 'STE-401', bedType: 'PRIVATE', status: 'AVAILABLE', dailyRate: 350.00 },
  ];

  return {
    users,
    departments,
    doctors,
    patients,
    appointments,
    medicines,
    labTests,
    wards,
    beds,
  };
}

async function main() {
  console.log('🌱 Starting MediCore Database Seeder...');
  const data = await getSeedDataset();
  console.log(`✅ Seed dataset generated with ${data.users.length} users across 8 roles.`);
  console.log(`✅ ${data.doctors.length} doctors, ${data.patients.length} patients, ${data.medicines.length} medicines, ${data.beds.length} beds.`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
