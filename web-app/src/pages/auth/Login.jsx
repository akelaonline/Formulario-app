import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signInWithGoogle, error: authError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            console.log('Usuario autenticado, redirigiendo...');
            const from = location.state?.from?.pathname || '/dashboard/campaigns';
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    useEffect(() => {
        if (authError) {
            console.error('Error de autenticación:', authError);
            setError(authError.message);
            setLoading(false);
        }
    }, [authError]);

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            console.log('Iniciando proceso de login con Google...');
            await signInWithGoogle();
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            setError(error.message || 'Error al iniciar sesión con Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Iniciar sesión
                    </h2>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error al iniciar sesión
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Iniciando sesión...
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <img className="h-5 w-5 mr-2" src="https://www.google.com/favicon.ico" alt="Google logo" />
                                Continuar con Google
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
