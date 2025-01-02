class Auth {
    constructor() {
        this.user = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Intentar recuperar la sesión
            const token = await this.getStoredToken();
            if (token) {
                this.user = await this.getUserInfo(token);
            }
        } catch (error) {
            console.error('Error al inicializar auth:', error);
        } finally {
            this.isInitialized = true;
        }
    }

    async signIn() {
        try {
            const token = await this.getAuthToken();
            if (token) {
                this.user = await this.getUserInfo(token);
                await this.storeToken(token);
                return this.user;
            }
        } catch (error) {
            console.error('Error en signIn:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await chrome.identity.removeCachedAuthToken({ token: await this.getStoredToken() });
            await chrome.storage.local.remove('authToken');
            this.user = null;
        } catch (error) {
            console.error('Error en signOut:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.user;
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

    async getUserInfo(token) {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener información del usuario');
        }
        
        return response.json();
    }

    async getStoredToken() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['authToken'], (result) => {
                resolve(result.authToken);
            });
        });
    }

    async storeToken(token) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ authToken: token }, resolve);
        });
    }
}

// Exportar la clase
window.Auth = Auth;
