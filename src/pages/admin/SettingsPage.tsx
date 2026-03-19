import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Lock, Phone, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { usersAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.email || '', // phone stored as email
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const profileMutation = useMutation({
    mutationFn: () =>
      usersAPI.updateProfile({ name: profileForm.name, phone: profileForm.phone }),
    onSuccess: (res) => {
      setUser({ ...user!, name: res.data.name, email: res.data.email });
      setProfileMsg({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setTimeout(() => setProfileMsg(null), 3000);
    },
    onError: (err: any) => {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      usersAPI.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Mot de passe modifié avec succès.' });
      setTimeout(() => setPasswordMsg(null), 3000);
    },
    onError: (err: any) => {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors du changement.' });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Informations du profil</h2>
            <p className="text-sm text-gray-500">Modifiez votre nom et numéro de téléphone</p>
          </div>
        </div>

        {profileMsg && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 text-sm ${
            profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); profileMutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Numéro de téléphone</span>
              </span>
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+221XXXXXXXXX"
            />
          </div>
          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{profileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h2>
            <p className="text-sm text-gray-500">Minimum 8 caractères</p>
          </div>
        </div>

        {passwordMsg && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 text-sm ${
            passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="flex items-center space-x-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>{passwordMutation.isPending ? 'Modification...' : 'Changer le mot de passe'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
