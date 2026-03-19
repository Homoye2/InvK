import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Overview from './Overview';
import TenantsPage from './TenantsPage';
import SubscriptionsManagement from './SubscriptionsManagement';
import UsersManagement from './UsersManagement';
import SettingsPage from './SettingsPage';
import AdminNotificationsPage from './NotificationsPage';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="subscriptions" element={<SubscriptionsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Routes>
    </AdminLayout>
  );
}
