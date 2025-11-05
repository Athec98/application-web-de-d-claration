import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Check } from "lucide-react";
import { toast } from "sonner";
import { notificationService, type Notification } from "@/services/notificationService";

interface NotificationsPanelProps {
  trigger?: React.ReactNode;
}

export default function NotificationsPanel({ trigger }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, lu: true } : n
      ));
    } catch (error: any) {
      console.error("Erreur lors du marquage:", error);
      toast.error("Erreur lors du marquage de la notification");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      toast.success("Notification supprimée");
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'declaration_nouvelle':
        return '📋';
      case 'declaration_validee':
        return '✅';
      case 'declaration_rejetee':
        return '❌';
      case 'declaration_envoyee_hopital':
      case 'en_verification_hopital':
        return '🏥';
      case 'certificat_valide':
        return '✓';
      case 'certificat_rejete':
        return '✗';
      case 'acte_genere':
        return '📄';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'declaration_nouvelle':
      case 'declaration_envoyee_hopital':
      case 'en_verification_hopital':
        return 'bg-blue-100 text-blue-800';
      case 'declaration_validee':
      case 'certificat_valide':
      case 'acte_genere':
        return 'bg-green-100 text-green-800';
      case 'declaration_rejetee':
      case 'certificat_rejete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Aucune notification non lue'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border ${
                  !notification.lu ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <Badge className={getNotificationColor(notification.type)}>
                        {notification.type.replace(/_/g, ' ')}
                      </Badge>
                      {!notification.lu && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{notification.titre}</h4>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {!notification.lu && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Marquer comme lu"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDelete(notification._id)}
                      title="Supprimer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

