import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Dialog } from '@headlessui/react';

const URLs = () => {
  const [urls, setUrls] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'urls'));
      const urlsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUrls(urlsData);
    } catch (error) {
      console.error('Error loading URLs:', error);
    }
  };

  const handleBulkImport = async () => {
    setLoading(true);
    try {
      const urlList = bulkUrls.split('\\n').filter(url => url.trim());
      
      for (const url of urlList) {
        await addDoc(collection(db, 'urls'), {
          url: url.trim(),
          createdAt: new Date()
        });
      }
      
      await loadUrls();
      setShowImportModal(false);
      setBulkUrls('');
    } catch (error) {
      console.error('Error importing URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      setBulkUrls(text);
      setShowImportModal(true);
    };

    reader.readAsText(file);
  };

  const handleDelete = async (urlId) => {
    try {
      await deleteDoc(doc(db, 'urls', urlId));
      await loadUrls();
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de URLs</h1>
            <p className="text-gray-600 mt-1">
              Administra las URLs para el llenado automático de formularios
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Importar URLs
            </button>
            <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 cursor-pointer">
              Importar Archivo
              <input
                type="file"
                className="hidden"
                accept=".txt,.csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Lista de URLs */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {urls.map((url) => (
              <li key={url.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600 truncate">
                    {url.url}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <button
                      onClick={() => handleDelete(url.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal de importación */}
      <Dialog
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div className="mt-3 text-center sm:mt-5">
                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                  Importar URLs
                </Dialog.Title>
                <div className="mt-2">
                  <textarea
                    rows={10}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Ingresa las URLs (una por línea)"
                    value={bulkUrls}
                    onChange={(e) => setBulkUrls(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2"
                onClick={handleBulkImport}
                disabled={loading}
              >
                {loading ? 'Importando...' : 'Importar'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1"
                onClick={() => setShowImportModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default URLs;
