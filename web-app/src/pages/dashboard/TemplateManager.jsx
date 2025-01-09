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
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Plantillas</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Crea y administra plantillas con datos predefinidos para usar en tus formularios.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingTemplate(null);
                            setFormData({ name: '', description: '', fields: [] });
                            setShowForm(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nueva Plantilla
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="min-w-full divide-y divide-gray-200">
                        <div className="bg-gray-50 px-6 py-3 grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="col-span-3">Nombre</div>
                            <div className="col-span-4 hidden sm:block">Descripción</div>
                            <div className="col-span-2">Campos</div>
                            <div className="col-span-3">Acciones</div>
                        </div>
                        <div className="divide-y divide-gray-200 bg-white">
                            {templates.map((template) => (
                                <div key={template.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="col-span-3 flex items-center">
                                        <span className="text-sm font-medium text-gray-900">{template.name}</span>
                                    </div>
                                    <div className="col-span-4 hidden sm:flex items-center">
                                        <span className="text-sm text-gray-500 line-clamp-2">{template.description}</span>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {template.fields?.length || 0} campos
                                        </span>
                                    </div>
                                    <div className="col-span-3 flex items-center space-x-3">
                                        <button
                                            onClick={() => handleEdit(template)}
                                            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(template)}
                                            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            <DocumentDuplicateIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && !loading && (
                                <div className="px-6 py-8 text-center">
                                    <div className="text-sm text-gray-500">No hay plantillas creadas aún.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        <span className="sr-only">Cerrar</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
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
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
