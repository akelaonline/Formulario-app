class PopupManager {
    constructor() {
        this.auth = new Auth();
        this.storage = new Storage();
        this.currentTemplate = null;
        this.isAutofilling = false;
        
        // Elementos UI - Auth
        this.authStatus = document.getElementById('auth-status');
        this.authStatusBadge = document.getElementById('auth-status-badge');
        this.authButton = document.getElementById('auth-button');

        // Elementos UI - Templates
        this.templateName = document.getElementById('template-name');
        this.templateData = document.getElementById('template-data');
        this.templateType = document.getElementById('template-type');
        this.templateDescription = document.getElementById('template-description');
        this.saveTemplate = document.getElementById('save-template');
        this.templateList = document.getElementById('template-list');
        this.toggleTemplates = document.getElementById('toggle-templates');
        this.templatesContent = document.getElementById('templates-content');

        // Elementos UI - Autofill
        this.currentTemplateSelect = document.getElementById('current-template');
        this.targetUrl = document.getElementById('target-url');
        this.autofillMode = document.getElementById('autofill-mode');
        this.skipCaptcha = document.getElementById('skip-captcha');
        this.startAutofill = document.getElementById('start-autofill');
        this.stopAutofill = document.getElementById('stop-autofill');
        this.autofillStatus = document.getElementById('autofill-status');

        // Elementos UI - Logs
        this.statusMessage = document.getElementById('status-message');
        this.actionLog = document.getElementById('action-log');
        this.toggleLogs = document.getElementById('toggle-logs');
        this.logsContent = document.getElementById('logs-content');

        this.initialize();
    }

    async initialize() {
        await this.setupAuth();
        this.setupEventListeners();
        await this.loadTemplates();
        this.setupCollapsibleSections();
    }

    async setupAuth() {
        const user = await this.auth.getCurrentUser();
        this.updateAuthUI(user);
    }

    setupEventListeners() {
        // Auth
        this.authButton.addEventListener('click', () => this.handleAuth());

        // Templates
        this.saveTemplate.addEventListener('click', () => this.saveTemplateData());
        this.currentTemplateSelect.addEventListener('change', () => this.handleTemplateSelection());

        // Autofill
        this.startAutofill.addEventListener('click', () => this.startAutofilling());
        this.stopAutofill.addEventListener('click', () => this.stopAutofilling());
        this.autofillMode.addEventListener('change', () => this.handleAutofillModeChange());
        this.skipCaptcha.addEventListener('change', () => this.handleSkipCaptchaChange());

        // Secciones colapsables
        this.toggleTemplates.addEventListener('click', () => this.toggleSection(this.templatesContent, this.toggleTemplates));
        this.toggleLogs.addEventListener('click', () => this.toggleSection(this.logsContent, this.toggleLogs));
    }

    setupCollapsibleSections() {
        // Inicialmente expandidas
        this.templatesContent.style.display = 'block';
        this.logsContent.style.display = 'block';
    }

    toggleSection(content, button) {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        button.textContent = isVisible ? '▶' : '▼';
    }

    updateAuthUI(user) {
        if (user) {
            this.authStatus.textContent = `Conectado como ${user.email}`;
            this.authButton.textContent = 'Cerrar Sesión';
            this.authStatusBadge.textContent = 'Conectado';
            this.authStatusBadge.classList.add('active');
            document.getElementById('templates-section').style.display = 'block';
            document.getElementById('autofill-section').style.display = 'block';
        } else {
            this.authStatus.textContent = 'No conectado';
            this.authButton.textContent = 'Iniciar Sesión';
            this.authStatusBadge.textContent = 'Desconectado';
            this.authStatusBadge.classList.remove('active');
            document.getElementById('templates-section').style.display = 'none';
            document.getElementById('autofill-section').style.display = 'none';
        }
    }

    async handleAuth() {
        if (await this.auth.getCurrentUser()) {
            await this.auth.signOut();
            this.log('Sesión cerrada');
        } else {
            await this.auth.signIn();
            this.log('Sesión iniciada');
        }
        await this.setupAuth();
    }

    async loadTemplates() {
        const templates = await this.storage.getTemplates();
        
        // Limpiar listas
        this.templateList.innerHTML = '';
        this.currentTemplateSelect.innerHTML = '<option value="">Seleccionar plantilla...</option>';

        // Poblar listas
        templates.forEach(template => {
            // Lista de plantillas
            const item = document.createElement('div');
            item.className = 'template-item';
            item.innerHTML = `
                <div>
                    <strong>${template.name}</strong>
                    ${template.description ? `<br><small>${template.description}</small>` : ''}
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" data-action="edit" data-template-id="${template.id}">✏️</button>
                    <button class="btn btn-secondary" data-action="duplicate" data-template-id="${template.id}">📋</button>
                    <button class="btn btn-danger" data-action="delete" data-template-id="${template.id}">🗑️</button>
                </div>
            `;

            // Configurar eventos de los botones
            const buttons = item.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = button.dataset.action;
                    const templateId = button.dataset.templateId;
                    switch (action) {
                        case 'edit':
                            this.editTemplate(templateId);
                            break;
                        case 'duplicate':
                            this.duplicateTemplate(templateId);
                            break;
                        case 'delete':
                            this.deleteTemplate(templateId);
                            break;
                    }
                });
            });

            this.templateList.appendChild(item);

            // Selector de plantillas
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            this.currentTemplateSelect.appendChild(option);
        });
    }

    async saveTemplateData() {
        try {
            const name = this.templateName.value.trim();
            const dataStr = this.templateData.value.trim();
            const type = this.templateType.value;
            const description = this.templateDescription.value.trim();
            
            if (!name || !dataStr) {
                throw new Error('Nombre y datos son requeridos');
            }

            const data = JSON.parse(dataStr);
            await this.storage.saveTemplate({
                name,
                data,
                type,
                description,
                createdAt: new Date().toISOString()
            });

            this.showStatus('Plantilla guardada correctamente', 'success');
            this.log(`Plantilla "${name}" guardada`);
            this.clearTemplateForm();
            await this.loadTemplates();
        } catch (error) {
            this.showStatus(`Error: ${error.message}`, 'error');
            this.log(`Error al guardar plantilla: ${error.message}`, 'error');
        }
    }

    clearTemplateForm() {
        this.templateName.value = '';
        this.templateData.value = '';
        this.templateType.value = 'contact';
        this.templateDescription.value = '';
    }

    async editTemplate(templateId) {
        const template = await this.storage.getTemplate(templateId);
        if (template) {
            this.templateName.value = template.name;
            this.templateData.value = JSON.stringify(template.data, null, 2);
            this.templateType.value = template.type || 'custom';
            this.templateDescription.value = template.description || '';
            this.log(`Editando plantilla "${template.name}"`);
        }
    }

    async duplicateTemplate(templateId) {
        const template = await this.storage.getTemplate(templateId);
        if (template) {
            const newTemplate = {
                ...template,
                name: `${template.name} (copia)`,
                createdAt: new Date().toISOString()
            };
            await this.storage.saveTemplate(newTemplate);
            this.showStatus('Plantilla duplicada correctamente', 'success');
            this.log(`Plantilla "${template.name}" duplicada`);
            await this.loadTemplates();
        }
    }

    async deleteTemplate(templateId) {
        try {
            const template = await this.storage.getTemplate(templateId);
            if (confirm(`¿Estás seguro de que quieres eliminar la plantilla "${template.name}"?`)) {
                await this.storage.deleteTemplate(templateId);
                this.showStatus('Plantilla eliminada correctamente', 'success');
                this.log(`Plantilla "${template.name}" eliminada`);
                await this.loadTemplates();
            }
        } catch (error) {
            this.showStatus(`Error: ${error.message}`, 'error');
            this.log(`Error al eliminar plantilla: ${error.message}`, 'error');
        }
    }

    async handleTemplateSelection() {
        const templateId = this.currentTemplateSelect.value;
        if (templateId) {
            this.currentTemplate = await this.storage.getTemplate(templateId);
            this.log(`Plantilla "${this.currentTemplate.name}" seleccionada`);
        } else {
            this.currentTemplate = null;
        }
    }

    handleAutofillModeChange() {
        const mode = this.autofillMode.value;
        this.log(`Modo de autocompletado cambiado a: ${mode}`);
        chrome.storage.local.set({ autofillMode: mode });
    }

    handleSkipCaptchaChange() {
        const skip = this.skipCaptcha.checked;
        this.log(`Omitir captchas: ${skip ? 'Sí' : 'No'}`);
        chrome.storage.local.set({ skipCaptcha: skip });
    }

    async startAutofilling() {
        if (!this.currentTemplate) {
            this.showStatus('Por favor, selecciona una plantilla', 'error');
            return;
        }

        try {
            this.isAutofilling = true;
            this.updateAutofillUI(true);

            // Obtener la pestaña activa
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Si hay una URL objetivo, navegar a ella
            const targetUrl = this.targetUrl.value.trim();
            if (targetUrl) {
                await chrome.tabs.update(tab.id, { url: targetUrl });
                // Esperar a que la página cargue
                await new Promise(resolve => {
                    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                        if (tabId === tab.id && info.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve();
                        }
                    });
                });
            }

            // Enviar datos al content script
            await chrome.tabs.sendMessage(tab.id, {
                type: 'FILL_FORM',
                data: {
                    template: this.currentTemplate.data,
                    mode: this.autofillMode.value,
                    skipCaptcha: this.skipCaptcha.checked
                }
            });

            this.showStatus('Autocompletado iniciado', 'success');
            this.log(`Autocompletado iniciado con plantilla "${this.currentTemplate.name}"`);
        } catch (error) {
            this.showStatus(`Error: ${error.message}`, 'error');
            this.log(`Error en autocompletado: ${error.message}`, 'error');
            this.isAutofilling = false;
            this.updateAutofillUI(false);
        }
    }

    stopAutofilling() {
        this.isAutofilling = false;
        this.updateAutofillUI(false);
        this.showStatus('Autocompletado detenido', 'success');
        this.log('Autocompletado detenido');
    }

    updateAutofillUI(isRunning) {
        this.startAutofill.disabled = isRunning;
        this.stopAutofill.disabled = !isRunning;
        this.currentTemplateSelect.disabled = isRunning;
        this.targetUrl.disabled = isRunning;
        this.autofillMode.disabled = isRunning;
        this.skipCaptcha.disabled = isRunning;
        this.autofillStatus.textContent = isRunning ? 'Activo' : 'Inactivo';
        this.autofillStatus.classList.toggle('active', isRunning);
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = type;
        setTimeout(() => {
            this.statusMessage.textContent = '';
            this.statusMessage.className = '';
        }, 5000);
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = type;
        logEntry.textContent = `[${timestamp}] ${message}`;
        this.actionLog.insertBefore(logEntry, this.actionLog.firstChild);

        // Mantener solo los últimos 50 logs
        while (this.actionLog.children.length > 50) {
            this.actionLog.removeChild(this.actionLog.lastChild);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
