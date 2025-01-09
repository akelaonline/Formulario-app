import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/common/DashboardLayout';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const defaultFields = [
    { id: 'pais', label: 'País', type: 'text', required: true, value: '' },
    { id: 'nombre', label: 'Nombre', type: 'text', required: true, value: '' },
    { id: 'apellido', label: 'Apellido', type: 'text', required: true, value: '' },
    { id: 'email', label: 'Email', type: 'email', required: true, value: '' },
    { id: 'empresa', label: 'Empresa', type: 'text', required: false, value: '' },
    { id: 'web', label: 'Sitio Web', type: 'url', required: false, value: '' },
    { id: 'whatsapp', label: 'WhatsApp', type: 'tel', required: false, value: '' },
    { id: 'asunto', label: 'Asunto', type: 'text', required: true, value: '' },
    { id: 'mensaje', label: 'Mensaje', type: 'textarea', required: true, value: '' }
];

export default function Templates() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [showNewTemplate, setShowNewTemplate] = useState(false);
    const [expandedTemplate, setExpandedTemplate] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        fields: [...defaultFields]
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadTemplates();
    }, [user]);

    const loadTemplates = async () => {
        try {
            const templatesQuery = query(
                collection(db, 'templates'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(templatesQuery);
            const templatesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTemplates(templatesList);
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
            setError('Error al cargar las plantillas');
        }
    };

    const handleCreateTemplate = async () => {
        try {
            if (!newTemplate.name.trim()) {
                setError('Por favor, ingresa un nombre para la plantilla');
                return;
            }

            await addDoc(collection(db, 'templates'), {
                userId: user.uid,
                name: newTemplate.name,
                fields: newTemplate.fields,
                createdAt: new Date().toISOString()
            });

            setNewTemplate({
                name: '',
                fields: [...defaultFields]
            });
            setShowNewTemplate(false);
            setSuccess('Plantilla creada exitosamente');
            loadTemplates();
        } catch (error) {
            console.error('Error al crear plantilla:', error);
            setError('Error al crear la plantilla');
        }
    };

    const handleUpdateTemplate = async (templateId, updatedTemplate) => {
        try {
            const templateRef = doc(db, 'templates', templateId);
            await updateDoc(templateRef, {
                ...updatedTemplate,
                updatedAt: new Date().toISOString()
            });
            setSuccess('Plantilla actualizada exitosamente');
            loadTemplates();
        } catch (error) {
            console.error('Error al actualizar plantilla:', error);
            setError('Error al actualizar la plantilla');
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'templates', templateId));
            setSuccess('Plantilla eliminada exitosamente');
            loadTemplates();
        } catch (error) {
            console.error('Error al eliminar plantilla:', error);
            setError('Error al eliminar la plantilla');
        }
    };

    const handleFieldChange = (index, field, value) => {
        const updatedFields = [...newTemplate.fields];
        updatedFields[index] = { ...updatedFields[index], [field]: value };
        setNewTemplate({ ...newTemplate, fields: updatedFields });
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Plantillas</h1>
                    <button
                        onClick={() => setShowNewTemplate(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nueva Plantilla
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                        {success}
                    </div>
                )}

                {showNewTemplate && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                        <div className="fixed inset-0 z-10 overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="absolute top-0 right-0 pt-4 pr-4">
                                            <button
                                                onClick={() => setShowNewTemplate(false)}
                                                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                            >
                                                <span className="sr-only">Cerrar</span>
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                                Nueva Plantilla
                                            </h3>
                                            <form onSubmit={handleCreateTemplate} className="space-y-4">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre de la plantilla"
                                                        value={newTemplate.name}
                                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    {newTemplate.fields.map((field, index) => (
                                                        <div key={field.id} className="bg-gray-50 p-3 rounded-md">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <label className="block text-sm font-medium text-gray-700">
                                                                        {field.label}
                                                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                                                    </label>
                                                                    <span className="text-xs text-gray-500">
                                                                        Tipo: {field.type}
                                                                    </span>
                                                                </div>
                                                                {field.type === 'textarea' ? (
                                                                    <textarea
                                                                        value={field.value || ''}
                                                                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm min-h-[150px] resize-y"
                                                                        placeholder="Escribe tu mensaje aquí..."
                                                                        required={field.required}
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type={field.type}
                                                                        value={field.value || ''}
                                                                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                                        placeholder={field.label}
                                                                        required={field.required}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewTemplate(false)}
                                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                                                    >
                                                        Crear plantilla
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

                {/* Lista de Plantillas */}
                <div className="space-y-2">
                    {templates.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow">
                            No hay plantillas creadas
                        </div>
                    ) : (
                        templates.map((template) => (
                            <div key={template.id} className="bg-white rounded-lg shadow">
                                <div 
                                    onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-medium text-gray-900 truncate">
                                                {template.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTemplate(template);
                                                    setExpandedTemplate(template.id);
                                                }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Editar plantilla"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTemplate(template.id);
                                                }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Eliminar plantilla"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                            <svg
                                                className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                                                    expandedTemplate === template.id ? 'rotate-180' : ''
                                                }`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                    
                                {/* Contenido expandible */}
                                {expandedTemplate === template.id && (
                                    <div className="border-t border-gray-100">
                                        <div className="p-3 space-y-3">
                                            {template.fields.map((field, index) => (
                                                <div key={field.id} className="bg-gray-50 rounded-md">
                                                    <div className="px-3 py-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {field.label}
                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                        </label>
                                                        {editingTemplate?.id === template.id ? (
                                                            field.type === 'textarea' ? (
                                                                <textarea
                                                                    value={editingTemplate.fields[index].value || ''}
                                                                    onChange={(e) => {
                                                                        const updatedTemplate = {...editingTemplate};
                                                                        updatedTemplate.fields[index].value = e.target.value;
                                                                        setEditingTemplate(updatedTemplate);
                                                                    }}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm min-h-[100px] resize-y"
                                                                    placeholder="Escribe tu mensaje aquí..."
                                                                />
                                                            ) : (
                                                                <input
                                                                    type={field.type}
                                                                    value={editingTemplate.fields[index].value || ''}
                                                                    onChange={(e) => {
                                                                        const updatedTemplate = {...editingTemplate};
                                                                        updatedTemplate.fields[index].value = e.target.value;
                                                                        setEditingTemplate(updatedTemplate);
                                                                    }}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                                                                />
                                                            )
                                                        ) : (
                                                            <div className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                                                                {field.value || 'No definido'}
                                                            </div>
                                                        )}
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            Tipo: {field.type}, {field.required ? 'Requerido' : 'Opcional'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {editingTemplate?.id === template.id && (
                                                <div className="flex justify-end space-x-2 pt-2">
                                                    <button
                                                        onClick={() => setEditingTemplate(null)}
                                                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateTemplate(template.id, editingTemplate)}
                                                        className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                                                    >
                                                        Guardar cambios
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
