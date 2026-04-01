import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/use-auth';
import { ThemeProvider } from './lib/theme-context';
import { LandingPage } from './modules/auth/landing-page';
import { LoginPage } from './modules/auth/login-page';
import { RegisterPage } from './modules/auth/register-page';
import { ForgotPasswordPage } from './modules/auth/forgot-password-page';
import { VerifyEmailPage } from './modules/auth/verify-email-page';
import { NewPasswordPage } from './modules/auth/new-password-page';
import { DashboardPage } from './modules/dashboard/dashboard-page';
import { UrgentsPage } from './modules/dashboard/urgents-page';
import { ClientsPage } from './modules/client/clients-page';
import { BudgetsPage } from './modules/budget/budgets-page';
import { BudgetDetailPage } from './modules/budget/budget-detail-page';
import { ServiceOrdersPage } from './modules/serviceOrder/service-orders-page';
import { ServiceOrderDetailPage } from './modules/serviceOrder/service-order-detail-page';
import { TrackPage } from './modules/public/track-page';
import { UsersPage } from './modules/user/users-page';
import { SettingsPage } from './modules/settings/settings-page';
import { Sidebar } from './components/sidebar';
import { Navbar } from './components/navbar';
import { MobileHeader } from './components/mobile-header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar />
        <MobileHeader />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
      <Route path="/verify-email" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <VerifyEmailPage />} />
      <Route path="/new-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <NewPasswordPage />} />
      
      <Route path="/track" element={<TrackPage />} />
      <Route path="/public/:token" element={<TrackPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/urgents" element={
        <ProtectedRoute>
          <AppLayout><UrgentsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute>
          <AppLayout><ClientsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/budgets" element={
        <ProtectedRoute>
          <AppLayout><BudgetsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/budget/:id" element={
        <ProtectedRoute>
          <AppLayout><BudgetDetailPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/service-orders" element={
        <ProtectedRoute>
          <AppLayout><ServiceOrdersPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/service-order/:id" element={
        <ProtectedRoute>
          <AppLayout><ServiceOrderDetailPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <AppLayout><UsersPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
