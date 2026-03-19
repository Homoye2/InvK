import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag, Plus, Minus, Trash2, LogOut, ArrowLeft,
  CheckCircle, BarChart2, X, AlertCircle, XCircle,
  TrendingUp, ShoppingCart, Clock, CreditCard, Search,
} from 'lucide-react';
import { productsAPI, salesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Product } from '../../types';

interface CartItem {
  product: Product;
  quantity: number;
}

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

export default function POSPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, logout } = useAuthStore();

  const [tab, setTab] = useState<'caisse' | 'ventes'>('caisse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const isEmployee = user?.role === 'EMPLOYE';

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Products
  const { data: products = [] } = useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const { data } = await productsAPI.getAll();
      return data.filter((p) => p.isActive);
    },
  });

  // My sales + stats
  const { data: mySalesData, isLoading: salesLoading } = useQuery({
    queryKey: ['my-sales'],
    queryFn: async () => {
      const { data } = await salesAPI.getMine(20);
      return data;
    },
    enabled: tab === 'ventes',
  });

  // Create sale
  const createMutation = useMutation({
    mutationFn: salesAPI.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      qc.invalidateQueries({ queryKey: ['my-sales'] });
      setCart([]);
      showToast('success', 'Vente enregistrée avec succès !');
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message;
      showToast('error', Array.isArray(msg) ? msg[0] : msg || 'Erreur lors de la vente');
    },
  });

  // Cancel sale
  const cancelMutation = useMutation({
    mutationFn: (id: string) => salesAPI.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-sales'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      setCancelConfirm(null);
      showToast('success', 'Vente annulée — stock restauré');
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message;
      showToast('error', Array.isArray(msg) ? msg[0] : msg || 'Erreur lors de l\'annulation');
      setCancelConfirm(null);
    },
  });

  const addToCart = (product: Product) => {
    const stock = product.stock?.quantity ?? 0;
    const inCart = cart.find((i) => i.product.id === product.id)?.quantity ?? 0;
    if (inCart >= stock) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      return existing
        ? prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.product.id !== productId));

  const total = cart.reduce((s, i) => s + i.product.sellPrice * i.quantity, 0);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCheckout = () => {
    if (!cart.length) return;
    createMutation.mutate({
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity, unitPrice: i.product.sellPrice })),
      totalAmount: total,
      paymentMethod,
    });
  };

  const stats = mySalesData?.stats;
  const mySales: any[] = mySalesData?.sales || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Annuler la vente ?</h3>
                <p className="text-xs text-gray-500">Le stock sera automatiquement restauré</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-5">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Non, garder
              </button>
              <button
                onClick={() => cancelMutation.mutate(cancelConfirm)}
                disabled={cancelMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Annulation...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!isEmployee && (
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">Point de Vente</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTab('caisse')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'caisse' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Caisse</span>
            </button>
            <button
              onClick={() => setTab('ventes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'ventes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Mes ventes</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{isEmployee ? 'Employé' : 'Commerçant'}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Déconnexion">
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* CAISSE TAB */}
      {tab === 'caisse' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Products */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit ou SKU..."
                className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 text-sm">
                  Aucun produit trouvé pour "<span className="font-medium">{search}</span>"
                </div>
              )}
              {filteredProducts.map((product) => {
                const stock = product.stock?.quantity ?? 0;
                const inCart = cart.find((i) => i.product.id === product.id)?.quantity ?? 0;
                const outOfStock = stock === 0;
                const lowStock = stock > 0 && stock <= (product.stock?.alertThreshold ?? 10);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className={`relative text-left p-4 rounded-xl border transition-all ${
                      outOfStock
                        ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md active:scale-95'
                    }`}
                  >
                    {inCart > 0 && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {inCart}
                      </span>
                    )}
                    <p className="font-medium text-sm text-gray-900 mb-1 pr-6 leading-tight">{product.name}</p>
                    <p className="text-base font-bold text-primary-600">{product.sellPrice.toLocaleString('fr-FR')} F</p>
                    <p className={`text-xs mt-1.5 font-medium ${outOfStock ? 'text-red-500' : lowStock ? 'text-orange-500' : 'text-gray-400'}`}>
                      {outOfStock ? 'Rupture' : `Stock: ${stock}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div className="w-80 lg:w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Panier</h2>
              {cart.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.reduce((s, i) => s + i.quantity, 0)} art.
                  </span>
                  <button onClick={() => setCart([])} className="p-1 hover:bg-red-50 text-red-400 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Panier vide</p>
                  <p className="text-gray-300 text-xs mt-1">Cliquez sur un produit</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.product.sellPrice.toLocaleString('fr-FR')} × {item.quantity} ={' '}
                        <span className="font-semibold text-gray-800">
                          {(item.product.sellPrice * item.quantity).toLocaleString('fr-FR')} F
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="w-6 h-6 flex items-center justify-center hover:bg-red-100 text-red-400 rounded ml-1">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mode de paiement</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white">
                  <option value="CASH">💵 Espèces</option>
                  <option value="WAVE">🌊 Wave</option>
                  <option value="ORANGE_MONEY">🟠 Orange Money</option>
                  <option value="MOBILE_MONEY">📱 Mobile Money</option>
                  <option value="CARD">💳 Carte bancaire</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-primary-600">{total.toLocaleString('fr-FR')} F</span>
              </div>

              {createMutation.isError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {(createMutation.error as any)?.response?.data?.message || 'Erreur lors de la vente'}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || createMutation.isPending}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
              >
                {createMutation.isPending ? 'Enregistrement...' : 'Valider la vente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MES VENTES TAB */}
      {tab === 'ventes' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Aujourd'hui"
              value={`${(stats?.todayRevenue || 0).toLocaleString('fr-FR')} F`}
              sub={`${stats?.todaySalesCount || 0} vente${(stats?.todaySalesCount || 0) > 1 ? 's' : ''}`}
              icon={<TrendingUp className="w-4 h-4 text-green-600" />}
              bg="bg-green-50"
            />
            <StatCard
              label="Ce mois"
              value={`${(stats?.monthRevenue || 0).toLocaleString('fr-FR')} F`}
              sub={`${stats?.monthSalesCount || 0} ventes`}
              icon={<ShoppingCart className="w-4 h-4 text-blue-600" />}
              bg="bg-blue-50"
            />
            <StatCard
              label="Panier moyen"
              value={stats?.monthSalesCount
                ? `${Math.round((stats.monthRevenue || 0) / stats.monthSalesCount).toLocaleString('fr-FR')} F`
                : '— F'}
              sub="ce mois"
              icon={<CreditCard className="w-4 h-4 text-purple-600" />}
              bg="bg-purple-50"
            />
            <StatCard
              label="Total ventes"
              value={mySales.length}
              sub="dans l'historique"
              icon={<BarChart2 className="w-4 h-4 text-orange-600" />}
              bg="bg-orange-50"
            />
          </div>

          {/* Sales list */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Historique de mes ventes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Vous pouvez annuler une vente — le stock sera restauré automatiquement</p>
            </div>

            {salesLoading ? (
              <div className="p-10 text-center text-gray-400 text-sm">Chargement...</div>
            ) : mySales.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">Aucune vente enregistrée</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {mySales.map((sale: any) => (
                  <div key={sale.id} className={`px-5 py-4 ${sale.status === 'CANCELLED' ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{sale.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${paymentColors[sale.paymentMethod] || 'bg-gray-100 text-gray-600'}`}>
                            {paymentLabels[sale.paymentMethod] || sale.paymentMethod}
                          </span>
                          {sale.status === 'CANCELLED' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Annulée</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(sale.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                        {sale.items?.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {sale.items.map((i: any) => `${i.product?.name || '?'} ×${i.quantity}`).join(', ')}
                          </p>
                        )}
                      </div>
                      {sale.status === 'COMPLETED' && (
                        <button
                          onClick={() => setCancelConfirm(sale.id)}
                          className="ml-3 flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Annuler</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, icon, bg }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{icon}</div>
      </div>
      <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
