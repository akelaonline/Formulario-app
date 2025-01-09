import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Stats() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalForms: 0,
        successfulForms: 0,
        failedForms: 0,
        averageTime: 0,
        dailyStats: [],
        urlStats: [],
        errorTypes: [],
    });

    useEffect(() => {
        loadStats();
    }, [user]);

    async function loadStats() {
        try {
            // Obtener estadísticas de formularios completados
            const formLogsQuery = query(
                collection(db, 'formLogs'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(formLogsQuery);
            const logs = snapshot.docs.map(doc => doc.data());

            // Procesar logs para estadísticas
            const now = new Date();
            const last30Days = new Array(30).fill(0);
            const urlCounts = {};
            const errors = {};
            let totalTime = 0;
            let successful = 0;
            let failed = 0;

            logs.forEach(log => {
                // Contar por URL
                urlCounts[log.urlName] = (urlCounts[log.urlName] || 0) + 1;

                // Contar éxitos y fallos
                if (log.success) {
                    successful++;
                    totalTime += log.completionTime || 0;
                } else {
                    failed++;
                    errors[log.errorType] = (errors[log.errorType] || 0) + 1;
                }

                // Estadísticas diarias
                const daysDiff = Math.floor((now - new Date(log.timestamp)) / (1000 * 60 * 60 * 24));
                if (daysDiff < 30) {
                    last30Days[daysDiff]++;
                }
            });

            // Preparar datos para gráficos
            const urlStats = Object.entries(urlCounts).map(([name, count]) => ({
                name,
                count,
            }));

            const errorTypes = Object.entries(errors).map(([type, count]) => ({
                type,
                count,
            }));

            setStats({
                totalForms: logs.length,
                successfulForms: successful,
                failedForms: failed,
                averageTime: successful > 0 ? Math.round(totalTime / successful) : 0,
                dailyStats: last30Days.reverse(),
                urlStats,
                errorTypes,
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    }

    const dailyStatsData = {
        labels: Array.from({ length: 30 }, (_, i) => `Día ${30 - i}`),
        datasets: [
            {
                label: 'Formularios Completados',
                data: stats.dailyStats,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const urlStatsData = {
        labels: stats.urlStats.map(stat => stat.name),
        datasets: [
            {
                label: 'Formularios por URL',
                data: stats.urlStats.map(stat => stat.count),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
        ],
    };

    const errorStatsData = {
        labels: stats.errorTypes.map(error => error.type),
        datasets: [
            {
                data: stats.errorTypes.map(error => error.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                ],
            },
        ],
    };

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
                    <h1 className="text-2xl font-semibold text-gray-900">Estadísticas</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Métricas y análisis del uso de tus formularios.
                    </p>
                </div>

                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="rounded-md bg-indigo-500 p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total de Formularios
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.totalForms}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="rounded-md bg-green-500 p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Formularios Exitosos
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.successfulForms}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="rounded-md bg-red-500 p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Formularios Fallidos
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.failedForms}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="rounded-md bg-yellow-500 p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Tiempo Promedio
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.averageTime}s
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Gráfico de línea - Actividad diaria */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Diaria</h3>
                        <div className="h-80">
                            <Line
                                data={dailyStatsData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Gráfico de barras - Formularios por URL */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Formularios por URL</h3>
                        <div className="h-80">
                            <Bar
                                data={urlStatsData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Gráfico circular - Tipos de error */}
                    {stats.errorTypes.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Errores</h3>
                            <div className="h-80 flex justify-center">
                                <div className="w-1/2">
                                    <Pie
                                        data={errorStatsData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
