/**
 * Vellare Doces — Carrinho (State Manager)
 * =========================================
 * Gerencia o estado do carrinho com localStorage e subscribe pattern.
 */

const Cart = (() => {
    const STORAGE_KEY = 'vellare_cart';
    const listeners = [];

    /**
     * Lê o carrinho do localStorage.
     * @returns {Array} Itens no formato [{ product, quantity }]
     */
    function getItems() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    /**
     * Salva o carrinho no localStorage e notifica listeners.
     * @param {Array} items
     */
    function save(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        notify();
    }

    /**
     * Notifica todos os listeners registrados.
     */
    function notify() {
        const items = getItems();
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

        listeners.forEach(fn => fn({ items, totalItems, totalPrice }));
    }

    return {
        /**
         * Adiciona um produto ao carrinho ou incrementa a quantidade.
         * @param {Object} product - Objeto do produto
         * @param {number} qty - Quantidade a adicionar (default: 1)
         */
        add(product, qty = 1) {
            const items = getItems();
            const existing = items.find(i => i.product.id === product.id);

            if (existing) {
                existing.quantity += qty;
            } else {
                items.push({ product, quantity: qty });
            }

            save(items);
        },

        /**
         * Remove uma unidade ou remove completamente o item.
         * @param {number} productId
         */
        decrement(productId) {
            const items = getItems();
            const idx = items.findIndex(i => i.product.id === productId);

            if (idx === -1) return;

            items[idx].quantity -= 1;
            if (items[idx].quantity <= 0) {
                items.splice(idx, 1);
            }

            save(items);
        },

        /**
         * Remove completamente um item do carrinho.
         * @param {number} productId
         */
        remove(productId) {
            const items = getItems().filter(i => i.product.id !== productId);
            save(items);
        },

        /**
         * Define a quantidade exata de um produto.
         * @param {number} productId
         * @param {number} qty
         */
        setQuantity(productId, qty) {
            const items = getItems();
            const existing = items.find(i => i.product.id === productId);

            if (qty <= 0) {
                return this.remove(productId);
            }

            if (existing) {
                existing.quantity = qty;
            }

            save(items);
        },

        /**
         * Retorna a quantidade de um produto no carrinho.
         * @param {number} productId
         * @returns {number}
         */
        getQuantity(productId) {
            const item = getItems().find(i => i.product.id === productId);
            return item ? item.quantity : 0;
        },

        /**
         * Retorna todos os itens.
         * @returns {Array}
         */
        getItems,

        /**
         * Retorna o total de itens (soma das quantidades).
         * @returns {number}
         */
        getTotalItems() {
            return getItems().reduce((sum, i) => sum + i.quantity, 0);
        },

        /**
         * Retorna o valor total do carrinho.
         * @returns {number}
         */
        getTotalPrice() {
            return getItems().reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
        },

        /**
         * Limpa todo o carrinho.
         */
        clear() {
            localStorage.removeItem(STORAGE_KEY);
            notify();
        },

        /**
         * Registra um listener para mudanças no carrinho.
         * @param {Function} fn - Callback({ items, totalItems, totalPrice })
         */
        subscribe(fn) {
            listeners.push(fn);
            // Notifica imediatamente com o estado atual
            const items = getItems();
            fn({
                items,
                totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
                totalPrice: items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0),
            });
        },
    };
})();
