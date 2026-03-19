import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package, ShoppingCart, AlertTriangle, TrendingUp,
  ArrowRight, Clock, CreditCard, Users, Activity,
  Crown, UserCheck,
} from 'lucide-react';
import { dashboardAPI, inventoryAPI, subscriptionsAPI } from '../../lib/api';

const paymentLabels: Record<string, string> = {
  CASH: 'Espèces', WAVE: 'Wave', ORANGE_MONEY: 'Orange Money',
  MOBILE_MONEY: 'Mobile Money', CARD: 'Carte',
};

const paymentColors: Record<string, string> = {
  CASH: 'bg-gray-100 text-gray-700',
  WAVE: 'bg-blue-100 text-blue-700',
  ORANGE_MONEY: 'bg-orange-100 text-orange-700',
  MOBILE_MONEY: 'bg-purple-100 text-purple-700',
  CARD: 'bg-green-100 text-green-700',
};

const roleLabels: Record<string, string> = {
  ADMIN_COMMERCANT: 'Gérant',
  EMPLOYE: 'Employé',
};

export default function DashboardHome() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await dashboardAPI.getStats();
      return data;
    },
  });

  const { data: activity } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const { data } = await dashboardAPI.getActivity();
      return data;
    },
  });

  const { data: lowStocks = [] } = useQuery({
    queryKey: ['low-stocks'],
    queryFn: async () => {
      const { data } = await inventoryAPI.getLowStocks();
      return data;
    },
  });

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      const { data } = await subscriptionsAPI.getUsage();
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Subscription banner */}
      {usage && (usage.status === 'TRIAL' || usage.status === 'EXPIRED') && (
        <div className={`rounded-xl p-4 flex items-center justify-between ${
          usage.status === 'EXPIRED' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-center space-x-3">
            <CreditCard className={`w-5 h-5 ${usage.status === 'EXPIRED' ? 'text-red-600' : 'text-amber-600'}`} />
            <div>
              <p className={`text-sm font-semibold ${usage.status === 'EXPIRED' ? 'text-red-800' : 'text-amber-800'}`}>
                {usage.status === 'EXPIRED' ? 'Abonnement expiré' : `Essai gratuit — Plan ${usage.plan}`}
              </p>
              {usage.endDate && (
                <p className={`text-xs ${usage.status === 'EXPIRED' ? 'text-red-600' : 'text-amber-600'}`}>
                  {usage.status === 'EXPIRED'
                    ? 'Renouvelez votre abonnement pour continuer'
                    : `Expire le ${new Date(usage.endDate).toLocaleDateString('fr-FR')}`}
                </p>
              )}
            </div>
          </div>
          <Link to="/dashboard/settings"
            className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
              usage.status === 'EXPIRED' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}>
            Gérer
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ventes aujourd'hui"
          value={`${((stats as any)?.todayRevenue || 0).toLocaleString('fr-FR')} FCFA`}
          sub={`${(stats as any)?.todaySalesCount || 0} transaction${((stats as any)?.todaySalesCount || 0) > 1 ? 's' : ''}`}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          bg="bg-green-50"
        />
        <KpiCard
          label="Revenus du mois"
          value={`${((stats as any)?.monthRevenue || 0).toLocaleString('fr-FR')} FCFA`}
          sub={`${(stats as any)?.monthSalesCount || 0} ventes`}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-50"
        />
        <KpiCard
          label="Produits actifs"
          value={stats?.totalProducts || 0}
          sub="en catalogue"
          icon={<Package className="w-5 h-5 text-purple-600" />}
          bg="bg-purple-50"
        />
        <KpiCard
          label="Alertes stock"
          value={stats?.lowStocks || 0}
          sub="à réapprovisionner"
          icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          bg="bg-orange-50"
          alert={!!(stats?.lowStocks)}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee performance this month */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Performance équipe</h2>
            </div>
            <span className="text-xs text-gray-400">Ce mois</span>
          </div>
          {!activity?.byEmployee?.length ? (
            <div className="p-8 text-center text-gray-400 text-sm">Aucune vente ce mois</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activity.byEmployee.map((emp: any, i: number) => (
                <div key={emp.userId} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {i === 0 ? <Crown className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-400">{roleLabels[emp.role] || emp.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{emp.totalAmount.toLocaleString('fr-FR')} F</p>
                    <p className="text-xs text-gray-400">{emp.salesCount} vente{emp.salesCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border-t border-gray-50">
            <Link to="/dashboard/team" className="text-xs text-primary-600 hover:underline flex items-center space-x-1">
              <span>Gérer l'équipe</span><ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Activité récente</h2>
            </div>
            <Link to="/dashboard/sales" className="text-sm text-primary-600 hover:underline flex items-center space-x-1">
              <span>Voir tout</span><ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!activity?.recentActivity?.length ? (
            <div className="p-8 text-center text-gray-400 text-sm">Aucune activité pour le moment</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activity.recentActivity.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {a.employeeName}
                        <span className="text-xs text-gray-400 font-normal ml-1.5">
                          · {roleLabels[a.employeeRole] || a.employeeRole}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(a.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>· {a.itemsCount} article{a.itemsCount > 1 ? 's' : ''}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-gray-900">{a.totalAmount.toLocaleString('fr-FR')} F</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${paymentColors[a.paymentMethod] || 'bg-gray-100 text-gray-600'}`}>
                      {paymentLabels[a.paymentMethod] || a.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStocks.length > 0 && (
        <div className="bg-white rounded-xl border border-orange-200">
          <div className="flex items-center justify-between p-5 border-b border-orange-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Alertes de stock</h2>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{lowStocks.length}</span>
            </div>
            <Link to="/dashboard/inventory" className="text-sm text-primary-600 hover:underline flex items-center space-x-1">
              <span>Gérer</span><ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {lowStocks.slice(0, 6).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.product?.name || s.productId}</p>
                  <p className="text-xs text-gray-400">Seuil : {s.alertThreshold}</p>
                </div>
                <span className={`text-lg font-bold ${s.quantity === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                  {s.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, bg, alert }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; bg: string; alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border ${alert ? 'border-orange-200' : 'border-gray-200'} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{icon}</div>
      </div>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
