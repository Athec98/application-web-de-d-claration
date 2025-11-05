import api from './api';

export interface Notification {
  _id: string;
  user: string;
  type: string;
  titre: string;
  message: string;
  declaration?: string;
  lu: boolean;
  dateLecture?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data.notifications || [];
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data.notification;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },
};

