const API_BASE_URL = window.location.origin + '/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                this.clearToken();
                window.location.reload();
                return;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'An error occurred' }));
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            // Handle empty responses (204 No Content, or empty body)
            const contentType = response.headers.get('content-type');
            if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
                // Check if response has any content
                const text = await response.text();
                if (!text || text.trim() === '') {
                    return null; // Return null for empty responses
                }
                // Try to parse as JSON if there's content
                try {
                    return JSON.parse(text);
                } catch (e) {
                    // If it's not JSON, return the text
                    return text;
                }
            }

            // Parse JSON response
            const text = await response.text();
            if (!text || text.trim() === '') {
                return null; // Return null for empty JSON responses
            }
            
            try {
                return JSON.parse(text);
            } catch (e) {
                console.warn('Failed to parse JSON response, returning null:', e);
                return null;
            }
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const api = new ApiClient();

