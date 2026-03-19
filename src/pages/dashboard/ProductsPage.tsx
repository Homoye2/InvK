import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, AlertTriangle, X, Package } from 'lucide-react';
import { productsAPI } from '../../lib/api';
import type { Product } from '../../types';

const emptyForm = {
  name: '', sku: '', buyPrice: 0, sellPrice: 0, unit: 'pièce',
  initialStock: 0, alertThreshold: 10, isActive: true,
};

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await productsAPI.getAll();
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsAPI.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Erreur lors de la modification'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const openCreate = () => {
    setForm({ ...emptyForm });
    setError('');
    setModal({ open: true });
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, sku: p.sku || '', buyPrice: p.buyPrice, sellPrice: p.sellPrice,
      unit: p.unit, initialStock: p.stock?.quantity || 0, alertThreshold: p.stock?.alertThreshold || 10,
      isActive: p.isActive,
    });
    setError('');
    setModal({ open: true, product: p });
  };

  const closeModal = () => setModal({ open: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.sellPrice <= 0) {
      setError('Nom et prix de vente sont requis');
      return;
    }
    if (modal.product) {
      const { initialStock, ...rest } = form;
      updateMutation.mutate({ id: modal.product.id, data: rest });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase()),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button onClick={openCreate} className="flex items-center space-x-2 px-4 py-2.5 bg-blue-400 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">{search ? 'Aucun résultat' : 'Aucun produit — ajoutez-en un'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Prix achat</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Prix vente</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Stock</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const lowStock = p.stock && p.stock.quantity <= p.stock.alertThreshold;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3 px-4 text-gray-500">{p.sku || '—'}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{p.buyPrice.toLocaleString('fr-FR')} FCFA</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{p.sellPrice.toLocaleString('fr-FR')} FCFA</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center space-x-1 font-medium ${lowStock ? 'text-red-600' : 'text-gray-700'}`}>
                          {lowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{p.stock?.quantity ?? '—'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm('Supprimer ce produit ?')) deleteMutation.mutate(p.id); }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-gray-900">{modal.product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat (FCFA)</label>
                  <input type="number" min="0" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente (FCFA) *</label>
                  <input type="number" min="0" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                </div>
                {!modal.product && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
                    <input type="number" min="0" value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: +e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte</label>
                  <input type="number" min="0" value={form.alertThreshold} onChange={(e) => setForm({ ...form, alertThreshold: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div className="col-span-2 flex items-center space-x-3">
                  <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-700">Produit actif</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {isPending ? 'Enregistrement...' : modal.product ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
