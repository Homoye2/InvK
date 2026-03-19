import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag, Home, Package, ShoppingCart, BarChart3,
  Users, Bell, Settings, LogOut, Menu, X, User, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { notificationsAPI } from '../lib/api';
import Logo from '../assets/logo.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const { data } = await notificationsAPI.getUnreadCount();
      return data;
    },
    refetchInterval: 60000,
  });
  const unreadCount = unreadData?.count || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Accueil', exact: true },
    { to: '/dashboard/products', icon: Package, label: 'Produits' },
    { to: '/dashboard/sales', icon: ShoppingCart, label: 'Ventes' },
    { to: '/dashboard/inventory', icon: BarChart3, label: 'Inventaire' },
    { to: '/dashboard/team', icon: Users, label: 'Équipe' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const currentLabel =
    navItems.find((item) => isActive(item.to, item.exact))?.label ||
    (location.pathname.startsWith('/dashboard/settings') ? 'Paramètres' : 'Dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="w-16 h-9 overflow-hidden">
              <img src={Logo} alt="invK" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Link to="/pos" className="p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </Link>
            <Link to="/dashboard/notifications" className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="hidden lg:flex items-center px-6 py-5 border-b border-gray-100">
          <div className="w-24 h-9 overflow-hidden">
            <img src={Logo} alt="invK" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 mt-16 lg:mt-0 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                isActive(item.to, item.exact)
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </span>
              {item.badge && item.badge > 0 ? (
                <span className="min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold px-1">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </Link>
          ))}

          <div className="pt-2 border-t border-gray-100 mt-2">
            <Link
              to="/pos"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Point de Vente</span>
            </Link>
          </div>
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500">Commerçant</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <Link
                  to="/dashboard/settings"
                  className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm"
                  onClick={() => { setProfileOpen(false); setSidebarOpen(false); }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Paramètres</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-red-600 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentLabel}</h1>
            <p className="text-sm text-gray-500">Bienvenue, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/pos"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Nouvelle vente</span>
            </Link>
            <Link to="/dashboard/notifications" className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
