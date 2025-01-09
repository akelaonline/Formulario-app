import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { 
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Suscribirse a cambios en el estado de autenticación
        const unsubscribe = auth.onAuthStateChanged(user => {
            console.log('Estado de autenticación cambiado:', user);
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        setError(null);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('Resultado de autenticación:', result);
            return result;
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            setError(error);
            throw error;
        }
    };

    const logout = async () => {
        setError(null);
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setError(error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        error,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
