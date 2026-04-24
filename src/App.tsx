import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lazy, Suspense } from 'react';
import { theme } from './styles/theme';
import { TopBar } from './components/TopBar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { InputPage } from './components/input/InputPage';
import { EnergyProvider } from './context/EnergyContext';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const SettingsPage = lazy(() =>
  import('./components/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage }))
);

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <TopBar />
    <main className="flex-grow">{children}</main>
  </div>
);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <EnergyProvider>
          <CssBaseline />
          <Router>
            <Layout>
              <Suspense fallback={null}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/"       element={<LandingPage />} />
                  <Route path="/signin" element={<SignInPage />} />
                  <Route path="/signup" element={<SignUpPage />} />

                  {/* Protected routes — must be logged in */}
                  <Route path="/input"     element={<ProtectedRoute><InputPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </EnergyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}