import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="bg-white">
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>
                
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Form Filler
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Automatiza el llenado de formularios web de manera eficiente y segura.
                            Gestiona múltiples campañas y optimiza tu tiempo.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            {!user ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Comenzar
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-sm font-semibold leading-6 text-gray-900"
                                    >
                                        Registrarse <span aria-hidden="true">→</span>
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/dashboard"
                                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Ir al Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-indigo-600">Características</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Todo lo que necesitas para automatizar tus formularios
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {[
                                {
                                    name: 'Automatización Inteligente',
                                    description: 'Rellena formularios web automáticamente con datos predefinidos o dinámicos.',
                                },
                                {
                                    name: 'Gestión de Campañas',
                                    description: 'Crea y gestiona múltiples campañas de forma simultánea con seguimiento en tiempo real.',
                                },
                                {
                                    name: 'Plantillas Personalizadas',
                                    description: 'Crea y guarda plantillas personalizadas para diferentes tipos de formularios.',
                                },
                            ].map((feature) => (
                                <div key={feature.name} className="flex flex-col">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Precio Simple y Transparente
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Un solo plan con todo incluido. Sin sorpresas ni costos ocultos.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                        <div className="p-8 sm:p-10 lg:flex-auto">
                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Plan Premium</h3>
                            <p className="mt-6 text-base leading-7 text-gray-600">
                                Acceso completo a todas las funcionalidades sin límites ni restricciones.
                            </p>
                            <div className="mt-10 flex items-center gap-x-4">
                                <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">
                                    Incluye
                                </h4>
                                <div className="h-px flex-auto bg-gray-100" />
                            </div>
                            <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                                {[
                                    'Campañas ilimitadas',
                                    'Plantillas ilimitadas',
                                    'Soporte prioritario',
                                    'Actualizaciones gratuitas',
                                ].map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                <div className="mx-auto max-w-xs px-8">
                                    <p className="text-base font-semibold text-gray-600">Pago mensual</p>
                                    <p className="mt-6 flex items-baseline justify-center gap-x-2">
                                        <span className="text-5xl font-bold tracking-tight text-gray-900">$100</span>
                                        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD</span>
                                    </p>
                                    <Link
                                        to="/register"
                                        className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Comenzar ahora
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
