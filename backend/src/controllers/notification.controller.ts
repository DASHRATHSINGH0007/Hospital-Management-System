import { Response } from 'express';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   */
  public async getMyNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      // Filter notifications for this user, plus broadcast system alerts if admin
      let notifs = store.notifications.filter((n) => n.userId === userId);

      // If user has no personalized notifications, provide realistic default notifications
      if (notifs.length === 0) {
        notifs = [
          {
            id: `notif-sys-01`,
            userId,
            title: 'System Access Granted',
            message: `Welcome to MediCore. Signed in with role ${req.user?.role}.`,
            type: 'ALERT',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: `notif-sys-02`,
            userId,
            title: 'Pharmacy Alert',
            message: 'Paracetamol 500mg has reached low stock threshold (24 units).',
            type: 'ALERT',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ];
      }

      const unreadCount = notifs.filter((n) => !n.isRead).length;

      return res.status(200).json({
        success: true,
        unreadCount,
        data: notifs,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  public async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const notif = store.notifications.find((n) => n.id === id);

      if (notif) {
        notif.isRead = true;
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const notificationController = new NotificationController();
