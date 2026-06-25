/**
 * Vellare Doces — API Client
 * ===========================
 * Wrapper para comunicação com o backend FastAPI.
 */

const API = (() => {
    const BASE_URL = '';

    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Tratamento especial para os erros em formato de lista do FastAPI
                let errorMsg = errorData.detail;
                if (Array.isArray(errorMsg)) {
                    errorMsg = errorMsg.map(e => e.msg).join(' | ');
                } else if (typeof errorMsg === 'object') {
                    errorMsg = JSON.stringify(errorMsg);
                }

                throw new Error(errorMsg || `Erro no servidor (${response.status})`);
            }

            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/pdf') || contentType.includes('text/csv')) {
                return response.blob();
            }

            return await response.json();
        } catch (error) {
            console.error(`[API] ${error.message}`, { endpoint, options });
            throw error;
        }
    }

    return {
        getProducts() {
            return request('/api/products/');
        },

        createOrder(orderData) {
            return request('/api/orders/', {
                method: 'POST',
                body: JSON.stringify(orderData),
            });
        },

        getOrder(orderId) {
            return request(`/api/orders/${orderId}`);
        },

        getAdminOrders(adminKey, statusFilter = null, startDate = null, endDate = null) {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status_filter', statusFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            return request(`/api/admin/orders${queryString}`, {
                headers: { 'X-Admin-Key': adminKey },
            });
        },

        updateOrderStatus(orderId, status, adminKey) {
            return request(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'X-Admin-Key': adminKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "status": status }),
            });
        },

        exportPDF(adminKey, startDate = null, endDate = null) {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            return request(`/api/admin/export/pdf${queryString}`, {
                headers: { 'X-Admin-Key': adminKey },
            });
        },

        exportCSV(adminKey, startDate = null, endDate = null) {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            return request(`/api/admin/export/csv${queryString}`, {
                headers: { 'X-Admin-Key': adminKey },
            });
        },
    };
})();