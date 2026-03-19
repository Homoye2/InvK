import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardHome from './DashboardHome';
import ProductsPage from './ProductsPage';
import SalesPage from './SalesPage';
import InventoryPage from './InventoryPage';
import TeamPage from './TeamPage';
import MerchantNotificationsPage from './NotificationsPage';
import MerchantSettingsPage from './MerchantSettingsPage';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="notifications" element={<MerchantNotificationsPage />} />
        <Route path="settings" element={<MerchantSettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
