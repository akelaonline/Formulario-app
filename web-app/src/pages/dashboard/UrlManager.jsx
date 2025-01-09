import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/common/DashboardLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function UrlManager() {
    const { user } = useAuth();
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUrl, setEditingUrl] = useState(null);
    const [formData, setFormData] = useState({
        url: '',
        name: '',
        description: '',
        selectors: {
            submit: '',
            form: '', 
            fields: [],
            nextButton: '', 
            prevButton: '', 
            skipButton: '', 
            confirmButton: '', 
            cancelButton: '', 
            errorMessage: '', 
            successMessage: '' 
        },
        options: {
            multiStep: false, 
            autoSubmit: true, 
            waitForSuccess: false, 
            waitTime: 0, 
            retryOnError: false, 
            maxRetries: 3, 
            skipOnError: false 
        }
    });

    useEffect(() => {
        loadUrls();
    }, [user]);

    async function loadUrls() {
        try {
            const urlsQuery = query(
                collection(db, 'urls'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(urlsQuery);
            const urlsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUrls(urlsData);
        } catch (error) {
            console.error('Error al cargar URLs:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            selectors: {
                ...prev.selectors,
                fields: [
                    ...prev.selectors.fields,
                    { name: '', selector: '', type: 'text' }
                ]
            }
        }));
    };

    const handleFieldChange = (index, field, value) => {
        const newFields = [...formData.selectors.fields];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            selectors: {
                ...prev.selectors,
                fields: newFields
            }
        }));
    };

    const handleRemoveField = (index) => {
        setFormData(prev => ({
            ...prev,
            selectors: {
                ...prev.selectors,
                fields: prev.selectors.fields.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const urlData = {
                ...formData,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (editingUrl) {
                await updateDoc(doc(db, 'urls', editingUrl.id), urlData);
            } else {
                await addDoc(collection(db, 'urls'), urlData);
            }

            setShowForm(false);
            setEditingUrl(null);
            setFormData({
                url: '',
                name: '',
                description: '',
                selectors: {
                    submit: '',
                    form: '', 
                    fields: [],
                    nextButton: '', 
                    prevButton: '', 
                    skipButton: '', 
                    confirmButton: '', 
                    cancelButton: '', 
                    errorMessage: '', 
                    successMessage: '' 
                },
                options: {
                    multiStep: false, 
                    autoSubmit: true, 
                    waitForSuccess: false, 
                    waitTime: 0, 
                    retryOnError: false, 
                    maxRetries: 3, 
                    skipOnError: false 
                }
            });
            loadUrls();
        } catch (error) {
            console.error('Error al guardar URL:', error);
        }
    };

    const handleEdit = (url) => {
        setEditingUrl(url);
        setFormData({
            url: url.url,
            name: url.name,
            description: url.description,
            selectors: url.selectors,
            options: url.options
        });
        setShowForm(true);
    };

    const handleDelete = async (urlId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta URL?')) {
            try {
                await deleteDoc(doc(db, 'urls', urlId));
                loadUrls();
            } catch (error) {
                console.error('Error al eliminar URL:', error);
            }
        }
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
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Gestión de URLs</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Administra las URLs y sus selectores para el llenado automático de formularios.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Nueva URL
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingUrl ? 'Editar URL' : 'Nueva URL'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Selector del Formulario</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.selectors.form}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            selectors: { ...prev.selectors, form: e.target.value }
                                        }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Selector del Botón Submit</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.selectors.submit}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            selectors: { ...prev.selectors, submit: e.target.value }
                                        }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Selector Botón Siguiente</label>
                                            <input
                                                type="text"
                                                value={formData.selectors.nextButton}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    selectors: { ...prev.selectors, nextButton: e.target.value }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Selector Botón Anterior</label>
                                            <input
                                                type="text"
                                                value={formData.selectors.prevButton}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    selectors: { ...prev.selectors, prevButton: e.target.value }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Selector Botón Omitir</label>
                                            <input
                                                type="text"
                                                value={formData.selectors.skipButton}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    selectors: { ...prev.selectors, skipButton: e.target.value }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Selector Botón Confirmar</label>
                                            <input
                                                type="text"
                                                value={formData.selectors.confirmButton}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    selectors: { ...prev.selectors, confirmButton: e.target.value }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Selector Mensaje de Error</label>
                                            <input
                                                type="text"
                                                value={formData.selectors.errorMessage}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    selectors: { ...prev.selectors, errorMessage: e.target.value }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Selector Mensaje de Éxito</label>
                                            <input
                                                type="text"
                                                value={formData.selectors.successMessage}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    selectors: { ...prev.selectors, successMessage: e.target.value }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-700">Campos</label>
                                        <button
                                            type="button"
                                            onClick={handleAddField}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-1" />
                                            Agregar Campo
                                        </button>
                                    </div>

                                    {formData.selectors.fields.map((field, index) => (
                                        <div key={index} className="flex gap-4 items-start">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre del campo"
                                                    value={field.name}
                                                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Selector"
                                                    value={field.selector}
                                                    onChange={(e) => handleFieldChange(index, 'selector', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    <option value="text">Texto</option>
                                                    <option value="email">Email</option>
                                                    <option value="tel">Teléfono</option>
                                                    <option value="number">Número</option>
                                                    <option value="date">Fecha</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveField(index)}
                                                className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="font-medium text-gray-900">Opciones Avanzadas</h3>
                                    
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.options.multiStep}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    options: { ...prev.options, multiStep: e.target.checked }
                                                }))}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">
                                                Formulario Multi-paso
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.options.autoSubmit}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    options: { ...prev.options, autoSubmit: e.target.checked }
                                                }))}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">
                                                Auto-enviar Formulario
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.options.waitForSuccess}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    options: { ...prev.options, waitForSuccess: e.target.checked }
                                                }))}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">
                                                Esperar Mensaje de Éxito
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.options.retryOnError}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    options: { ...prev.options, retryOnError: e.target.checked }
                                                }))}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">
                                                Reintentar en Error
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tiempo de Espera (ms)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.options.waitTime}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    options: { ...prev.options, waitTime: parseInt(e.target.value) }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Máximo de Reintentos
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={formData.options.maxRetries}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    options: { ...prev.options, maxRetries: parseInt(e.target.value) }
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingUrl(null);
                                            setFormData({
                                                url: '',
                                                name: '',
                                                description: '',
                                                selectors: {
                                                    submit: '',
                                                    form: '', 
                                                    fields: [],
                                                    nextButton: '', 
                                                    prevButton: '', 
                                                    skipButton: '', 
                                                    confirmButton: '', 
                                                    cancelButton: '', 
                                                    errorMessage: '', 
                                                    successMessage: '' 
                                                },
                                                options: {
                                                    multiStep: false, 
                                                    autoSubmit: true, 
                                                    waitForSuccess: false, 
                                                    waitTime: 0, 
                                                    retryOnError: false, 
                                                    maxRetries: 3, 
                                                    skipOnError: false 
                                                }
                                            });
                                        }}
                                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        {editingUrl ? 'Guardar cambios' : 'Crear URL'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">URL</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Campos</th>
                                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Acciones</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {urls.map((url) => (
                                            <tr key={url.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                    {url.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {url.url}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {url.selectors.fields.length} campos
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={() => handleEdit(url)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(url.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
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
        </DashboardLayout>
    );
}
