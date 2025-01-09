import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Link } from 'react-router-dom';
import {
    DocumentDuplicateIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

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
                // Cargar estadísticas desde Firestore
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
                    totalForms: 0, // TODO: Implementar contador de formularios
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

    const stats_items = [
        {
            name: 'Campañas Activas',
            value: stats.activeCampaigns,
            icon: DocumentDuplicateIcon,
            change: '+4.75%',
            changeType: 'positive',
        },
        {
            name: 'Total de Plantillas',
            value: stats.totalTemplates,
            icon: ChartBarIcon,
            change: '+54.02%',
            changeType: 'positive',
        },
        {
            name: 'Formularios Completados',
            value: stats.totalForms,
            icon: ArrowTrendingUpIcon,
            change: '+12.05%',
            changeType: 'positive',
        },
    ];

    const recent_activity = [
        {
            id: 1,
            name: 'Campaña iniciada',
            description: 'Se inició la campaña "Marketing Q1"',
            date: '30 minutos',
            dateTime: '2024-01-08T00:00',
        },
        {
            id: 2,
            name: 'Nueva plantilla',
            description: 'Se creó la plantilla "Contacto Empresas"',
            date: '2 horas',
            dateTime: '2024-01-07T00:00',
        },
        {
            id: 3,
            name: 'Formulario completado',
            description: 'Se completó el formulario para "Tech Corp"',
            date: '5 horas',
            dateTime: '2024-01-07T00:00',
        },
    ];

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
                                    <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                                    <p
                                        className={classNames(
                                            item.changeType === 'positive' ? 'text-green-600' : 'text-red-600',
                                            'ml-2 flex items-baseline text-sm font-semibold'
                                        )}
                                    >
                                        {item.change}
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
                        className="relative block rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-semibold text-gray-900">Nueva Campaña</span>
                    </Link>
                    <Link
                        to="/dashboard/templates/new"
                        className="relative block rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-semibold text-gray-900">Nueva Plantilla</span>
                    </Link>
                </div>

                {/* Actividad Reciente */}
                <div>
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Actividad Reciente</h3>
                    <div className="mt-4 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                    Actividad
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Descripción
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Hace
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {recent_activity.map((activity) => (
                                                <tr key={activity.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        {activity.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {activity.description}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {activity.date}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
