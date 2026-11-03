// ==========================================
// MediCore High-Fidelity Data Store Service
// Acts as a repository layer bridging Prisma and fallback memory store
// ==========================================

import { getSeedDataset } from '../../prisma/seed';

export class StoreService {
  private static instance: StoreService;
  public users: any[] = [];
  public departments: any[] = [];
  public doctors: any[] = [];
  public patients: any[] = [];
  public appointments: any[] = [];
  public medicalRecords: any[] = [];
  public prescriptions: any[] = [];
  public medicines: any[] = [];
  public labTests: any[] = [];
  public labReports: any[] = [];
  public wards: any[] = [];
  public beds: any[] = [];
  public admissions: any[] = [];
  public bills: any[] = [];
  public payments: any[] = [];
  public notifications: any[] = [];
  public auditLogs: any[] = [];
  private isInitialized = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  public async init() {
    if (this.isInitialized) return;
    try {
      const seed = await getSeedDataset();
      this.users = seed.users;
      this.departments = seed.departments;
      this.doctors = seed.doctors;
      this.patients = seed.patients;
      this.appointments = seed.appointments;
      this.medicines = seed.medicines;
      this.labTests = seed.labTests;
      this.wards = seed.wards;
      this.beds = seed.beds;

      // Seed initial prescriptions
      this.prescriptions = [
        {
          id: 'rx-01',
          patientId: 'pat-01',
          doctorId: 'doc-01',
          status: 'DISPENSED',
          notes: 'Take after food. Monitor BP.',
          items: [
            { id: 'rxi-01', medicineId: 'med-01', dosage: '100mg', frequency: 'Once daily after breakfast', durationDays: 30 }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'rx-02',
          patientId: 'pat-02',
          doctorId: 'doc-02',
          status: 'PENDING',
          notes: 'Take whenever severe headache triggers.',
          items: [
            { id: 'rxi-02', medicineId: 'med-02', dosage: '500mg', frequency: 'As needed (max 3/day)', durationDays: 7 }
          ],
          createdAt: new Date().toISOString()
        }
      ];

      // Seed initial bills
      this.bills = [
        {
          id: 'bill-01',
          patientId: 'pat-01',
          billNumber: 'INV-2026-0001',
          subTotal: 125.50,
          taxAmount: 6.25,
          discountAmount: 0,
          totalAmount: 131.75,
          paidAmount: 131.75,
          status: 'PAID',
          dueDate: new Date().toISOString(),
          items: [
            { id: 'bi-01', itemType: 'CONSULTATION', description: 'Cardiology Consultation Fee (Dr. Smith)', unitPrice: 120.00, quantity: 1, totalPrice: 120.00 },
            { id: 'bi-02', itemType: 'MEDICINE', description: 'Aspirin (100mg) - 30 tabs', unitPrice: 5.50, quantity: 1, totalPrice: 5.50 }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'bill-02',
          patientId: 'pat-02',
          billNumber: 'INV-2026-0002',
          subTotal: 153.00,
          taxAmount: 7.65,
          discountAmount: 0,
          totalAmount: 160.65,
          paidAmount: 0,
          status: 'PENDING',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          items: [
            { id: 'bi-03', itemType: 'CONSULTATION', description: 'Neurology Consultation (Dr. Jones)', unitPrice: 150.00, quantity: 1, totalPrice: 150.00 },
            { id: 'bi-04', itemType: 'MEDICINE', description: 'Paracetamol (500mg)', unitPrice: 3.00, quantity: 1, totalPrice: 3.00 }
          ],
          createdAt: new Date().toISOString()
        }
      ];

      this.isInitialized = true;
    } catch (e) {
      console.error('Failed to initialize seed dataset in StoreService:', e);
    }
  }

  // Audit Logging Helper
  public logAudit(userId: string | null, action: string, entityType: string, entityId: string | null, details: any) {
    const log = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      action,
      entityType,
      entityId,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    // Keep only last 200 logs in memory
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    return log;
  }
}

export const store = StoreService.getInstance();
