import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Layout from '../../components/common/Layout';
import {
    DocumentDuplicateIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const stats_items = [
    { id: 1, name: 'Campañas Activas', value: '0', icon: DocumentDuplicateIcon },
    { id: 2, name: 'Total Plantillas', value: '0', icon: ChartBarIcon },
    { id: 3, name: 'Formularios Completados', value: '0', icon: ArrowTrendingUpIcon },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeCampaigns: 0,
        totalTemplates: 0,
        totalForms: 0,
        lastActivity: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const campaignsQuery = query(
                    collection(db, 'campaigns'),
                    where('userId', '==', user.uid),
                    where('status', '==', 'active')
                );
                const templatesQuery = query(
                    collection(db, 'templates'),
                    where('userId', '==', user.uid)
                );

                const [campaignsSnapshot, templatesSnapshot] = await Promise.all([
                    getDocs(campaignsQuery),
                    getDocs(templatesQuery),
                ]);

                setStats({
                    activeCampaigns: campaignsSnapshot.size,
                    totalTemplates: templatesSnapshot.size,
                    totalForms: 0,
                    lastActivity: new Date().toISOString(),
                });
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, [user]);

    if (loading) {
        return (
            <Layout>
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <div className="flex justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="space-y-8">
                        {/* Bienvenida */}
                        <div>
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Bienvenido de vuelta
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-gray-500">
                                Aquí tienes un resumen de tu actividad reciente y estadísticas.
                            </p>
                        </div>

                        {/* Estadísticas */}
                        <div>
                            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {stats_items.map((item) => (
                                    <div
                                        key={item.name}
                                        className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
                                    >
                                        <dt>
                                            <div className="absolute rounded-md bg-indigo-500 p-3">
                                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                                        </dt>
                                        <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {item.id === 1 ? stats.activeCampaigns : item.id === 2 ? stats.totalTemplates : stats.totalForms}
                                            </p>
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Link
                                to="/dashboard/campaigns/new"
                                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 focus:outline-none"
                            >
                                <div className="flex-shrink-0">
                                    <PlusIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">Nueva Campaña</p>
                                    <p className="truncate text-sm text-gray-500">Crear una nueva campaña de formularios</p>
                                </div>
                            </Link>

                            <Link
                                to="/dashboard/templates/new"
                                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 focus:outline-none"
                            >
                                <div className="flex-shrink-0">
                                    <PlusIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">Nueva Plantilla</p>
                                    <p className="truncate text-sm text-gray-500">Crear una nueva plantilla de formulario</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
