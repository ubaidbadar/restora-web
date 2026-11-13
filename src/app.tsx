import { Lock } from 'lucide-react';
import { matchRoutes, Navigate, useLocation, useRoutes } from 'react-router';
import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router';
import type RouteAccess from './types/route_access';
import resolveRouteAccess from './utils/resolve_route_access';
import AppLayout from './hoc/app_layout';
import AccountsPage from './pages/accounts_page';
import CustomerPage from './pages/customer_page';
import CustomersImportPage from './pages/customers_import_page';
import CustomersPage from './pages/customers_page';
import DashboardPage from './pages/dashboard_page';
import InvitePage from './pages/invite_page';
import KhataPage from './pages/khata_page';
import LoginPage from './pages/login_page';
import MenuPage from './pages/menu_page';
import MorePage from './pages/more_page';
import NewOrderPage from './pages/new_order_page';
import EditOrderPage from './pages/edit_order_page';
import NotFoundPage from './pages/not_found_page';
import OnboardingPage from './pages/onboarding_page';
import PrintTablesPage from './pages/print_tables_page';
import OrdersPage from './pages/orders_page';
import WhatsAppPage from './pages/whatsapp_page';
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
import EmptyState from './components/empty_state';
import InstallPromotion from './components/install_promotion';

/**
 * Route access lives beside the route it protects. Pathless routes group shared policy without
 * adding wrapper components or independent auth/workplace subscriptions.
 */
const routes: RouteObject[] = [
  // Public pages.
  { path: 't/:code', element: <TableMenuPage /> },
  { path: 'invite/:token', element: <InvitePage /> },
  { path: 'verify-email', element: <VerifyEmailPage /> },
  { path: 'reset-password', element: <ResetPasswordPage /> },
  { path: 'pos', element: <PosPage /> },

  // Sign-in pages are public unless this account is already signed in. ?add=1 deliberately allows account addition.
  {
    handle: { guestOnly: true } satisfies RouteAccess,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },

  {
    handle: { auth: true } satisfies RouteAccess,
    children: [
      {
        handle: { web: true } satisfies RouteAccess,
        children: [
          { path: 'accounts', element: <AccountsPage /> },
          { path: 'restaurants', element: <RestaurantsPage /> },
          { path: 'onboarding', element: <OnboardingPage /> },
          {
            handle: { restaurant: true } satisfies RouteAccess,
            children: [
              {
                path: 'welcome',
                element: <WelcomePage />,
                handle: { permission: 'settings:manage' } satisfies RouteAccess,
              },
              {
                path: 'print/tables',
                element: <PrintTablesPage />,
                handle: { permission: 'tables:manage' } satisfies RouteAccess,
              },
            ],
          },
        ],
      },

      {
        handle: { restaurant: true } satisfies RouteAccess,
        children: [
          {
            handle: { setup: true } satisfies RouteAccess,
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
                handle: { permission: 'reports:view', permissionRedirect: '/orders' } satisfies RouteAccess,
              },
              {
                handle: { permission: 'orders:view' } satisfies RouteAccess,
                children: [
                  { path: 'orders', element: <OrdersPage /> },
                  { path: 'whatsapp', element: <WhatsAppPage /> },
                ],
              },
              {
                path: 'orders/new',
                element: <NewOrderPage />,
                handle: { permission: 'orders:create' } satisfies RouteAccess,
              },
              {
                path: 'orders/:id/edit',
                element: <EditOrderPage />,
                handle: { permission: 'orders:update' } satisfies RouteAccess,
              },
              {
                path: 'reservations',
                element: <ReservationsPage />,
                handle: { permission: 'reservations:view' } satisfies RouteAccess,
              },
              {
                path: 'tables',
                element: <TablesPage />,
                handle: { permission: 'tables:view' } satisfies RouteAccess,
              },
              {
                path: 'menu',
                element: <MenuPage />,
                handle: { permission: 'menu:view' } satisfies RouteAccess,
              },
              {
                handle: { permission: 'customers:view' } satisfies RouteAccess,
                children: [
                  { path: 'customers', element: <CustomersPage /> },
                  { path: 'customers/:id', element: <CustomerPage /> },
                  { path: 'khata', element: <KhataPage /> },
                ],
              },
              {
                path: 'customers/import',
                element: <CustomersImportPage />,
                handle: { permission: 'customers:import' } satisfies RouteAccess,
              },
              {
                handle: { web: true } satisfies RouteAccess,
                children: [
                  { path: 'settings', element: <SettingsPage /> },
                  { path: 'settings/:section', element: <SettingsPage /> },
                ],
              },
              { path: 'more', element: <MorePage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];

/** Replace only the denied route's element so its existing parent layout remains mounted. */
function replaceRouteElement(routeList: RouteObject[], target: RouteObject, element: ReactNode): RouteObject[] {
  let changed = false;

  const next = routeList.map((route) => {
    if (route === target) {
      changed = true;
      return { ...route, element } as RouteObject;
    }

    if ('children' in route && route.children) {
      const children = replaceRouteElement(route.children, target, element);
      if (children !== route.children) {
        changed = true;
        return { ...route, children } as RouteObject;
      }
    }

    return route;
  });

  return changed ? next : routeList;
}

/** Resolves route access from one auth snapshot; the server remains the security boundary. */
export default function App() {
  const auth = useAuthStore();
  const { me, terminal } = auth;
  const location = useLocation();
  const loading = me === undefined;

  const matches = matchRoutes(routes, location) ?? [];
  const decision = resolveRouteAccess(
    matches.map(({ route }) => route.handle as RouteAccess | undefined),
    { me, terminal, pathname: location.pathname, search: location.search },
  );
  const deniedRoute = decision.type === 'forbidden' ? matches[decision.matchIndex]?.route : undefined;
  const renderRoutes = deniedRoute
    ? replaceRouteElement(
        routes,
        deniedRoute,
        <EmptyState icon={Lock} titleAs="h1" title="Not for your role" text="Ask the owner or a manager if you need this page." />,
      )
    : routes;
  const content = useRoutes(renderRoutes);

  return (
    <>
      <InstallPromotion active={!loading} />
      {loading ? (
        // The same cloche as index.html's boot screen, so the hand-over from the download to the app is seamless.
        <div className="grid min-h-dvh place-items-center">
          <BrandLoader />
        </div>
      ) : decision.type === 'redirect' ? (
        <Navigate to={decision.to} replace />
      ) : (
        content
      )}
    </>
  );
}
