import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Phone, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import Logo from '../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.login(identifier.trim(), password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      if (data.user.role === UserRole.ADMIN_GENERAL) {
        navigate('/admin');
      } else if (data.user.role === UserRole.ADMIN_COMMERCANT) {
        navigate('/dashboard');
      } else {
        navigate('/pos');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (id: string, pwd = 'Password123!') => {
    setIdentifier(id);
    setPassword(pwd);
    setError('');
  };

  const demoAccounts = [
    { label: 'Admin Général', id: 'admin@invk.sn', color: 'purple', icon: '👑' },
    { label: 'Commerçant (Fatou)', id: 'fatou@boutique.sn', color: 'blue', icon: '🏪' },
    { label: 'Employé (Moussa)', id: '+221772345678', color: 'green', icon: '👷' },
  ];

  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block w-50 h-20  ">
            <img src={Logo} alt="invK" className="h-full mx-auto  object-fit" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bon retour !</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Identifier */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone ou Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="+221771234567 ou email@exemple.com"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder=""
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 cursor-pointer font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Comptes de démonstration</p>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => quickLogin(acc.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-colors ${colorMap[acc.color]}`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{acc.icon}</span>
                    <span className="font-semibold">{acc.label}</span>
                  </span>
                  <span className="font-mono opacity-75">{acc.id}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2.5 text-center">
              Mot de passe : <span className="font-mono font-semibold text-gray-600">Password123!</span>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
}
