// Actualizar el estado de la extensión
function updateStatus(connected) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = connected ? 'Conectado a Formulario App' : 'Desconectado';
  statusDiv.className = `status ${connected ? 'connected' : 'disconnected'}`;
}

// Actualizar el progreso
function updateProgress(data) {
  const progressDiv = document.getElementById('progress');
  if (data) {
    progressDiv.textContent = `Procesando URL ${data.index + 1}/${data.total}`;
  } else {
    progressDiv.textContent = '';
  }
}

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'PROGRESS':
      updateProgress(message.data);
      break;
    case 'CAMPAIGN_COMPLETED':
      updateProgress(null);
      updateStatus(true);
      break;
    case 'ERROR':
      updateStatus(false);
      break;
  }
});

// Verificar conexión al cargar
document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ type: 'CHECK_CONNECTION' });
});
