import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    console.log('PrivateRoute - Estado de autenticación:', { user, path: location.pathname });
    
    if (!user) {
        // Redirigir a /login, pero guardar la ubicación actual
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
