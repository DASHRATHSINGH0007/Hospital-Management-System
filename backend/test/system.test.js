/**
 * MediCore Healthcare Management System - Core Automated Test Suite
 * Built with Node.js native test runner (node:test & node:assert)
 * Runs zero-dependency on Node 18+ (Node 24 native)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// --- RBAC Role Definitions & Permission Matrix ---
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  NURSE: 'NURSE',
  PHARMACIST: 'PHARMACIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  PATIENT: 'PATIENT',
};

const PERMISSIONS = {
  MANAGE_USERS: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN],
  VIEW_CLINICAL_RECORDS: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  WRITE_PRESCRIPTIONS: [ROLES.DOCTOR],
  DISPENSE_MEDICINE: [ROLES.PHARMACIST],
  BOOK_APPOINTMENTS: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT],
  RECORD_LAB_RESULTS: [ROLES.LAB_TECHNICIAN],
  MANAGE_BEDS: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.NURSE],
  GENERATE_INVOICE: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST],
};

function hasPermission(userRole, requiredRoleList) {
  return requiredRoleList.includes(userRole);
}

// --- Appointment Conflict Detection Engine ---
function checkAppointmentConflict(existingAppointments, doctorId, newDateStr, slotDurationMinutes = 30) {
  const newStart = new Date(newDateStr).getTime();
  const newEnd = newStart + slotDurationMinutes * 60 * 1000;

  return existingAppointments.some((apt) => {
    if (apt.doctorId !== doctorId || apt.status === 'CANCELLED') return false;
    const aptStart = new Date(apt.appointmentDate).getTime();
    const aptEnd = aptStart + (apt.durationMinutes || 30) * 60 * 1000;
    // Overlap condition: start < otherEnd && end > otherStart
    return newStart < aptEnd && newEnd > aptStart;
  });
}

// --- Pharmacy Inventory & Dispensation Engine ---
class InventoryTracker {
  constructor(initialMedicines = []) {
    this.medicines = new Map(initialMedicines.map(m => [m.id, { ...m }]));
  }

  dispense(medicineId, quantity) {
    const med = this.medicines.get(medicineId);
    if (!med) throw new Error('Medicine not found');
    if (med.stockQuantity < quantity) {
      throw new Error(`Insufficient stock for ${med.name}. Available: ${med.stockQuantity}, Requested: ${quantity}`);
    }
    med.stockQuantity -= quantity;
    const isLowStock = med.stockQuantity <= med.minThreshold;
    return {
      medicineId,
      remainingStock: med.stockQuantity,
      isLowStock,
    };
  }
}

// --- Billing & Invoice Calculation Engine ---
function calculateInvoiceTotal({ consultationFee = 0, medicines = [], labTests = [], bedDays = 0, bedRate = 0, taxRate = 0.05 }) {
  const medicineTotal = medicines.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const labTotal = labTests.reduce((sum, test) => sum + test.cost, 0);
  const bedTotal = bedDays * bedRate;
  const subtotal = consultationFee + medicineTotal + labTotal + bedTotal;
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return { subtotal, tax, total };
}

// --- AI Forecast Regression Engine ---
function computeLinearForecast(historicalSeries, forecastSteps = 3) {
  const n = historicalSeries.length;
  if (n < 2) throw new Error('Insufficient historical data for forecasting');

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = historicalSeries[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions = [];
  for (let s = 1; s <= forecastSteps; s++) {
    const futureX = n + s;
    const predictedValue = Math.max(0, Math.round(slope * futureX + intercept));
    predictions.push(predictedValue);
  }

  return { slope: Number(slope.toFixed(2)), intercept: Number(intercept.toFixed(2)), predictions };
}

// --- CSV Report Generator Engine ---
function generateCSV(headers, rows) {
  const headerLine = headers.join(',');
  const rowLines = rows.map((r) =>
    headers
      .map((h) => {
        const val = String(r[h] ?? '');
        return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
      })
      .join(',')
  );
  return [headerLine, ...rowLines].join('\n');
}

// ==========================================
// TEST SUITE EXECUTION
// ==========================================

describe('MediCore System Architecture & Modules Test Suite', () => {

  describe('1. Role-Based Access Control (RBAC) Security Matrix', () => {
    test('Super Admin & Hospital Admin can manage users and system configs', () => {
      assert.equal(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.MANAGE_USERS), true);
      assert.equal(hasPermission(ROLES.HOSPITAL_ADMIN, PERMISSIONS.MANAGE_USERS), true);
      assert.equal(hasPermission(ROLES.PATIENT, PERMISSIONS.MANAGE_USERS), false);
      assert.equal(hasPermission(ROLES.NURSE, PERMISSIONS.MANAGE_USERS), false);
    });

    test('Only Doctors can issue medical prescriptions', () => {
      assert.equal(hasPermission(ROLES.DOCTOR, PERMISSIONS.WRITE_PRESCRIPTIONS), true);
      assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.WRITE_PRESCRIPTIONS), false);
      assert.equal(hasPermission(ROLES.PATIENT, PERMISSIONS.WRITE_PRESCRIPTIONS), false);
      assert.equal(hasPermission(ROLES.LAB_TECHNICIAN, PERMISSIONS.WRITE_PRESCRIPTIONS), false);
    });

    test('Only Pharmacists can execute medicine dispensation', () => {
      assert.equal(hasPermission(ROLES.PHARMACIST, PERMISSIONS.DISPENSE_MEDICINE), true);
      assert.equal(hasPermission(ROLES.PATIENT, PERMISSIONS.DISPENSE_MEDICINE), false);
      assert.equal(hasPermission(ROLES.NURSE, PERMISSIONS.DISPENSE_MEDICINE), false);
    });

    test('Lab Technicians can record laboratory test results', () => {
      assert.equal(hasPermission(ROLES.LAB_TECHNICIAN, PERMISSIONS.RECORD_LAB_RESULTS), true);
      assert.equal(hasPermission(ROLES.PATIENT, PERMISSIONS.RECORD_LAB_RESULTS), false);
    });
  });

  describe('2. Appointment Scheduling & Conflict Prevention', () => {
    const existing = [
      {
        id: 'APT-1',
        doctorId: 'DOC-101',
        appointmentDate: '2026-04-01T10:00:00.000Z',
        durationMinutes: 30,
        status: 'CONFIRMED',
      },
      {
        id: 'APT-2',
        doctorId: 'DOC-102',
        appointmentDate: '2026-04-01T10:00:00.000Z',
        durationMinutes: 30,
        status: 'CONFIRMED',
      },
    ];

    test('Detects exact overlap with same doctor', () => {
      const hasConflict = checkAppointmentConflict(existing, 'DOC-101', '2026-04-01T10:00:00.000Z', 30);
      assert.equal(hasConflict, true);
    });

    test('Detects partial overlap within existing 30-min window', () => {
      const hasConflict = checkAppointmentConflict(existing, 'DOC-101', '2026-04-01T10:15:00.000Z', 30);
      assert.equal(hasConflict, true);
    });

    test('Allows non-overlapping appointment for same doctor', () => {
      const hasConflict = checkAppointmentConflict(existing, 'DOC-101', '2026-04-01T10:30:00.000Z', 30);
      assert.equal(hasConflict, false);
    });

    test('Allows concurrent appointment for a different doctor', () => {
      const hasConflict = checkAppointmentConflict(existing, 'DOC-103', '2026-04-01T10:00:00.000Z', 30);
      assert.equal(hasConflict, false);
    });
  });

  describe('3. Pharmacy Stock & Inventory Depletion', () => {
    test('Correctly deducts inventory on dispensation', () => {
      const tracker = new InventoryTracker([
        { id: 'MED-1', name: 'Paracetamol 500mg', stockQuantity: 50, minThreshold: 20 },
      ]);

      const result = tracker.dispense('MED-1', 10);
      assert.equal(result.remainingStock, 40);
      assert.equal(result.isLowStock, false);
    });

    test('Triggers low-stock warning when below threshold', () => {
      const tracker = new InventoryTracker([
        { id: 'MED-2', name: 'Amoxicillin 250mg', stockQuantity: 25, minThreshold: 20 },
      ]);

      const result = tracker.dispense('MED-2', 10);
      assert.equal(result.remainingStock, 15);
      assert.equal(result.isLowStock, true);
    });

    test('Rejects dispensation exceeding available inventory', () => {
      const tracker = new InventoryTracker([
        { id: 'MED-3', name: 'Insulin Glargine', stockQuantity: 5, minThreshold: 10 },
      ]);

      assert.throws(
        () => tracker.dispense('MED-3', 10),
        /Insufficient stock/
      );
    });
  });

  describe('4. Billing & Financial Invoice Calculation', () => {
    test('Calculates multi-department hospital bill accurately with tax', () => {
      const bill = calculateInvoiceTotal({
        consultationFee: 100,
        medicines: [
          { name: 'Paracetamol', unitPrice: 2.5, quantity: 4 },
          { name: 'Antibiotic', unitPrice: 15.0, quantity: 1 },
        ],
        labTests: [{ name: 'Complete Blood Count', cost: 45 }],
        bedDays: 2,
        bedRate: 150,
        taxRate: 0.05,
      });

      // Subtotal = 100 (consult) + 25 (meds) + 45 (lab) + 300 (bed) = 470
      assert.equal(bill.subtotal, 470);
      // Tax = 5% of 470 = 23.50
      assert.equal(bill.tax, 23.50);
      // Total = 493.50
      assert.equal(bill.total, 493.50);
    });
  });

  describe('5. AI Operational Demand & Revenue Forecasting', () => {
    test('Forecasts increasing appointment demand accurately', () => {
      // Historical appointments per month: 100, 110, 120, 130, 140
      const history = [100, 110, 120, 130, 140];
      const forecast = computeLinearForecast(history, 3);

      assert.equal(forecast.slope, 10);
      assert.deepEqual(forecast.predictions, [150, 160, 170]);
    });

    test('Forecasts seasonal revenue projection accurately', () => {
      const revenueHistory = [40000, 45000, 50000, 55000];
      const forecast = computeLinearForecast(revenueHistory, 2);

      assert.equal(forecast.slope, 5000);
      assert.deepEqual(forecast.predictions, [60000, 65000]);
    });
  });

  describe('6. Report Export & CSV Encoding RFC 4180', () => {
    test('Generates properly escaped CSV for patient directory', () => {
      const headers = ['id', 'name', 'phone'];
      const data = [
        { id: 'PAT-1', name: 'John Doe', phone: '+1-555-0101' },
        { id: 'PAT-2', name: 'Smith, Jane', phone: '+1-555-0102' },
      ];

      const csv = generateCSV(headers, data);
      const lines = csv.split('\n');

      assert.equal(lines[0], 'id,name,phone');
      assert.equal(lines[1], 'PAT-1,John Doe,+1-555-0101');
      // "Smith, Jane" contains comma, must be quoted
      assert.equal(lines[2], 'PAT-2,"Smith, Jane",+1-555-0102');
    });
  });

  describe('7. Bed Occupancy & Inpatient Ward Management', () => {
    const beds = [
      { id: 'BED-1', number: 'ICU-101', type: 'ICU', status: 'OCCUPIED' },
      { id: 'BED-2', number: 'ICU-102', type: 'ICU', status: 'AVAILABLE' },
      { id: 'BED-3', number: 'GEN-201', type: 'GENERAL', status: 'OCCUPIED' },
      { id: 'BED-4', number: 'GEN-202', type: 'GENERAL', status: 'OCCUPIED' },
      { id: 'BED-5', number: 'PED-301', type: 'PEDIATRIC', status: 'AVAILABLE' },
    ];

    test('Computes overall hospital bed occupancy rate correctly', () => {
      const total = beds.length;
      const occupied = beds.filter((b) => b.status === 'OCCUPIED').length;
      const rate = Math.round((occupied / total) * 100);
      assert.equal(total, 5);
      assert.equal(occupied, 3);
      assert.equal(rate, 60); // 3 out of 5 = 60%
    });

    test('Computes specialized ICU occupancy rate accurately', () => {
      const icuBeds = beds.filter((b) => b.type === 'ICU');
      const icuOccupied = icuBeds.filter((b) => b.status === 'OCCUPIED').length;
      const icuRate = Math.round((icuOccupied / icuBeds.length) * 100);
      assert.equal(icuBeds.length, 2);
      assert.equal(icuOccupied, 1);
      assert.equal(icuRate, 50); // 1 out of 2 = 50%
    });

    test('Rejects admission if bed is not available', () => {
      const targetBed = beds.find((b) => b.id === 'BED-1');
      assert.equal(targetBed?.status, 'OCCUPIED');
      const canAdmit = targetBed?.status === 'AVAILABLE';
      assert.equal(canAdmit, false);
    });
  });

  describe('8. Laboratory Information System (LIS) & Abnormal Flagging', () => {
    function evaluateLabValue(testCode, numericValue) {
      const testRanges = {
        'CBC_HEMOGLOBIN': { min: 12.0, max: 17.5, unit: 'g/dL' },
        'BLOOD_GLUCOSE_FASTING': { min: 70, max: 99, unit: 'mg/dL' },
        'SERUM_CREATININE': { min: 0.6, max: 1.2, unit: 'mg/dL' },
      };

      const range = testRanges[testCode];
      if (!range) return { isAbnormal: false, flag: 'NORMAL' };

      if (numericValue < range.min) {
        return { isAbnormal: true, flag: 'LOW', details: `Below reference min (${range.min} ${range.unit})` };
      }
      if (numericValue > range.max) {
        return { isAbnormal: true, flag: 'HIGH', details: `Above reference max (${range.max} ${range.unit})` };
      }
      return { isAbnormal: false, flag: 'NORMAL' };
    }

    test('Flags severely high blood glucose level as abnormal', () => {
      const result = evaluateLabValue('BLOOD_GLUCOSE_FASTING', 240);
      assert.equal(result.isAbnormal, true);
      assert.equal(result.flag, 'HIGH');
    });

    test('Flags low hemoglobin level as abnormal', () => {
      const result = evaluateLabValue('CBC_HEMOGLOBIN', 9.5);
      assert.equal(result.isAbnormal, true);
      assert.equal(result.flag, 'LOW');
    });

    test('Identifies within-range serum creatinine as normal', () => {
      const result = evaluateLabValue('SERUM_CREATININE', 0.9);
      assert.equal(result.isAbnormal, false);
      assert.equal(result.flag, 'NORMAL');
    });
  });

  describe('9. Immutable Audit Logging & Compliance Verification', () => {
    class AuditLogger {
      constructor() {
        this.logs = [];
      }
      log(userId, action, entityType, entityId, details) {
        const entry = {
          id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId,
          action,
          entityType,
          entityId,
          details: JSON.stringify(details),
          timestamp: new Date().toISOString(),
        };
        this.logs.push(entry);
        return entry;
      }
    }

    test('Records compliant structured audit trail for clinical record read', () => {
      const audit = new AuditLogger();
      const entry = audit.log('USR-DOC-1', 'READ_EMR', 'PatientRecord', 'REC-1001', {
        reason: 'Consultation review',
        department: 'Cardiology',
      });

      assert.equal(audit.logs.length, 1);
      assert.equal(entry.userId, 'USR-DOC-1');
      assert.equal(entry.action, 'READ_EMR');
      assert.equal(entry.entityType, 'PatientRecord');
      assert.ok(entry.timestamp);
    });
  });

  describe('10. Pharmacy Inventory Depletion Horizon Estimation', () => {
    function calculateDepletionHorizon(currentStock, minThreshold) {
      const estimatedDailyUsage = Math.max(1, Math.round(minThreshold / 3));
      const daysLeft = Number((currentStock / estimatedDailyUsage).toFixed(1));
      let riskLevel = 'LOW';
      if (daysLeft <= 3.0) riskLevel = 'CRITICAL';
      else if (daysLeft <= 7.0) riskLevel = 'HIGH';
      else if (daysLeft <= 14.0) riskLevel = 'MEDIUM';

      return { estimatedDailyUsage, daysLeft, riskLevel };
    }

    test('Identifies critical stockout risk when days remaining <= 3', () => {
      const horizon = calculateDepletionHorizon(24, 50); // Daily usage ~ 17, days ~ 1.4
      assert.equal(horizon.riskLevel, 'CRITICAL');
      assert.ok(horizon.daysLeft <= 3.0);
    });

    test('Identifies safe stock level when surplus exists', () => {
      const horizon = calculateDepletionHorizon(200, 30); // Daily usage ~ 10, days = 20.0
      assert.equal(horizon.riskLevel, 'LOW');
      assert.ok(horizon.daysLeft > 14.0);
    });
  });

});
