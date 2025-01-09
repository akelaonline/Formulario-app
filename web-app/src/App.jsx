import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Campaigns from './pages/dashboard/Campaigns';
import Templates from './pages/dashboard/Templates';
import URLs from './pages/dashboard/URLs';
import Stats from './pages/dashboard/Stats';
import Settings from './pages/dashboard/Settings';
import TemplateManager from './pages/dashboard/TemplateManager';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rutas del Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Rutas de Campañas */}
          <Route
            path="/dashboard/campaigns"
            element={
              <PrivateRoute>
                <Campaigns />
              </PrivateRoute>
            }
          />

          {/* Rutas de Plantillas */}
          <Route
            path="/dashboard/templates"
            element={
              <PrivateRoute>
                <Templates />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/templates/:id"
            element={
              <PrivateRoute>
                <TemplateManager />
              </PrivateRoute>
            }
          />

          {/* Ruta de URLs */}
          <Route
            path="/dashboard/urls"
            element={
              <PrivateRoute>
                <URLs />
              </PrivateRoute>
            }
          />

          {/* Ruta de Estadísticas */}
          <Route
            path="/dashboard/stats"
            element={
              <PrivateRoute>
                <Stats />
              </PrivateRoute>
            }
          />

          {/* Ruta de Configuración */}
          <Route
            path="/dashboard/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          {/* Redirecciones por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
