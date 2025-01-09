import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/common/DashboardLayout';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { TrashIcon, XMarkIcon, PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';
import { initAutomation, startCampaign, stopCampaign } from '../../services/automation';

export default function Campaigns() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [showNewCampaign, setShowNewCampaign] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [lists, setLists] = useState([]);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        templateId: '',
        listId: '',
        status: 'draft', // draft, running, paused, stopped
        currentIndex: 0, // Para retomar desde donde quedó
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            loadCampaigns();
            loadTemplates();
            loadLists();
            initAutomation(); // Inicializar conexión con el servidor de automatización
        }
    }, [user]);

    const loadCampaigns = async () => {
        try {
            const q = query(collection(db, 'campaigns'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const campaignsData = [];
            querySnapshot.forEach((doc) => {
                campaignsData.push({ id: doc.id, ...doc.data() });
            });
            setCampaigns(campaignsData);
        } catch (error) {
            console.error('Error loading campaigns:', error);
            setError('Error al cargar las campañas');
        }
    };

    const loadTemplates = async () => {
        try {
            const q = query(collection(db, 'templates'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const templatesData = [];
            querySnapshot.forEach((doc) => {
                templatesData.push({ id: doc.id, ...doc.data() });
            });
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const loadLists = async () => {
        try {
            const q = query(collection(db, 'urlLists'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const listsData = [];
            querySnapshot.forEach((doc) => {
                listsData.push({ 
                    id: doc.id, 
                    name: doc.data().name,
                    urls: doc.data().urls,
                    ...doc.data() 
                });
            });
            setLists(listsData);
        } catch (error) {
            console.error('Error loading lists:', error);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'campaigns'), {
                userId: user.uid,
                ...newCampaign,
                createdAt: new Date().toISOString()
            });
            
            setSuccess('Campaña creada exitosamente');
            setNewCampaign({
                name: '',
                templateId: '',
                listId: '',
                status: 'draft',
                currentIndex: 0,
            });
            setShowNewCampaign(false);
            loadCampaigns();
        } catch (error) {
            console.error('Error creating campaign:', error);
            setError('Error al crear la campaña');
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
            try {
                await deleteDoc(doc(db, 'campaigns', campaignId));
                setSuccess('Campaña eliminada exitosamente');
                loadCampaigns();
            } catch (error) {
                console.error('Error deleting campaign:', error);
                setError('Error al eliminar la campaña');
            }
        }
    };

    const handleUpdateStatus = async (campaignId, newStatus) => {
        try {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (!campaign) return;

            if (newStatus === 'running') {
                // Obtener la plantilla y la lista
                const template = templates.find(t => t.id === campaign.templateId);
                const list = lists.find(l => l.id === campaign.listId);
                
                if (!template || !list) {
                    setError('No se encontró la plantilla o la lista');
                    return;
                }

                // Actualizar estado a running
                await updateDoc(doc(db, 'campaigns', campaignId), {
                    status: 'running',
                    lastUpdated: new Date().toISOString()
                });

                // Iniciar la automatización
                const startIndex = campaign.currentIndex || 0;
                const urls = list.urls.slice(startIndex);

                try {
                    console.log('Template a enviar:', template);
                    console.log('URLs a procesar:', urls);
                    await startCampaign(urls, template);
                    
                    // Actualizar estado a completed
                    await updateDoc(doc(db, 'campaigns', campaignId), {
                        status: 'completed',
                        lastUpdated: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Error en la automatización:', error);
                    setError('Error en la automatización');
                    
                    // Actualizar estado a error
                    await updateDoc(doc(db, 'campaigns', campaignId), {
                        status: 'error',
                        lastUpdated: new Date().toISOString()
                    });
                }

            } else if (newStatus === 'stopped') {
                // Detener la automatización
                stopCampaign();
                
                // Actualizar estado
                await updateDoc(doc(db, 'campaigns', campaignId), {
                    status: newStatus,
                    lastUpdated: new Date().toISOString()
                });
            } else {
                // Actualizar estado para otros casos
                await updateDoc(doc(db, 'campaigns', campaignId), {
                    status: newStatus,
                    lastUpdated: new Date().toISOString()
                });
            }

            setSuccess('Estado de la campaña actualizado');
            loadCampaigns();
        } catch (error) {
            console.error('Error updating campaign status:', error);
            setError('Error al actualizar el estado de la campaña');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'running':
                return 'bg-green-100 text-green-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            case 'stopped':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'draft':
                return 'Borrador';
            case 'running':
                return 'En ejecución';
            case 'paused':
                return 'Pausada';
            case 'stopped':
                return 'Detenida';
            case 'completed':
                return 'Completada';
            case 'error':
                return 'Error';
            default:
                return status;
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Campañas</h1>
                    <button
                        onClick={() => setShowNewCampaign(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                    >
                        Nueva Campaña
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
                        {success}
                    </div>
                )}

                {/* Lista de Campañas */}
                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                    {campaigns.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No hay campañas creadas
                        </div>
                    ) : (
                        campaigns.map((campaign) => (
                            <div key={campaign.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {campaign.name}
                                        </h3>
                                        <div className="mt-1 text-sm text-gray-500">
                                            <p>Plantilla: {templates.find(t => t.id === campaign.templateId)?.name || 'No encontrada'}</p>
                                            <p>Lista: {lists.find(l => l.id === campaign.listId)?.name || 'No encontrada'}</p>
                                        </div>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                                {getStatusText(campaign.status)}
                                            </span>
                                            {campaign.currentIndex > 0 && (
                                                <span className="ml-2 text-sm text-gray-500">
                                                    Progreso: {campaign.currentIndex} envíos
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {campaign.status === 'draft' && (
                                            <button
                                                onClick={() => handleUpdateStatus(campaign.id, 'running')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                                title="Iniciar campaña"
                                            >
                                                <PlayIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {campaign.status === 'running' && (
                                            <button
                                                onClick={() => handleUpdateStatus(campaign.id, 'paused')}
                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                                                title="Pausar campaña"
                                            >
                                                <PauseIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {campaign.status === 'paused' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(campaign.id, 'running')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                                    title="Reanudar campaña"
                                                >
                                                    <PlayIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(campaign.id, 'stopped')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                                    title="Detener campaña"
                                                >
                                                    <StopIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDeleteCampaign(campaign.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                            title="Eliminar campaña"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal de Nueva Campaña */}
                {showNewCampaign && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                        <div className="fixed inset-0 z-10 overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="absolute top-0 right-0 pt-4 pr-4">
                                            <button
                                                onClick={() => setShowNewCampaign(false)}
                                                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                            >
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                                Nueva Campaña
                                            </h3>
                                            <form onSubmit={handleCreateCampaign} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Nombre de la campaña
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newCampaign.name}
                                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Plantilla
                                                    </label>
                                                    <select
                                                        value={newCampaign.templateId}
                                                        onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        required
                                                    >
                                                        <option value="">Selecciona una plantilla</option>
                                                        {templates.map((template) => (
                                                            <option key={template.id} value={template.id}>
                                                                {template.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Lista de contactos
                                                    </label>
                                                    <select
                                                        value={newCampaign.listId}
                                                        onChange={(e) => setNewCampaign({ ...newCampaign, listId: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        required
                                                    >
                                                        <option value="">Selecciona una lista</option>
                                                        {lists.map((list) => (
                                                            <option key={list.id} value={list.id}>
                                                                {list.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                                    >
                                                        Crear campaña
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewCampaign(false)}
                                                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
