import { Route, Routes } from 'react-router';
import AppLayout from './hoc/app_layout';
import GuestOnly from './hoc/guest_only';
import RequireAuth from './hoc/require_auth';
import RequirePermission from './hoc/require_permission';
import RequireRestaurant from './hoc/require_restaurant';
import RequireSetup from './hoc/require_setup';
import RequireWeb from './hoc/require_web';
import AccountsPage from './pages/accounts_page';
import CustomerPage from './pages/customer_page';
import CustomersImportPage from './pages/customers_import_page';
import CustomersPage from './pages/customers_page';
import DashboardPage from './pages/dashboard_page';
import InvitePage from './pages/invite_page';
import LoginPage from './pages/login_page';
import MenuPage from './pages/menu_page';
import MorePage from './pages/more_page';
import NewOrderPage from './pages/new_order_page';
import EditOrderPage from './pages/edit_order_page';
import NotFoundPage from './pages/not_found_page';
import OnboardingPage from './pages/onboarding_page';
import PrintTablesPage from './pages/print_tables_page';
import OrdersPage from './pages/orders_page';
import PosPage from './pages/pos_page';
import ReservationsPage from './pages/reservations_page';
import ResetPasswordPage from './pages/reset_password_page';
import RestaurantsPage from './pages/restaurants_page';
import SettingsPage from './pages/settings_page';
import SignupPage from './pages/signup_page';
import TableMenuPage from './pages/table_menu_page';
import TablesPage from './pages/tables_page';
import VerifyEmailPage from './pages/verify_email_page';
import WelcomePage from './pages/welcome_page';
import useAuthStore from './store/auth_store';
import BrandLoader from './ui/brand_loader';

/** Every page and who may open it. The server checks again on every request. */
export default function App() {
  const loading = useAuthStore((state) => state.me === undefined);
   if(loading) return (
    // The same cloche as index.html's boot screen, so the hand-over from the download to the app is seamless.
    <div className="grid min-h-dvh place-items-center">
      <BrandLoader />
    </div>
  )
  return (
    <Routes>
      {/* Open to anyone. */}
      <Route path="t/:code" element={<TableMenuPage />} />
      <Route path="invite/:token" element={<InvitePage />} />
      <Route path="verify-email" element={<VerifyEmailPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="pos" element={<PosPage />} />

      <Route element={<GuestOnly />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<RequireWeb />}>
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route element={<RequireRestaurant />}>
            <Route element={<RequirePermission permission="settings:manage" />}>
              <Route path="welcome" element={<WelcomePage />} />
            </Route>
            <Route element={<RequirePermission permission="tables:manage" />}>
              <Route path="print/tables" element={<PrintTablesPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<RequireRestaurant />}>
          <Route element={<RequireSetup />}>
            <Route element={<AppLayout />}>
              <Route element={<RequirePermission permission="reports:view" redirect="/orders" />}>
                <Route index element={<DashboardPage />} />
              </Route>
              <Route element={<RequirePermission permission="orders:view" />}>
                <Route path="orders" element={<OrdersPage />} />
              </Route>
              <Route element={<RequirePermission permission="orders:create" />}>
                <Route path="orders/new" element={<NewOrderPage />} />
              </Route>
              <Route element={<RequirePermission permission="orders:update" />}>
                <Route path="orders/:id/edit" element={<EditOrderPage />} />
              </Route>
              <Route element={<RequirePermission permission="reservations:view" />}>
                <Route path="reservations" element={<ReservationsPage />} />
              </Route>
              <Route element={<RequirePermission permission="tables:view" />}>
                <Route path="tables" element={<TablesPage />} />
              </Route>
              <Route element={<RequirePermission permission="menu:view" />}>
                <Route path="menu" element={<MenuPage />} />
              </Route>
              <Route element={<RequirePermission permission="customers:view" />}>
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:id" element={<CustomerPage />} />
              </Route>
              <Route element={<RequirePermission permission="customers:import" />}>
                <Route path="customers/import" element={<CustomersImportPage />} />
              </Route>
              <Route element={<RequireWeb />}>
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/:section" element={<SettingsPage />} />
              </Route>
              <Route path="more" element={<MorePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
