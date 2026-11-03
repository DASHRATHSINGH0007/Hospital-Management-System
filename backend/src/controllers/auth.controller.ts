import { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  /**
   * POST /api/v1/auth/login
   */
  public async login(req: Request, res: Response) {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            details: validation.error.format(),
          },
        });
      }

      const { email, password } = validation.data;
      const normalizedEmail = email.toLowerCase().trim();

      // Look up user in store
      const user = store.users.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: 'Your account has been deactivated. Please contact an administrator.',
          },
        });
      }

      // Generate JWT Token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      // Log successful login in audit log
      store.logAudit(user.id, 'LOGIN', 'User', user.id, {
        email: user.email,
        role: user.role,
        ip: req.ip,
      });

      // Find linked profile
      let profile = null;
      if (user.role === 'DOCTOR') {
        profile = store.doctors.find((d) => d.userId === user.id) || null;
      } else if (user.role === 'PATIENT') {
        profile = store.patients.find((p) => p.userId === user.id) || null;
      }

      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            profile,
          },
        },
      });
    } catch (error: any) {
      console.error('Login Error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  }

  /**
   * POST /api/v1/auth/register
   */
  public async register(req: Request, res: Response) {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            details: validation.error.format(),
          },
        });
      }

      const { email, password, firstName, lastName, role, phone } = validation.data;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = store.users.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email address is already registered.',
          },
        });
      }

      const passwordHash = await hashPassword(password);
      const newUser = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        passwordHash,
        role,
        firstName,
        lastName,
        phone: phone || null,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.users.push(newUser);

      // If registered as patient, create corresponding patient profile
      if (role === 'PATIENT') {
        const patientCode = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;
        const newPatient = {
          id: `pat-${Date.now()}`,
          userId: newUser.id,
          patientCode,
          firstName,
          lastName,
          dateOfBirth: '1995-01-01',
          gender: 'Unspecified',
          bloodGroup: 'O+',
          phone: phone || 'N/A',
          address: 'Self Registered',
          emergencyContact: 'None',
          allergies: 'None',
          medicalHistory: 'New Patient Registration',
          createdAt: new Date().toISOString(),
        };
        store.patients.push(newPatient);
      }

      store.logAudit(newUser.id, 'REGISTER', 'User', newUser.id, {
        email: newUser.email,
        role: newUser.role,
      });

      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phone: newUser.phone,
          },
        },
      });
    } catch (error: any) {
      console.error('Register Error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  public async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const user = store.users.find((u) => u.id === req.user!.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      let profile = null;
      if (user.role === 'DOCTOR') {
        profile = store.doctors.find((d) => d.userId === user.id) || null;
      } else if (user.role === 'PATIENT') {
        profile = store.patients.find((p) => p.userId === user.id) || null;
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            profile,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  public async logout(req: AuthenticatedRequest, res: Response) {
    if (req.user) {
      store.logAudit(req.user.userId, 'LOGOUT', 'User', req.user.userId, {
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  /**
   * GET /api/v1/auth/demo-credentials
   * Quick access demo logins for all 8 roles
   */
  public getDemoCredentials(req: Request, res: Response) {
    const credentials = [
      { role: 'SUPER_ADMIN', email: 'superadmin@medicore.com', password: 'admin123', name: 'System SuperAdmin', desc: 'Universal platform management' },
      { role: 'HOSPITAL_ADMIN', email: 'admin@medicore.com', password: 'admin123', name: 'Eleanor Vance', desc: 'Hospital resource, bed & financial director' },
      { role: 'DOCTOR', email: 'dr.smith@medicore.com', password: 'doctor123', name: 'Dr. John Smith', desc: 'Cardiology Attending Physician' },
      { role: 'RECEPTIONIST', email: 'receptionist@medicore.com', password: 'rec123', name: 'Clara Oswald', desc: 'Front desk intake & doctor appointments' },
      { role: 'NURSE', email: 'nurse@medicore.com', password: 'nurse123', name: 'Rory Williams', desc: 'Inpatient wards, bed tracking & vitals recorder' },
      { role: 'PHARMACIST', email: 'pharmacist@medicore.com', password: 'pharma123', name: 'Grace Hopper', desc: 'Medicine dispensary & stock reorder manager' },
      { role: 'LAB_TECHNICIAN', email: 'labtech@medicore.com', password: 'lab123', name: 'Rosalind Franklin', desc: 'Diagnostic testing, sample analysis & report signer' },
      { role: 'PATIENT', email: 'alice@medicore.com', password: 'patient123', name: 'Alice Johnson', desc: 'Patient self-service portal' },
    ];

    return res.status(200).json({
      success: true,
      credentials,
    });
  }
}

export const authController = new AuthController();
