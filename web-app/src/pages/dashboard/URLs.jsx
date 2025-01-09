import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/common/DashboardLayout';
import { MagnifyingGlassIcon, PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function URLs() {
    const { user } = useAuth();
    const [urlLists, setUrlLists] = useState([]);
    const [newUrls, setNewUrls] = useState('');
    const [newListName, setNewListName] = useState('');
    const [selectedListId, setSelectedListId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLists, setExpandedLists] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadUrlLists();
    }, [user]);

    const loadUrlLists = async () => {
        try {
            const urlsQuery = query(
                collection(db, 'urlLists'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(urlsQuery);
            const lists = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUrlLists(lists);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar listas:', error);
            setError('Error al cargar las listas de URLs');
            setLoading(false);
        }
    };

    const validateAndExtractUrls = (text) => {
        const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
        const urls = text.split(/[\n,]/).map(url => url.trim()).filter(url => url);
        const validUrls = urls.filter(url => urlPattern.test(url));
        const invalidUrls = urls.filter(url => !urlPattern.test(url));
        return { validUrls, invalidUrls };
    };

    const handleCreateList = async () => {
        try {
            if (!newListName.trim()) {
                setError('Por favor, ingresa un nombre para la lista');
                return;
            }

            const { validUrls, invalidUrls } = validateAndExtractUrls(newUrls);
            
            if (invalidUrls.length > 0) {
                setError(`Las siguientes URLs no son válidas:\n${invalidUrls.join('\n')}`);
                return;
            }

            await addDoc(collection(db, 'urlLists'), {
                userId: user.uid,
                name: newListName,
                urls: validUrls,
                createdAt: new Date().toISOString()
            });

            setNewUrls('');
            setNewListName('');
            setSuccess('Lista creada exitosamente');
            loadUrlLists();
        } catch (error) {
            console.error('Error al crear lista:', error);
            setError('Error al crear la lista');
        }
    };

    const handleAddToList = async () => {
        try {
            if (!selectedListId) {
                setError('Por favor, selecciona una lista');
                return;
            }

            const { validUrls, invalidUrls } = validateAndExtractUrls(newUrls);
            
            if (invalidUrls.length > 0) {
                setError(`Las siguientes URLs no son válidas:\n${invalidUrls.join('\n')}`);
                return;
            }

            const selectedList = urlLists.find(list => list.id === selectedListId);
            const existingUrls = selectedList.urls;
            
            // Verificar duplicados
            const duplicates = validUrls.filter(url => 
                existingUrls.some(existingUrl => 
                    new URL(existingUrl).hostname === new URL(url).hostname
                )
            );

            if (duplicates.length > 0) {
                setError(`Las siguientes URLs ya existen en la lista:\n${duplicates.join('\n')}`);
                return;
            }

            const listRef = doc(db, 'urlLists', selectedListId);
            await updateDoc(listRef, {
                urls: [...existingUrls, ...validUrls]
            });

            setNewUrls('');
            setSuccess('URLs agregadas exitosamente');
            loadUrlLists();
        } catch (error) {
            console.error('Error al agregar URLs:', error);
            setError('Error al agregar las URLs');
        }
    };

    const handleDeleteUrl = async (listId, urlToDelete) => {
        try {
            const listRef = doc(db, 'urlLists', listId);
            const list = urlLists.find(l => l.id === listId);
            const updatedUrls = list.urls.filter(url => url !== urlToDelete);
            
            await updateDoc(listRef, {
                urls: updatedUrls
            });
            
            setSuccess('URL eliminada exitosamente');
            loadUrlLists();
        } catch (error) {
            console.error('Error al eliminar URL:', error);
            setError('Error al eliminar la URL');
        }
    };

    const handleDeleteList = async (listId) => {
        try {
            await deleteDoc(doc(db, 'urlLists', listId));
            setSuccess('Lista eliminada exitosamente');
            loadUrlLists();
        } catch (error) {
            console.error('Error al eliminar lista:', error);
            setError('Error al eliminar la lista');
        }
    };

    const toggleListExpansion = (listId) => {
        setExpandedLists(prev => ({
            ...prev,
            [listId]: !prev[listId]
        }));
    };

    const filteredLists = urlLists.filter(list => 
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.urls.some(url => url.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col space-y-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Gestión de URLs</h1>
                    
                    {/* Sección de agregar URLs */}
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-lg font-medium text-gray-900">Agregar URLs</h2>
                            
                            {/* Input para nombre de nueva lista */}
                            <div>
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="Nombre de la nueva lista"
                                    className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Selector de lista existente */}
                            <div>
                                <select
                                    value={selectedListId || ''}
                                    onChange={(e) => setSelectedListId(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Seleccionar lista existente</option>
                                    {urlLists.map(list => (
                                        <option key={list.id} value={list.id}>
                                            {list.name} ({list.urls.length} URLs)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Textarea para URLs */}
                            <textarea
                                value={newUrls}
                                onChange={(e) => setNewUrls(e.target.value)}
                                placeholder="Pega aquí tus URLs (una por línea o separadas por comas)"
                                className="w-full h-32 p-3 border rounded-md focus:ring-primary focus:border-primary"
                            />

                            {/* Botones de acción */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleCreateList}
                                    disabled={!newListName}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Crear Nueva Lista
                                </button>
                                <button
                                    onClick={handleAddToList}
                                    disabled={!selectedListId}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Agregar a Lista Existente
                                </button>
                            </div>
                        </div>

                        {/* Mensajes de error y éxito */}
                        {error && (
                            <div className="text-sm text-red-600 whitespace-pre-line">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-sm text-green-600">
                                {success}
                            </div>
                        )}
                    </div>

                    {/* Buscador */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar URLs o listas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>

                    {/* Lista de URLs */}
                    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Cargando listas...
                            </div>
                        ) : filteredLists.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No se encontraron listas
                            </div>
                        ) : (
                            filteredLists.map((list) => (
                                <div key={list.id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div 
                                            className="flex-1 flex items-center space-x-3 cursor-pointer"
                                            onClick={() => toggleListExpansion(list.id)}
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {list.name}
                                            </h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {list.urls.length} URLs
                                            </span>
                                            {expandedLists[list.id] ? (
                                                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteList(list.id)}
                                            className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-full"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    
                                    {expandedLists[list.id] && (
                                        <div className="mt-4 space-y-2">
                                            {list.urls.map((url, index) => (
                                                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                                    <span className="text-sm text-gray-600 break-all">
                                                        {url}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteUrl(list.id, url)}
                                                        className="ml-4 p-1 text-red-600 hover:bg-red-100 rounded-full"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
