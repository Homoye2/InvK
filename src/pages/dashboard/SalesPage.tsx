import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Search, Eye, X, Clock } from 'lucide-react';
import { salesAPI } from '../../lib/api';
import type { Sale } from '../../types';

const paymentLabels: Record<string, string> = {
  CASH: 'Espèces', WAVE: 'Wave', ORANGE_MONEY: 'Orange Money',
  MOBILE_MONEY: 'Mobile Money', CARD: 'Carte',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Complétée', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Remboursée', color: 'bg-gray-100 text-gray-600' },
};

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Sale | null>(null);

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data } = await salesAPI.getAll(100);
      return data;
    },
  });

  const filtered = sales.filter((s) =>
    s.totalAmount.toString().includes(search) ||
    (paymentLabels[s.paymentMethod] || '').toLowerCase().includes(search.toLowerCase()),
  );

  const totalRevenue = filtered.reduce((sum, s) => sum + (s.status === 'COMPLETED' ? s.totalAmount : 0), 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total ventes</p>
          <p className="text-xl font-bold text-gray-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Revenus</p>
          <p className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Panier moyen</p>
          <p className="text-xl font-bold text-gray-900">
            {filtered.length ? Math.round(totalRevenue / filtered.filter(s => s.status === 'COMPLETED').length || 1).toLocaleString('fr-FR') : 0} FCFA
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucune vente trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Montant</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Paiement</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Articles</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const st = statusConfig[s.status] || statusConfig.COMPLETED;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(s.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {s.totalAmount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {paymentLabels[s.paymentMethod] || s.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">{s.items?.length || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => setDetail(s)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-gray-900">Détail de la vente</h2>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(detail.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Paiement</p>
                  <p className="font-medium">{paymentLabels[detail.paymentMethod] || detail.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-500">Statut</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[detail.status]?.color}`}>
                    {statusConfig[detail.status]?.label}
                  </span>
                </div>
                {detail.user && (
                  <div>
                    <p className="text-gray-500">Vendeur</p>
                    <p className="font-medium">{detail.user.name}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Articles</p>
                <div className="space-y-2">
                  {detail.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name || 'Produit'}</p>
                        <p className="text-gray-500">{item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <p className="font-semibold text-gray-900">{item.subtotal.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <p className="font-semibold text-gray-900">Total</p>
                <p className="text-lg font-bold text-primary-600">{detail.totalAmount.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
