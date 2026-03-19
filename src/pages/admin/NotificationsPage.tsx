import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Send, Users, MessageSquare, CheckCheck, AlertCircle, Clock } from 'lucide-react';
import { notificationsAPI, tenantsAPI } from '../../lib/api';
import type { Notification, Tenant } from '../../types';

const typeLabels: Record<string, { label: string; color: string }> = {
  SUBSCRIPTION_EXPIRY: { label: 'Abonnement', color: 'bg-orange-100 text-orange-700' },
  TRIAL_EXPIRY: { label: 'Essai', color: 'bg-yellow-100 text-yellow-700' },
  ADMIN_MESSAGE: { label: 'Message', color: 'bg-blue-100 text-blue-700' },
  SYSTEM: { label: 'Système', color: 'bg-gray-100 text-gray-700' },
};

export default function AdminNotificationsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'all' | 'send'>('all');
  const [sendForm, setSendForm] = useState({ tenantId: '', title: '', message: '', broadcast: false });
  const [sendMsg, setSendMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data } = await notificationsAPI.getAll();
      return data;
    },
  });

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await tenantsAPI.getAll();
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => {
      if (sendForm.broadcast) {
        return notificationsAPI.broadcast({ title: sendForm.title, message: sendForm.message });
      }
      return notificationsAPI.send({ tenantId: sendForm.tenantId, title: sendForm.title, message: sendForm.message });
    },
    onSuccess: () => {
      setSendMsg({ type: 'success', text: 'Message envoyé avec succès.' });
      setSendForm({ tenantId: '', title: '', message: '', broadcast: false });
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
      setTimeout(() => setSendMsg(null), 3000);
    },
    onError: (err: any) => {
      setSendMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'envoi.' });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.broadcast && !sendForm.tenantId) {
      setSendMsg({ type: 'error', text: 'Sélectionnez un commerçant ou activez la diffusion.' });
      return;
    }
    sendMutation.mutate();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <span className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Toutes les notifications</span>
            {notifications.length > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{notifications.length}</span>
            )}
          </span>
        </button>
        <button
          onClick={() => setTab('send')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'send' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <span className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Envoyer un message</span>
          </span>
        </button>
      </div>

      {tab === 'all' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Historique des notifications</h2>
            <p className="text-sm text-gray-500 mt-0.5">{notifications.length} notification(s) au total</p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const meta = typeLabels[n.type] || typeLabels.SYSTEM;
                return (
                  <div key={n.id} className={`p-4 flex items-start space-x-4 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                        {n.tenant && (
                          <span className="text-xs text-gray-500 font-medium">{n.tenant.name}</span>
                        )}
                        {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                      <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                    {n.isRead && <CheckCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'send' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 container">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Envoyer un message</h2>
              <p className="text-sm text-gray-500">Le commerçant recevra une notification</p>
            </div>
          </div>

          {sendMsg && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 text-sm ${
              sendMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <AlertCircle className="w-4 h-4" />
              <span>{sendMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            {/* Broadcast toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Diffuser à tous les commerçants</span>
              </div>
              <button
                type="button"
                onClick={() => setSendForm({ ...sendForm, broadcast: !sendForm.broadcast, tenantId: '' })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sendForm.broadcast ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sendForm.broadcast ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {!sendForm.broadcast && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commerçant</label>
                <select
                  value={sendForm.tenantId}
                  onChange={(e) => setSendForm({ ...sendForm, tenantId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un commerçant</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={sendForm.title}
                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Titre du message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Contenu du message..."
              />
            </div>

            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{sendMutation.isPending ? 'Envoi...' : sendForm.broadcast ? 'Diffuser à tous' : 'Envoyer'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
