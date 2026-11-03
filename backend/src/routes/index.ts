import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';
import recordRoutes from './record.routes';
import prescriptionRoutes from './prescription.routes';
import pharmacyRoutes from './pharmacy.routes';
import labRoutes from './lab.routes';
import billingRoutes from './billing.routes';
import bedRoutes from './bed.routes';
import staffRoutes from './staff.routes';
import aiRoutes from './ai.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import auditRoutes from './audit.routes';

const apiRouter = Router();

// Mount all core enterprise domain routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/medical-records', recordRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/pharmacy', pharmacyRoutes);
apiRouter.use('/lab', labRoutes);
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/beds', bedRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/audit-logs', auditRoutes);

// Discovery API
apiRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      patients: '/api/v1/patients',
      doctors: '/api/v1/doctors',
      appointments: '/api/v1/appointments',
      records: '/api/v1/medical-records',
      prescriptions: '/api/v1/prescriptions',
      pharmacy: '/api/v1/pharmacy',
      laboratory: '/api/v1/lab',
      billing: '/api/v1/billing',
      beds: '/api/v1/beds',
      staff: '/api/v1/staff',
      ai: '/api/v1/ai',
      reports: '/api/v1/reports',
      notifications: '/api/v1/notifications',
      auditLogs: '/api/v1/audit-logs',
    },
  });
});

export default apiRouter;
