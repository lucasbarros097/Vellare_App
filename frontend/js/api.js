/**
 * Vellare Doces — API Client
 * ===========================
 * Wrapper para comunicação com o backend FastAPI.
 */

const API = (() => {
    // Em dev local, o Nginx faz proxy reverso /api -> api:8000
    // Em produção, altere para a URL do backend no Render/Railway
    const BASE_URL = '';

    /**
     * Fetch genérico com tratamento de erros.
     */
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
                throw new Error(errorData.detail || `Erro ${response.status}`);
            }

            // Para respostas de download (PDF/CSV)
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
        /**
         * Lista todos os produtos ativos.
         * @returns {Promise<Array>} Lista de produtos
         */
        getProducts() {
            return request('/api/products/');
        },

        /**
         * Cria um novo pedido.
         * @param {Object} orderData - { customer_name, customer_phone, notes, items: [{ product_id, quantity }] }
         * @returns {Promise<Object>} Pedido criado
         */
        createOrder(orderData) {
            return request('/api/orders/', {
                method: 'POST',
                body: JSON.stringify(orderData),
            });
        },

        /**
         * Consulta um pedido pelo ID.
         * @param {number} orderId
         * @returns {Promise<Object>} Pedido
         */
        getOrder(orderId) {
            return request(`/api/orders/${orderId}`);
        },

        /**
         * Lista todos os pedidos (admin).
         * @param {string} adminKey - Chave de autenticação
         * @param {string|null} statusFilter - Filtro por status
         * @returns {Promise<Object>} { orders, total_count }
         */
        getAdminOrders(adminKey, statusFilter = null) {
            let endpoint = '/api/admin/orders';
            if (statusFilter) {
                endpoint += `?status_filter=${statusFilter}`;
            }
            return request(endpoint, {
                headers: { 'X-Admin-Key': adminKey },
            });
        },

        /**
         * Atualiza o status de um pedido (admin).
         * @param {number} orderId
         * @param {string} status
         * @param {string} adminKey
         * @returns {Promise<Object>} Pedido atualizado
         */
        updateOrderStatus(orderId, status, adminKey) {
            return request(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
                headers: { 'X-Admin-Key': adminKey },
            });
        },

        /**
         * Exporta pedidos em PDF (admin).
         * @param {string} adminKey
         * @returns {Promise<Blob>} PDF blob
         */
        exportPDF(adminKey) {
            return request('/api/admin/export/pdf', {
                headers: { 'X-Admin-Key': adminKey },
            });
        },

        /**
         * Exporta pedidos em CSV (admin).
         * @param {string} adminKey
         * @returns {Promise<Blob>} CSV blob
         */
        exportCSV(adminKey) {
            return request('/api/admin/export/csv', {
                headers: { 'X-Admin-Key': adminKey },
            });
        },
    };
})();
