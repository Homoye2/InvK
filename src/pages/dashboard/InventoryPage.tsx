import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, RotateCcw, AlertTriangle, X, History } from 'lucide-react';
import { inventoryAPI } from '../../lib/api';

type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'stocks' | 'movements'>('stocks');
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; productId?: string; productName?: string }>({ open: false });
  const [adjustForm, setAdjustForm] = useState<{ quantity: number; type: MovementType; note: string }>({
    quantity: 1, type: 'IN', note: '',
  });
  const [adjustError, setAdjustError] = useState('');

  const { data: stocks = [], isLoading: loadingStocks } = useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      const { data } = await inventoryAPI.getStocks();
      return data;
    },
  });

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['movements'],
    queryFn: async () => {
      const { data } = await inventoryAPI.getMovements();
      return data;
    },
    enabled: tab === 'movements',
  });

  const adjustMutation = useMutation({
    mutationFn: (data: any) => inventoryAPI.adjustStock(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['movements'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      setAdjustModal({ open: false });
    },
    onError: (e: any) => setAdjustError(e.response?.data?.message || 'Erreur lors de l\'ajustement'),
  });

  const openAdjust = (productId: string, productName: string) => {
    setAdjustForm({ quantity: 1, type: 'IN', note: '' });
    setAdjustError('');
    setAdjustModal({ open: true, productId, productName });
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal.productId || adjustForm.quantity <= 0) {
      setAdjustError('Quantité invalide');
      return;
    }
    adjustMutation.mutate({
      productId: adjustModal.productId,
      quantity: adjustForm.quantity,
      type: adjustForm.type,
      note: adjustForm.note,
    });
  };

  const filteredStocks = stocks.filter((s: any) =>
    (s.product?.name || '').toLowerCase().includes(search.toLowerCase()),
  );

  const movementLabels: Record<string, { label: string; color: string }> = {
    IN: { label: 'Entrée', color: 'text-green-600 bg-green-50' },
    OUT: { label: 'Sortie', color: 'text-red-600 bg-red-50' },
    ADJUSTMENT: { label: 'Ajustement', color: 'text-blue-600 bg-blue-50' },
    SALE: { label: 'Vente', color: 'text-orange-600 bg-orange-50' },
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['stocks', 'movements'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t === 'stocks' ? (
              <span className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4" /><span>Stocks</span></span>
            ) : (
              <span className="flex items-center space-x-2"><History className="w-4 h-4" /><span>Mouvements</span></span>
            )}
          </button>
        ))}
      </div>

      {tab === 'stocks' && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loadingStocks ? (
              <div className="p-8 text-center text-gray-500">Chargement...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Quantité</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Seuil alerte</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">État</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStocks.map((s: any) => {
                      const low = s.quantity <= s.alertThreshold;
                      const empty = s.quantity === 0;
                      return (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{s.product?.name}</p>
                            <p className="text-xs text-gray-400">{s.product?.sku || ''}</p>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-lg font-bold ${empty ? 'text-red-600' : low ? 'text-orange-600' : 'text-gray-900'}`}>
                              {s.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500">{s.alertThreshold}</td>
                          <td className="py-3 px-4 text-center">
                            {empty ? (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Rupture</span>
                            ) : low ? (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium flex items-center justify-center space-x-1 w-fit mx-auto">
                                <AlertTriangle className="w-3 h-3" /><span>Faible</span>
                              </span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">OK</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => openAdjust(s.productId, s.product?.name)}
                              className="flex items-center space-x-1 text-xs text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Ajuster</span>
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
        </>
      )}

      {tab === 'movements' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loadingMovements ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Aucun mouvement enregistré</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Quantité</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Note</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(movements as any[]).map((m) => {
                    const mt = movementLabels[m.type] || movementLabels.ADJUSTMENT;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{m.product?.name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${mt.color}`}>{mt.label}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-900">{m.quantity}</td>
                        <td className="py-3 px-4 text-gray-500">{m.note || '—'}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(m.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Modal */}
      {adjustModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-semibold text-gray-900">Ajuster le stock</h2>
                <p className="text-sm text-gray-500 mt-0.5">{adjustModal.productName}</p>
              </div>
              <button onClick={() => setAdjustModal({ open: false })} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjust} className="p-5 space-y-4">
              {adjustError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{adjustError}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de mouvement</label>
                <div className="grid grid-cols-3 gap-2">
                  {([['IN', 'Entrée', Plus], ['OUT', 'Sortie', Minus], ['ADJUSTMENT', 'Ajustement', RotateCcw]] as const).map(([val, label, Icon]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdjustForm({ ...adjustForm, type: val })}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors text-xs font-medium ${
                        adjustForm.type === val ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: +e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
                <input
                  type="text"
                  value={adjustForm.note}
                  onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
                  placeholder="Raison de l'ajustement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setAdjustModal({ open: false })} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={adjustMutation.isPending} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {adjustMutation.isPending ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
