import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FilterProvider } from './contexts/FilterContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import CompetenciaPage from './pages/CompetenciaPage';
import MunicipioPage from './pages/MunicipioPage';
import ProcedimentoPage from './pages/ProcedimentoPage';
import CBOPage from './pages/CBOPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FilterProvider>
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
        </FilterProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
