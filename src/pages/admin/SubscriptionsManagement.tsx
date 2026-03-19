import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, TrendingUp, Users as UsersIcon, DollarSign,
  Plus, Edit, X, Check, Clock, Save
} from 'lucide-react';
import { subscriptionsAPI, tenantsAPI } from '../../lib/api';
import type { Plan } from '../../types';

const SUB_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  CANCELLED: 'Annulé',
};

export default function SubscriptionsManagement() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans-admin'],
    queryFn: async () => {
      const { data } = await subscriptionsAPI.getPlans(true);
      return data as Plan[];
    },
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await tenantsAPI.getAll();
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (planId: string) => subscriptionsAPI.togglePlanStatus(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans-admin'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => subscriptionsAPI.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans-admin'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowAddModal(false);
    },
  });

  // Trial config
  const { data: trialConfig } = useQuery({
    queryKey: ['trial-config'],
    queryFn: async () => {
      const { data } = await subscriptionsAPI.getTrialConfig();
      return data as { trialDurationDays: number };
    },
  });

  const [trialDays, setTrialDays] = useState<number | ''>('');
  const trialMutation = useMutation({
    mutationFn: (days: number) => subscriptionsAPI.updateTrialConfig(days),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trial-config'] }),
  });

  const stats = {
    totalRevenue: tenants?.reduce((sum: number, t: any) => {
      const plan = plans?.find((p) => p.id === t.subscription?.plan);
      return sum + (plan?.price || 0);
    }, 0) || 0,
    activeSubscriptions: tenants?.filter((t: any) => t.subscription?.status === 'ACTIVE').length || 0,
    trialUsers: tenants?.filter((t: any) => t.status === 'TRIAL').length || 0,
    avgRevenue: 0,
  };
  stats.avgRevenue = stats.activeSubscriptions > 0
    ? Math.round(stats.totalRevenue / stats.activeSubscriptions)
    : 0;

  const planDistribution = plans?.map((plan) => ({
    ...plan,
    count: tenants?.filter((t: any) => t.subscription?.plan === plan.id).length || 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign className="w-6 h-6" />} label="Revenus mensuels" value={`${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`} color="green" />
        <StatCard icon={<CreditCard className="w-6 h-6" />} label="Abonnements actifs" value={stats.activeSubscriptions} color="blue" />
        <StatCard icon={<UsersIcon className="w-6 h-6" />} label="Essais gratuits" value={stats.trialUsers} color="yellow" />
        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Revenu moyen" value={`${stats.avgRevenue.toLocaleString('fr-FR')} FCFA`} color="purple" />
      </div>

      {/* Configuration essai gratuit */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Essai gratuit</h2>
            <p className="text-sm text-gray-500">
              Durée actuelle : <span className="font-semibold text-yellow-600">
                {trialConfig?.trialDurationDays ?? '…'} jours
              </span>
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chaque nouveau commerçant qui s'inscrit bénéficie automatiquement d'un essai gratuit de cette durée avant de devoir souscrire à un plan.
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="number"
              min={1}
              max={365}
              value={trialDays === '' ? (trialConfig?.trialDurationDays ?? '') : trialDays}
              onChange={(e) => setTrialDays(e.target.value === '' ? '' : Number(e.target.value))}
              className="input pr-12"
              placeholder="30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">jours</span>
          </div>
          <button
            onClick={() => {
              const val = trialDays === '' ? trialConfig?.trialDurationDays : trialDays;
              if (val && val > 0) {
                trialMutation.mutate(val as number);
                setTrialDays('');
              }
            }}
            disabled={trialMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {trialMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {trialMutation.isSuccess && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Sauvegardé
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Entre 1 et 365 jours</p>
      </div>

      {/* Gestion des plans */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Gestion des plans</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un plan</span>
          </button>
        </div>

        <div className="space-y-3">
          {planDistribution?.map((plan) => (
            <div
              key={plan.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                plan.isActive
                  ? 'border-gray-200 bg-white hover:border-primary-200'
                  : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              {/* Infos plan */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  {plan.popular && plan.isActive && (
                    <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">Populaire</span>
                  )}
                  {!plan.isActive && (
                    <span className="px-2 py-0.5 bg-gray-400 text-white text-xs font-semibold rounded-full">Inactif</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{plan.description}</p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="font-bold text-gray-900">
                    {plan.price.toLocaleString('fr-FR')} FCFA
                    <span className="font-normal text-gray-500"> / {plan.period}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span className="font-semibold text-gray-700">{plan.count}</span> abonnés
                  </span>
                  <span className="text-gray-400 hidden md:inline">
                    {plan.features.length} fonctionnalités
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="btn btn-secondary flex items-center gap-1.5 px-3 py-2 text-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>

                {/* Switch */}
                <button
                  onClick={() => toggleMutation.mutate(plan.id)}
                  disabled={toggleMutation.isPending}
                  title={plan.isActive ? 'Désactiver' : 'Activer'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    plan.isActive ? 'bg-green-500' : 'bg-red-400'
                  } ${toggleMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    plan.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Abonnements récents */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Abonnements récents</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Commerçant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Date début</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Date fin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants?.slice(0, 10).map((tenant: any) => {
                const plan = plans?.find((p) => p.id === tenant.subscription?.plan);
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{tenant.name}</p>
                      <p className="text-xs text-gray-500">{tenant.phone || tenant.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-800">
                        {plan?.name || tenant.subscription?.plan || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tenant.subscription?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        tenant.subscription?.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                        tenant.subscription?.status === 'CANCELLED' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {SUB_STATUS_LABELS[tenant.subscription?.status] || tenant.subscription?.status || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">
                      {tenant.subscription?.startDate
                        ? new Date(tenant.subscription.startDate).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">
                      {tenant.subscription?.endDate
                        ? new Date(tenant.subscription.endDate).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <PlanModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}

      {editingPlan && (
        <PlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSubmit={(data) => {
            subscriptionsAPI.updatePlan(editingPlan.id, data).then(() => {
              queryClient.invalidateQueries({ queryKey: ['plans-admin'] });
              queryClient.invalidateQueries({ queryKey: ['plans'] });
              setEditingPlan(null);
            });
          }}
          isLoading={false}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PlanModal({ plan, onClose, onSubmit, isLoading }: {
  plan?: Plan;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const isEdit = !!plan;
  const [formData, setFormData] = useState({
    id: plan?.id || '',
    name: plan?.name || '',
    price: plan?.price ?? 0,
    period: plan?.period || 'mois',
    description: plan?.description || '',
    features: plan?.features?.length ? [...plan.features] : [''],
    maxProducts: plan?.maxProducts ?? -1,
    maxEmployees: plan?.maxEmployees ?? -1,
    maxStores: plan?.maxStores ?? 1,
    popular: plan?.popular || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, features: formData.features.filter((f) => f.trim() !== '') };
    if (isEdit) {
      // id is not part of UpdatePlanDto — remove it
      const { id: _id, ...updatePayload } = payload;
      onSubmit(updatePayload);
    } else {
      onSubmit(payload);
    }
  };

  const updateFeature = (i: number, val: string) => {
    const f = [...formData.features]; f[i] = val;
    setFormData({ ...formData, features: f });
  };
  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
  const removeFeature = (i: number) =>
    setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{isEdit ? `Modifier: ${plan!.name}` : 'Ajouter un plan'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ID du plan *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                  className="input"
                  placeholder="MENSUEL_PLUS"
                  required
                />
              </div>
            )}
            <div className={isEdit ? 'col-span-2' : ''}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du plan *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Mensuel Plus"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prix (FCFA) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="input"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Période *</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="input"
              >
                <option value="mois">Mois</option>
                <option value="trimestre">Trimestre (3 mois)</option>
                <option value="semestre">Semestre (6 mois)</option>
                <option value="an">Année</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Produits</label>
              <input type="number" value={formData.maxProducts} onChange={(e) => setFormData({ ...formData, maxProducts: Number(e.target.value) })} className="input" />
              <p className="text-xs text-gray-400 mt-1">-1 = illimité</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Employés</label>
              <input type="number" value={formData.maxEmployees} onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })} className="input" />
              <p className="text-xs text-gray-400 mt-1">-1 = illimité</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Boutiques</label>
              <input type="number" value={formData.maxStores} onChange={(e) => setFormData({ ...formData, maxStores: Number(e.target.value) })} className="input" />
              <p className="text-xs text-gray-400 mt-1">-1 = illimité</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fonctionnalités</label>
            <div className="space-y-2">
              {formData.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={f}
                      onChange={(e) => updateFeature(i, e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm"
                      placeholder="Ex: Produits illimités"
                    />
                  </div>
                  {formData.features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addFeature} className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
              + Ajouter une fonctionnalité
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="popular-check"
              checked={formData.popular}
              onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="popular-check" className="text-sm font-medium text-gray-700">
              Marquer comme populaire
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary flex-1">
              {isLoading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
