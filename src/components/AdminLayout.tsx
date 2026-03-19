import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building2,
  CreditCard,
  LogOut,
  BarChart3,
  Menu,
  X,
  Settings,
  Bell,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { notificationsAPI } from '../lib/api';
import Logo from '../assets/logo.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
    refetchInterval: 60000, // refresh every minute
  });

  const unreadCount = unreadData?.count || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: BarChart3, label: "Vue d'ensemble", exact: true },
    { to: '/admin/tenants', icon: Building2, label: 'Commerçants' },
    { to: '/admin/subscriptions', icon: CreditCard, label: 'Abonnements' },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const currentLabel =
    navItems.find((item) => isActive(item.to, item.exact))?.label ||
    (location.pathname.startsWith('/admin/settings') ? 'Paramètres' : 'Dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="w-16 h-10 relative overflow-hidden rounded-xl">
              <img src={Logo} alt="logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <Link to="/admin/notifications" className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="hidden lg:flex items-center space-x-3 p-6 border-b">
          <div className="w-30 h-10 relative overflow-hidden rounded-xl">
            <img src={Logo} alt="logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <nav className="p-4 space-y-1 mt-16 lg:mt-0">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg transition-all
                ${isActive(item.to, item.exact)
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <span className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </span>
              {item.to === '/admin/notifications' && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile - Desktop */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Admin Général</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <Link
                  to="/admin/settings"
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Paramètres</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Profile - Mobile */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Admin Général</p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              to="/admin/settings"
              className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Paramètres</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentLabel}</h1>
              <p className="text-sm text-gray-600 mt-1">Bienvenue, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin/notifications" className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
