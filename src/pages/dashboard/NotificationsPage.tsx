import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { notificationsAPI } from '../../lib/api';
import type { Notification } from '../../types';

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  SUBSCRIPTION_EXPIRY: { label: 'Abonnement', color: 'text-orange-700', bg: 'bg-orange-100' },
  TRIAL_EXPIRY: { label: 'Essai gratuit', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  ADMIN_MESSAGE: { label: 'Message', color: 'text-blue-700', bg: 'bg-blue-100' },
  SYSTEM: { label: 'Système', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export default function MerchantNotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const { data } = await notificationsAPI.getMine();
      return data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unread} non lue{unread > 1 ? 's' : ''}</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.SYSTEM;
              return (
                <div
                  key={n.id}
                  className={`p-4 flex items-start space-x-4 transition-colors ${!n.isRead ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <MessageSquare className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                    <div className="flex items-center space-x-1 mt-1.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                  {!n.isRead ? (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      className="text-xs text-primary-600 hover:underline flex-shrink-0 mt-1"
                    >
                      Marquer lu
                    </button>
                  ) : (
                    <CheckCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
