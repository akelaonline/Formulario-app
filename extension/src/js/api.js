class API {
    constructor() {
        this.baseUrl = config.apiUrl;
    }

    async request(endpoint, options = {}) {
        const token = await this.getAuthToken();
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error en la solicitud');
        }

        return response.json();
    }

    async getAuthToken() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(token);
                }
            });
        });
    }

    // Categories
    async getCategories() {
        return this.request('/categories');
    }

    async createCategory(data) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateCategory(id, data) {
        return this.request(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteCategory(id) {
        return this.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    }

    // Templates
    async getTemplates() {
        return this.request('/templates');
    }

    async createTemplate(data) {
        return this.request('/templates', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateTemplate(id, data) {
        return this.request(`/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteTemplate(id) {
        return this.request(`/templates/${id}`, {
            method: 'DELETE'
        });
    }

    // Campaigns
    async getCampaigns() {
        return this.request('/campaigns');
    }

    async createCampaign(data) {
        return this.request('/campaigns', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateCampaign(id, data) {
        return this.request(`/campaigns/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteCampaign(id) {
        return this.request(`/campaigns/${id}`, {
            method: 'DELETE'
        });
    }

    async updateCampaignStatus(id, status) {
        return this.request(`/campaigns/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
}

const api = new API();
