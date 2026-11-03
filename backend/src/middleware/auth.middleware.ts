import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { store } from '../services/store.service';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    isActive?: boolean;
  };
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access denied. Missing or invalid Authorization header.',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'Your session has expired or the token is invalid. Please log in again.',
      },
    });
  }

  // Verify that the user exists and is active in store
  const user = store.users.find((u) => u.id === decoded.userId);
  if (!user || !user.isActive) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'USER_DEACTIVATED',
        message: 'The associated user account has been disabled or removed.',
      },
    });
  }

  req.user = decoded;
  next();
};
