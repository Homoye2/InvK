import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, Download, Eye, Ban, CheckCircle,
  X, Users, Package, ShoppingCart, CreditCard, Phone, Mail, Calendar
} from 'lucide-react';
import { tenantsAPI, subscriptionsAPI } from '../../lib/api';
import type { Plan } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  TRIAL: 'En essai',
  TRIAL_EXPIRED: 'Essai expiré',
  SUSPENDED: 'Suspendu',
  CANCELLED: 'Annulé',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  TRIAL: 'bg-yellow-100 text-yellow-700',
  TRIAL_EXPIRED: 'bg-orange-100 text-orange-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await tenantsAPI.getAll();
      return data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['plans-admin'],
    queryFn: async () => {
      const { data } = await subscriptionsAPI.getPlans(true);
      return data as Plan[];
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => tenantsAPI.suspend(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => tenantsAPI.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });

  const changePlanMutation = useMutation({
    mutationFn: ({ id, planId }: { id: string; planId: string }) =>
      tenantsAPI.changePlan(id, planId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });

  const filteredTenants = tenants?.filter((t: any) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = (tenant: any) => {
    setSelectedTenant(tenant);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: tenants?.length || 0, color: 'blue' },
          { label: 'Actifs', value: tenants?.filter((t: any) => t.status === 'ACTIVE').length || 0, color: 'green' },
          { label: 'En essai', value: tenants?.filter((t: any) => t.status === 'TRIAL').length || 0, color: 'yellow' },
          { label: 'Expirés', value: tenants?.filter((t: any) => t.status === 'TRIAL_EXPIRED').length || 0, color: 'orange' },
          { label: 'Suspendus', value: tenants?.filter((t: any) => t.status === 'SUSPENDED').length || 0, color: 'red' },
        ].map((s) => (
          <div key={s.label} className="card py-3 px-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${
              s.color === 'green' ? 'text-green-600' :
              s.color === 'yellow' ? 'text-yellow-600' :
              s.color === 'orange' ? 'text-orange-600' :
              s.color === 'red' ? 'text-red-600' :
              'text-blue-600'
            }`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-9 pr-8"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="TRIAL">En essai</option>
                <option value="ACTIVE">Actif</option>
                <option value="TRIAL_EXPIRED">Essai expiré</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
            <button className="btn btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Commerçant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Statut</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Fin essai</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Inscription</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTenants?.map((tenant: any) => {
                const plan = plans?.find((p) => p.id === tenant.subscription?.plan);
                const isPending =
                  suspendMutation.isPending || activateMutation.isPending;
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {tenant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{tenant.name}</p>
                          <p className="text-xs text-gray-400">#{tenant.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm space-y-0.5">
                        <p className="text-gray-800">{tenant.phone || '—'}</p>
                        {tenant.email && !tenant.email.startsWith('+') && (
                          <p className="text-gray-500 text-xs">{tenant.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[tenant.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[tenant.status] || tenant.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {plan?.name || tenant.subscription?.plan || 'N/A'}
                        </span>
                        {tenant.subscription?.status && (
                          <p className={`text-xs mt-0.5 ${
                            tenant.subscription.status === 'ACTIVE' ? 'text-green-600' :
                            tenant.subscription.status === 'EXPIRED' ? 'text-red-500' :
                            'text-gray-500'
                          }`}>
                            {tenant.subscription.status}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 hidden lg:table-cell">
                      {tenant.trialEndsAt
                        ? new Date(tenant.trialEndsAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {/* Voir détails */}
                        <button
                          onClick={() => openDetail(tenant)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>

                        {/* Suspendre / Activer */}
                        {tenant.status !== 'SUSPENDED' ? (
                          <button
                            onClick={() => suspendMutation.mutate(tenant.id)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Suspendre le compte"
                          >
                            <Ban className="w-4 h-4 text-red-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateMutation.mutate(tenant.id)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Réactiver le compte"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}

                        {/* Changer plan */}
                        <select
                          value={tenant.subscription?.plan || ''}
                          onChange={(e) =>
                            changePlanMutation.mutate({ id: tenant.id, planId: e.target.value })
                          }
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 hover:border-primary-400 focus:outline-none focus:border-primary-500 transition-colors"
                          title="Changer le plan"
                        >
                          <option value="" disabled>Plan</option>
                          {plans?.filter(p => p.isActive || p.id === tenant.subscription?.plan).map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTenants?.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun commerçant trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          plans={plans || []}
          onClose={() => setShowDetailModal(false)}
          onSuspend={(id) => { suspendMutation.mutate(id); setShowDetailModal(false); }}
          onActivate={(id) => { activateMutation.mutate(id); setShowDetailModal(false); }}
          onChangePlan={(id, planId) => changePlanMutation.mutate({ id, planId })}
        />
      )}
    </div>
  );
}

function TenantDetailModal({ tenant, plans, onClose, onSuspend, onActivate, onChangePlan }: {
  tenant: any;
  plans: Plan[];
  onClose: () => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onChangePlan: (id: string, planId: string) => void;
}) {
  const plan = plans.find((p) => p.id === tenant.subscription?.plan);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tenant.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[tenant.status] || 'bg-gray-100 text-gray-700'}`}>
                {STATUS_LABELS[tenant.status] || tenant.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Infos contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="text-sm font-medium">{tenant.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">
                  {tenant.email && !tenant.email.startsWith('+') ? tenant.email : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Inscription</p>
                <p className="text-sm font-medium">{new Date(tenant.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Fin essai</p>
                <p className="text-sm font-medium">
                  {tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-700">{tenant._count?.users || 0}</p>
              <p className="text-xs text-blue-600">Utilisateurs</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Package className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{tenant._count?.products || 0}</p>
              <p className="text-xs text-green-600">Produits</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-700">{tenant._count?.sales || 0}</p>
              <p className="text-xs text-purple-600">Ventes</p>
            </div>
          </div>

          {/* Abonnement */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-800">Abonnement</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-500">Plan actuel</p>
                <p className="font-semibold text-gray-900">{plan?.name || tenant.subscription?.plan || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Statut abonnement</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  tenant.subscription?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  tenant.subscription?.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {tenant.subscription?.status === 'ACTIVE' ? 'Actif' :
                   tenant.subscription?.status === 'EXPIRED' ? 'Expiré' :
                   tenant.subscription?.status === 'CANCELLED' ? 'Annulé' :
                   tenant.subscription?.status || 'N/A'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prix</p>
                <p className="font-semibold text-gray-900">
                  {plan ? `${plan.price.toLocaleString('fr-FR')} FCFA / ${plan.period}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fin abonnement</p>
                <p className="font-semibold text-gray-900">
                  {tenant.subscription?.endDate
                    ? new Date(tenant.subscription.endDate).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
            </div>

            {/* Changer plan */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Changer le plan</p>
              <div className="flex gap-2 flex-wrap">
                {plans.filter(p => p.isActive).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onChangePlan(tenant.id, p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      tenant.subscription?.plan === p.id
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {tenant.status !== 'SUSPENDED' ? (
              <button
                onClick={() => onSuspend(tenant.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors"
              >
                <Ban className="w-4 h-4" />
                Suspendre le compte
              </button>
            ) : (
              <button
                onClick={() => onActivate(tenant.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Réactiver le compte
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 btn btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
