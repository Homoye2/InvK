import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Lock, Save, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { usersAPI, subscriptionsAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import PhoneInput from '../../components/PhoneInput';

export default function MerchantSettingsPage() {
  const { user, setUser } = useAuthStore();

  // phone is stored in email field for phone-based users
  const displayPhone = user?.phone || (user?.email?.startsWith('+') ? user.email : '');

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: displayPhone });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      const { data } = await subscriptionsAPI.getUsage();
      return data;
    },
  });

  const profileMutation = useMutation({
    mutationFn: () => usersAPI.updateProfile({ name: profileForm.name, phone: profileForm.phone }),
    onSuccess: (res) => {
      setUser({ ...user!, name: res.data.name, email: res.data.email });
      setProfileMsg({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setTimeout(() => setProfileMsg(null), 3000);
    },
    onError: (err: any) => setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' }),
  });

  const passwordMutation = useMutation({
    mutationFn: () => usersAPI.updateProfile({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Mot de passe modifié avec succès.' });
      setTimeout(() => setPasswordMsg(null), 3000);
    },
    onError: (err: any) => setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors du changement.' }),
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Minimum 8 caractères.' });
      return;
    }
    passwordMutation.mutate();
  };

  const planLabels: Record<string, string> = {
    MENSUEL: 'Mensuel', TRIMESTRIEL: 'Trimestriel', SEMESTRIEL: 'Semestriel',
    ANNUEL: 'Annuel', ENTERPRISE: 'Enterprise',
  };

  return (
    <div className="container space-y-6">
      {/* Subscription info */}
      {usage && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Mon abonnement</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Plan actuel</p>
              <p className="font-semibold text-gray-900">{planLabels[usage.plan] || usage.plan}</p>
            </div>
            <div>
              <p className="text-gray-500">Statut</p>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                usage.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                usage.status === 'TRIAL' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {usage.status === 'ACTIVE' ? 'Actif' : usage.status === 'TRIAL' ? 'Essai gratuit' : 'Expiré'}
              </span>
            </div>
            {usage.endDate && (
              <div>
                <p className="text-gray-500">Expire le</p>
                <p className="font-medium text-gray-900">{new Date(usage.endDate).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Produits</p>
              <p className="font-medium text-gray-900">
                {usage.products.used} / {usage.products.unlimited ? '∞' : usage.products.limit}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Informations du profil</h2>
            <p className="text-xs text-gray-500">Nom et numéro de téléphone</p>
          </div>
        </div>

        {profileMsg && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 text-sm ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); profileMutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center space-x-1"><span>📞</span><span>Téléphone</span></span>
            </label>
            <PhoneInput
              value={profileForm.phone}
              onChange={(v) => setProfileForm({ ...profileForm, phone: v })}
            />
          </div>
          <button type="submit" disabled={profileMutation.isPending}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm">
            <Save className="w-4 h-4" />
            <span>{profileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Changer le mot de passe</h2>
            <p className="text-xs text-gray-500">Minimum 8 caractères</p>
          </div>
        </div>

        {passwordMsg && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 text-sm ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'currentPassword' ? 'Mot de passe actuel' : field === 'newPassword' ? 'Nouveau mot de passe' : 'Confirmer'}
              </label>
              <input type="password" value={passwordForm[field]} onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          ))}
          <button type="submit" disabled={passwordMutation.isPending}
            className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm">
            <Lock className="w-4 h-4" />
            <span>{passwordMutation.isPending ? 'Modification...' : 'Changer le mot de passe'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
