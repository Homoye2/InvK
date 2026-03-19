import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical,
  Shield,
  ShoppingBag,
  Briefcase,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usersAPI } from '../../lib/api';

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data } = await usersAPI.getAll();
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (userId: string) => usersAPI.toggleActive(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });

  // Filtrer les utilisateurs
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Statistiques
  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u: any) => u.role === 'ADMIN_GENERAL').length || 0,
    merchants: users?.filter((u: any) => u.role === 'ADMIN_COMMERCANT').length || 0,
    employees: users?.filter((u: any) => u.role === 'EMPLOYE').length || 0,
    active: users?.filter((u: any) => u.isActive).length || 0,
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN_GENERAL':
        return <Shield className="w-4 h-4" />;
      case 'ADMIN_COMMERCANT':
        return <ShoppingBag className="w-4 h-4" />;
      case 'EMPLOYE':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN_GENERAL':
        return 'Admin Général';
      case 'ADMIN_COMMERCANT':
        return 'Commerçant';
      case 'EMPLOYE':
        return 'Employé';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN_GENERAL':
        return 'bg-purple-100 text-purple-700';
      case 'ADMIN_COMMERCANT':
        return 'bg-blue-100 text-blue-700';
      case 'EMPLOYE':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Admins" value={stats.admins} color="purple" />
        <StatCard label="Commerçants" value={stats.merchants} color="blue" />
        <StatCard label="Employés" value={stats.employees} color="green" />
        <StatCard label="Actifs" value={stats.active} color="green" />
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input pl-10 pr-8"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="ADMIN_GENERAL">Admin Général</option>
                <option value="ADMIN_COMMERCANT">Commerçant</option>
                <option value="EMPLOYE">Employé</option>
              </select>
            </div>
            <button className="btn btn-primary flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Inviter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Utilisateur</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rôle</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Boutique</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date création</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user: any) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          {user.email?.startsWith('+') ? user.email : (user.email || '—')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span>{getRoleLabel(user.role)}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.tenant?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActiveMutation.mutate(user.id)}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Actif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Inactif</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers?.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: {
  label: string;
  value: number;
  color: string;
}) {
  const colors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };

  return (
    <div className="card">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-2xl lg:text-3xl font-bold ${colors[color as keyof typeof colors]}`}>
        {value}
      </p>
    </div>
  );
}
