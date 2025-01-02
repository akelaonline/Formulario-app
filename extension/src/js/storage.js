class Storage {
    constructor() {
        this.TEMPLATES_KEY = 'formTemplates';
        this.CATEGORIES_KEY = 'urlCategories';
    }

    // Gestión de Plantillas
    async getTemplates() {
        const result = await chrome.storage.local.get(this.TEMPLATES_KEY);
        return result[this.TEMPLATES_KEY] || [];
    }

    async getTemplate(id) {
        const templates = await this.getTemplates();
        return templates.find(t => t.id === id);
    }

    async saveTemplate(template) {
        const templates = await this.getTemplates();
        
        if (!template.id) {
            template.id = Date.now().toString();
            templates.push(template);
        } else {
            const index = templates.findIndex(t => t.id === template.id);
            if (index !== -1) {
                templates[index] = template;
            } else {
                templates.push(template);
            }
        }

        await chrome.storage.local.set({ [this.TEMPLATES_KEY]: templates });
        return template;
    }

    async deleteTemplate(id) {
        const templates = await this.getTemplates();
        const newTemplates = templates.filter(t => t.id !== id);
        await chrome.storage.local.set({ [this.TEMPLATES_KEY]: newTemplates });
    }

    // Gestión de Categorías y URLs
    async getCategories() {
        const result = await chrome.storage.local.get(this.CATEGORIES_KEY);
        return result[this.CATEGORIES_KEY] || [];
    }

    async addCategory(name) {
        const categories = await this.getCategories();
        const newCategory = {
            id: Date.now().toString(),
            name,
            urls: []
        };
        
        categories.push(newCategory);
        await chrome.storage.local.set({ [this.CATEGORIES_KEY]: categories });
        return newCategory;
    }

    async deleteCategory(categoryId) {
        const categories = await this.getCategories();
        const newCategories = categories.filter(c => c.id !== categoryId);
        await chrome.storage.local.set({ [this.CATEGORIES_KEY]: newCategories });
    }

    async addUrl(categoryId, url) {
        const categories = await this.getCategories();
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        const urlItem = {
            id: Date.now().toString(),
            url,
            addedAt: new Date().toISOString()
        };

        category.urls.push(urlItem);
        await chrome.storage.local.set({ [this.CATEGORIES_KEY]: categories });
        return urlItem;
    }

    async deleteUrl(categoryId, urlId) {
        const categories = await this.getCategories();
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        category.urls = category.urls.filter(u => u.id !== urlId);
        await chrome.storage.local.set({ [this.CATEGORIES_KEY]: categories });
    }

    async updateUrl(categoryId, urlId, newUrl) {
        const categories = await this.getCategories();
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        const urlItem = category.urls.find(u => u.id === urlId);
        if (!urlItem) {
            throw new Error('URL no encontrada');
        }

        urlItem.url = newUrl;
        urlItem.updatedAt = new Date().toISOString();
        
        await chrome.storage.local.set({ [this.CATEGORIES_KEY]: categories });
        return urlItem;
    }
}

// Exportar la clase
window.Storage = Storage;
