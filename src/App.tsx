import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FilterProvider } from './contexts/FilterContext';
import PrivateRoute from './components/PrivateRoute/index';
import MobileWarningModal from './components/ui/MobileWarningModal/index';

const LoginPage = lazy(() => import('./pages/LoginPage/index'));
const OverviewPage = lazy(() => import('./pages/OverviewPage/index'));
const CompetenciaPage = lazy(() => import('./pages/CompetenciaPage/index'));
const MunicipioPage = lazy(() => import('./pages/MunicipioPage/index'));
const ProcedimentoPage = lazy(() => import('./pages/ProcedimentoPage/index'));
const CBOPage = lazy(() => import('./pages/CBOPage/index'));

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-600">
      Loading page...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FilterProvider>
          <MobileWarningModal />
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <OverviewPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/competencia"
                element={
                  <PrivateRoute>
                    <CompetenciaPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/municipio"
                element={
                  <PrivateRoute>
                    <MunicipioPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/procedimento"
                element={
                  <PrivateRoute>
                    <ProcedimentoPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cbo"
                element={
                  <PrivateRoute>
                    <CBOPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </FilterProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
