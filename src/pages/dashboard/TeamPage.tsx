import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Plus, X, UserCheck, UserX, Eye, EyeOff,
  Copy, CheckCircle, Phone, Lock, User,
} from 'lucide-react';
import { usersAPI } from '../../lib/api';
import type { User as UserType } from '../../types';

const roleLabels: Record<string, string> = {
  ADMIN_COMMERCANT: 'Gérant',
  EMPLOYE: 'Employé',
};

interface CreatedEmployee {
  name: string;
  identifier: string; // phone or email used as login
  password: string;
}

export default function TeamPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatedEmployee | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['team'],
    queryFn: async () => {
      const { data } = await usersAPI.getAll();
      return data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      usersAPI.invite({ name: form.name, email: form.phone, password: form.password }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] });
      setCreated({ name: form.name, identifier: form.phone, password: form.password });
      setModal(false);
      setForm({ name: '', phone: '', password: '' });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || "Erreur lors de la création");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersAPI.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) {
      setError('Tous les champs sont requis');
      return;
    }
    setError('');
    inviteMutation.mutate();
  };

  const openModal = () => {
    setForm({ name: '', phone: '', password: '' });
    setError('');
    setShowPassword(false);
    setModal(true);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const employees = users.filter((u) => u.role === 'EMPLOYE' as any);
  const managers = users.filter((u) => u.role !== 'EMPLOYE' as any);

  return (
    <div className="space-y-5">
      {/* Created employee credentials banner */}
      {created && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-800">Employé créé avec succès !</p>
            </div>
            <button onClick={() => setCreated(null)} className="text-green-600 hover:text-green-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-green-700 mb-3">
            Partagez ces identifiants avec <span className="font-semibold">{created.name}</span> pour qu'il puisse se connecter.
          </p>
          <div className="space-y-2">
            <CredentialRow
              icon={<Phone className="w-4 h-4" />}
              label="Identifiant"
              value={created.identifier}
              onCopy={() => copyToClipboard(created.identifier, 'id')}
              copied={copied === 'id'}
            />
            <CredentialRow
              icon={<Lock className="w-4 h-4" />}
              label="Mot de passe"
              value={created.password}
              onCopy={() => copyToClipboard(created.password, 'pwd')}
              copied={copied === 'pwd'}
            />
          </div>
          <p className="text-xs text-green-600 mt-3">
            L'employé peut se connecter sur <span className="font-mono font-semibold">/login</span> et accéder au point de vente.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} membre{users.length > 1 ? 's' : ''}</p>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-400 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un employé</span>
        </button>
      </div>

      {/* Managers */}
      {managers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gérants</p>
          </div>
          <div className="divide-y divide-gray-100">
            {managers.map((u) => <UserRow key={u.id} user={u} onToggle={() => toggleMutation.mutate(u.id)} />)}
          </div>
        </div>
      )}

      {/* Employees */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Employés ({employees.length})
          </p>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Chargement...</div>
        ) : employees.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">Aucun employé — ajoutez-en un</p>
            <button onClick={openModal} className="mt-3 text-sm text-primary-600 hover:underline">
              + Ajouter un employé
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {employees.map((u) => (
              <UserRow key={u.id} user={u} onToggle={() => toggleMutation.mutate(u.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-semibold text-gray-900">Ajouter un employé</h2>
                <p className="text-xs text-gray-500 mt-0.5">Il pourra se connecter immédiatement</p>
              </div>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-5 space-y-4">
              {error && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Prénom Nom"
                    required
                  />
                </div>
              </div>

              {/* Phone / identifier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone * <span className="text-xs font-normal text-gray-400">(identifiant de connexion)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+221771234567"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">L'employé utilisera ce numéro pour se connecter</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Minimum 6 caractères"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                Après création, les identifiants seront affichés pour que vous puissiez les partager avec l'employé.
              </div>

              <div className="flex justify-end space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {inviteMutation.isPending ? 'Création...' : 'Créer l\'employé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onToggle }: { user: UserType; onToggle: () => void }) {
  const roleLabels: Record<string, string> = {
    ADMIN_COMMERCANT: 'Gérant',
    EMPLOYE: 'Employé',
  };

  // Display phone (stored as email field)
  const displayId = user.email?.includes('@invk.local') ? '' : user.email;

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center space-x-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          user.isActive ? 'bg-primary-100' : 'bg-gray-100'
        }`}>
          <span className={`text-sm font-semibold ${user.isActive ? 'text-primary-700' : 'text-gray-400'}`}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className={`text-sm font-medium ${user.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{user.name}</p>
          {displayId && <p className="text-xs text-gray-400 font-mono">{displayId}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
          {roleLabels[user.role] || user.role}
        </span>
        {!user.isActive && (
          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Inactif</span>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg transition-colors ${
            user.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={user.isActive ? 'Désactiver' : 'Activer'}
        >
          {user.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function CredentialRow({
  icon, label, value, onCopy, copied,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-white border border-green-200 rounded-lg px-3 py-2">
      <div className="flex items-center space-x-2 text-green-700">
        {icon}
        <span className="text-xs text-gray-500">{label} :</span>
        <span className="text-sm font-mono font-semibold text-gray-900">{value}</span>
      </div>
      <button
        onClick={onCopy}
        className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
        title="Copier"
      >
        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
