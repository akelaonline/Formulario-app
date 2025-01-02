class FormAssistant {
    constructor() {
        this.formFields = [];
        this.currentTemplate = null;
        this.highlightedElement = null;
        this.tooltip = null;
        this.formData = null;
        this.form = null;
        this.fillMode = 'automatic';
        this.skipCaptcha = false;
    }

    async initialize() {
        this.createTooltip();
        this.addEventListeners();
        this.scanForm();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'form-assistant-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            display: none;
        `;
        document.body.appendChild(this.tooltip);
    }

    addEventListeners() {
        // Eventos para UI
        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));

        // Escuchar mensajes del popup
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'START_FILL':
                const { template, mode, skipCaptcha } = message.data;
                this.fillMode = mode;
                this.skipCaptcha = skipCaptcha;
                await this.startFilling(template);
                break;
            
            case 'STOP_FILL':
                this.stopFilling();
                break;
        }
        return true;
    }

    async startFilling(template) {
        try {
            this.currentTemplate = template;
            
            // Verificar captcha
            if (this.hasCaptcha() && !this.skipCaptcha) {
                chrome.runtime.sendMessage({ type: 'CAPTCHA_DETECTED' });
                return;
            }

            // Llenar según el modo
            switch (this.fillMode) {
                case 'automatic':
                    await this.fillFormAutomatic();
                    break;
                case 'manual':
                    this.highlightNextField();
                    break;
                case 'assisted':
                    await this.fillFormAssisted();
                    break;
            }
        } catch (error) {
            console.error('Error al llenar formulario:', error);
            chrome.runtime.sendMessage({
                type: 'FORM_STATUS',
                status: 'error',
                error: error.message
            });
        }
    }

    stopFilling() {
        this.currentTemplate = null;
        this.removeHighlights();
    }

    async fillFormAutomatic() {
        await this.fillAllFields();
        chrome.runtime.sendMessage({ type: 'FORM_FILLED' });
    }

    async fillFormAssisted() {
        await this.fillAllFields(true);
        this.highlightNextEmptyField();
    }

    highlightNextField() {
        const nextField = this.formFields.find(field => !field.value);
        if (nextField) {
            this.highlightElement(nextField);
        } else {
            chrome.runtime.sendMessage({ type: 'FORM_FILLED' });
        }
    }

    highlightNextEmptyField() {
        const nextField = this.formFields.find(field => !field.value);
        if (nextField) {
            this.highlightElement(nextField);
            this.showTooltip(nextField, 'Click para autocompletar');
        } else {
            chrome.runtime.sendMessage({ type: 'FORM_FILLED' });
        }
    }

    async fillAllFields(skipRequired = false) {
        for (const field of this.formFields) {
            if (skipRequired && field.required) continue;
            await this.fillField(field);
        }
    }

    async fillField(field) {
        const value = this.getValueFromTemplate(field);
        if (value !== undefined) {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    getValueFromTemplate(field) {
        // Implementar lógica para obtener el valor correcto del template
        return this.currentTemplate[field.name] || this.currentTemplate[field.id];
    }

    hasCaptcha() {
        // Detectar elementos comunes de captcha
        const captchaSelectors = [
            'iframe[src*="recaptcha"]',
            'iframe[src*="hcaptcha"]',
            'iframe[src*="turnstile"]',
            '.g-recaptcha',
            '.h-captcha'
        ];

        return captchaSelectors.some(selector => document.querySelector(selector));
    }

    scanForm() {
        // Buscar el formulario principal
        this.form = document.querySelector('form');
        if (!this.form) return;

        // Recolectar campos
        this.formFields = Array.from(this.form.querySelectorAll('input, select, textarea'))
            .filter(field => {
                const type = field.type.toLowerCase();
                return !['submit', 'button', 'reset', 'hidden'].includes(type);
            });
    }

    handleMouseOver(event) {
        if (!this.currentTemplate || this.fillMode !== 'manual') return;
        
        const field = event.target.closest('input, select, textarea');
        if (field && this.formFields.includes(field)) {
            this.highlightElement(field);
            this.showTooltip(field, 'Click para autocompletar');
        }
    }

    handleMouseOut(event) {
        if (!this.currentTemplate || this.fillMode !== 'manual') return;

        const field = event.target.closest('input, select, textarea');
        if (field) {
            this.removeHighlight(field);
            this.hideTooltip();
        }
    }

    handleClick(event) {
        if (!this.currentTemplate) return;

        const field = event.target.closest('input, select, textarea');
        if (field && this.formFields.includes(field)) {
            this.fillField(field);
        }
    }

    highlightElement(element) {
        this.removeHighlights();
        element.style.boxShadow = '0 0 0 2px #4CAF50';
        this.highlightedElement = element;
    }

    removeHighlight(element) {
        if (element) {
            element.style.boxShadow = '';
        }
    }

    removeHighlights() {
        if (this.highlightedElement) {
            this.removeHighlight(this.highlightedElement);
            this.highlightedElement = null;
        }
    }

    showTooltip(element, text) {
        const rect = element.getBoundingClientRect();
        this.tooltip.textContent = text;
        this.tooltip.style.left = `${rect.left}px`;
        this.tooltip.style.top = `${rect.bottom + 5}px`;
        this.tooltip.style.display = 'block';
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }
}

// Inicializar el asistente
const formAssistant = new FormAssistant();
formAssistant.initialize();
