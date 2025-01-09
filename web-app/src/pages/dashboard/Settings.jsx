import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/common/DashboardLayout';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Settings() {
    const { user, updatePassword, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            browser: true,
            errorAlerts: true,
            successAlerts: true,
        },
        automation: {
            autoRetry: true,
            maxRetries: 3,
            defaultWaitTime: 1000,
            stopOnError: false,
        },
        security: {
            requireConfirmation: true,
            twoFactorAuth: false,
        },
        subscription: {
            plan: 'free',
            status: 'active',
            nextBilling: null,
        }
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadSettings();
    }, [user]);

    async function loadSettings() {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setSettings(prev => ({
                    ...prev,
                    ...userData.settings,
                    subscription: userData.subscription || prev.subscription,
                }));
            }
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            setError('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    }

    async function handleSettingsSave() {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                settings: {
                    notifications: settings.notifications,
                    automation: settings.automation,
                    security: settings.security,
                }
            });
            setSuccess('Configuración guardada correctamente');
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            setError('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordChange(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (passwordForm.newPassword.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        try {
            await updatePassword(passwordForm.newPassword);
            setSuccess('Contraseña actualizada correctamente');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            setError('Error al cambiar la contraseña');
        }
    }

    async function handleAccountDeletion() {
        if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            try {
                // Aquí iría la lógica para eliminar la cuenta
                // Por ahora solo cerramos sesión
                await logout();
            } catch (error) {
                console.error('Error al eliminar cuenta:', error);
                setError('Error al eliminar la cuenta');
            }
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Administra tus preferencias y configuración de cuenta.
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección de Notificaciones */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Notificaciones</h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.email}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, email: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Notificaciones por email
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.browser}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, browser: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Notificaciones del navegador
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.errorAlerts}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, errorAlerts: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Alertas de error
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.successAlerts}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, successAlerts: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Alertas de éxito
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Automatización */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Automatización</h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.automation.autoRetry}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        automation: { ...prev.automation, autoRetry: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Reintentar automáticamente
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Máximo de reintentos
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={settings.automation.maxRetries}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        automation: { ...prev.automation, maxRetries: parseInt(e.target.value) }
                                    }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tiempo de espera predeterminado (ms)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={settings.automation.defaultWaitTime}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        automation: { ...prev.automation, defaultWaitTime: parseInt(e.target.value) }
                                    }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.automation.stopOnError}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        automation: { ...prev.automation, stopOnError: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Detener en error
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Seguridad */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Seguridad</h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.security.requireConfirmation}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        security: { ...prev.security, requireConfirmation: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Requerir confirmación antes de enviar formularios
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.security.twoFactorAuth}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        security: { ...prev.security, twoFactorAuth: e.target.checked }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Autenticación de dos factores
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Cambio de Contraseña */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Cambiar Contraseña</h3>
                        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contraseña actual
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nueva contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Confirmar nueva contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Cambiar contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sección de Suscripción */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Suscripción</h3>
                        <div className="mt-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Plan actual</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">{settings.subscription.plan}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Estado</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">{settings.subscription.status}</p>
                                </div>
                            </div>
                            {settings.subscription.nextBilling && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Próximo cobro: {new Date(settings.subscription.nextBilling).toLocaleDateString()}
                                </p>
                            )}
                            <div className="mt-4">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Gestionar suscripción
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={handleSettingsSave}
                        disabled={saving}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                    >
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>

                    <button
                        type="button"
                        onClick={handleAccountDeletion}
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Eliminar cuenta
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
