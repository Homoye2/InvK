import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Building2, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Clock
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

export default function Overview() {
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await tenantsAPI.getAll();
      return data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await subscriptionsAPI.getPlans();
      return data as Plan[];
    },
  });

  const stats = {
    total: tenants?.length || 0,
    active: tenants?.filter((t: any) => t.status === 'ACTIVE').length || 0,
    trial: tenants?.filter((t: any) => t.status === 'TRIAL').length || 0,
    suspended: tenants?.filter((t: any) => t.status === 'SUSPENDED').length || 0,
    revenue: tenants?.reduce((sum: number, t: any) => {
      const plan = plans?.find(p => p.id === t.subscription?.plan);
      return sum + (plan?.price || 0);
    }, 0) || 0,
  };

  // Calcul des tendances (simulation)
  const trends = {
    tenants: 12, // +12%
    revenue: 8,  // +8%
    active: 5,   // +5%
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={<Building2 className="w-6 h-6" />}
          label="Total Commerçants"
          value={stats.total}
          trend={trends.tenants}
          color="blue"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Actifs"
          value={stats.active}
          trend={trends.active}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="En essai"
          value={stats.trial}
          color="yellow"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Revenus mensuels"
          value={`${stats.revenue.toLocaleString('fr-FR')} FCFA`}
          trend={trends.revenue}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Répartition par statut</h2>
          <div className="space-y-4">
            <StatusBar
              label="Actifs"
              value={stats.active}
              total={stats.total}
              color="green"
            />
            <StatusBar
              label="En essai"
              value={stats.trial}
              total={stats.total}
              color="yellow"
            />
            <StatusBar
              label="Suspendus"
              value={stats.suspended}
              total={stats.total}
              color="red"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Activité récente</h2>
          <div className="space-y-4">
            {tenants?.slice(0, 5).map((tenant: any) => (
              <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {tenant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_COLORS[tenant.status] || 'bg-gray-100 text-gray-700'
                }`}>
                  {STATUS_LABELS[tenant.status] || tenant.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Tenants Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Derniers commerçants</h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Voir tout →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nom</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.slice(0, 8).map((tenant: any) => {
                const plan = plans?.find(p => p.id === tenant.subscription?.plan);
                return (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{tenant.name}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{tenant.phone || '—'}</p>
                        {tenant.email && !tenant.email.startsWith('+') && (
                          <p className="text-gray-500 text-xs">{tenant.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[tenant.status] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {STATUS_LABELS[tenant.status] || tenant.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {plan?.name || tenant.subscription?.plan || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  color: string;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-semibold ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatusBar({ label, value, total, color }: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {value} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colors[color as keyof typeof colors]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
