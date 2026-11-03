import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const UserRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  NURSE: 'NURSE',
  PHARMACIST: 'PHARMACIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  PATIENT: 'PATIENT',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

/**
 * Authorize specified roles to access a resource
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required before permission evaluation.',
        },
      });
    }

    // Super Admin has universal access
    if (req.user.role === UserRoles.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`,
          requiredRoles: allowedRoles,
        },
      });
    }

    next();
  };
};
