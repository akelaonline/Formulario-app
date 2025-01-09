import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/common/DashboardLayout';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function TemplateManager() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fields: []
    });

    useEffect(() => {
        loadTemplates();
    }, [user]);

    async function loadTemplates() {
        try {
            const templatesQuery = query(
                collection(db, 'templates'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(templatesQuery);
            const templatesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                { name: '', value: '', type: 'text' }
            ]
        }));
    };

    const handleFieldChange = (index, field, value) => {
        const newFields = [...formData.fields];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            fields: newFields
        }));
    };

    const handleRemoveField = (index) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const templateData = {
                ...formData,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (editingTemplate) {
                await updateDoc(doc(db, 'templates', editingTemplate.id), templateData);
            } else {
                await addDoc(collection(db, 'templates'), templateData);
            }

            setShowForm(false);
            setEditingTemplate(null);
            setFormData({
                name: '',
                description: '',
                fields: []
            });
            loadTemplates();
        } catch (error) {
            console.error('Error al guardar plantilla:', error);
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            description: template.description,
            fields: template.fields
        });
        setShowForm(true);
    };

    const handleDelete = async (templateId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
            try {
                await deleteDoc(doc(db, 'templates', templateId));
                loadTemplates();
            } catch (error) {
                console.error('Error al eliminar plantilla:', error);
            }
        }
    };

    const handleDuplicate = async (template) => {
        try {
            const newTemplate = {
                ...template,
                name: `${template.name} (copia)`,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            delete newTemplate.id;

            await addDoc(collection(db, 'templates'), newTemplate);
            loadTemplates();
        } catch (error) {
            console.error('Error al duplicar plantilla:', error);
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
                        <h1 className="text-2xl font-semibold text-gray-900">Plantillas</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Crea y administra plantillas con datos predefinidos para usar en tus formularios.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Nueva Plantilla
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
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

                                    {formData.fields.map((field, index) => (
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
                                                    placeholder="Valor"
                                                    value={field.value}
                                                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
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

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingTemplate(null);
                                            setFormData({
                                                name: '',
                                                description: '',
                                                fields: []
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
                                        {editingTemplate ? 'Guardar cambios' : 'Crear plantilla'}
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
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descripción</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Campos</th>
                                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Acciones</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {templates.map((template) => (
                                            <tr key={template.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                    {template.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {template.description}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {template.fields.length} campos
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={() => handleDuplicate(template)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <DocumentDuplicateIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(template)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(template.id)}
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
