/**
 * Vellare Doces — Components (Render Functions)
 * ===============================================
 * Funções puras que retornam HTML para cada página/componente.
 */

const Components = (() => {

    // ── Imagens placeholder por sabor ──
    const TRUFA_COLORS = {
        'leite condensado': 'linear-gradient(135deg, #F5E6D3 0%, #E8D5C0 100%)',
        'doce de leite': 'linear-gradient(135deg, #D4A574 0%, #C49060 100%)',
        'coco': 'linear-gradient(135deg, #FAFAFA 0%, #E8E4DC 100%)',
        'limão': 'linear-gradient(135deg, #F0F4C3 0%, #DCE775 100%)',
        'cacau': 'linear-gradient(135deg, #5D4037 0%, #4E342E 100%)',
        'chocolate': 'linear-gradient(135deg, #6D4C41 0%, #5D4037 100%)',
        'geléia de morango': 'linear-gradient(135deg, #EF9A9A 0%, #E57373 100%)',
        'ganache com conhaque': 'linear-gradient(135deg, #4E342E 0%, #3E2723 100%)',
    };

    const TRUFA_EMOJIS = {
        'leite condensado': '🍬',
        'doce de leite': '🍮',
        'coco': '🥥',
        'limão': '🍋',
        'cacau': '🍫',
        'chocolate': '🍫',
        'geléia de morango': '🍓',
        'ganache com conhaque': '🥃',
    };

    /**
     * Formata valor em reais.
     */
    function formatPrice(value) {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    /**
     * Retorna um gradiente de fundo para a trufa.
     */
    function getTrufaStyle(name) {
        const key = name.toLowerCase();
        return TRUFA_COLORS[key] || 'linear-gradient(135deg, #C49A6C 0%, #A67D50 100%)';
    }

    function getTrufaEmoji(name) {
        const key = name.toLowerCase();
        return TRUFA_EMOJIS[key] || '🍬';
    }

    return {
        // ══════════════════════════════════
        // HOME PAGE
        // ══════════════════════════════════
        renderHome() {
            return `
                <section class="hero">
                    <div class="hero-content">
                        <div class="hero-badge">
                            <span>🍫</span> Confeitaria Artesanal
                        </div>
                        <h1>
                            Cada doce é uma
                            <span class="gold">história de amor</span>
                        </h1>
                        <p class="hero-description">
                            Trufas artesanais feitas com ingredientes selecionados
                            e aquele toque especial que torna cada momento mais doce.
                        </p>
                        <div class="hero-actions">
                            <a href="#/cardapio" class="btn btn-primary btn-lg">
                                🍬 Ver Cardápio
                            </a>
                            <a href="#/sobre" class="btn btn-secondary btn-lg">
                                Nossa História
                            </a>
                        </div>
                        <div class="ornament">✦</div>
                    </div>
                </section>
            `;
        },

        // ══════════════════════════════════
        // ABOUT PAGE
        // ══════════════════════════════════
        renderAbout() {
            return `
                <section class="about-section section page-content">
                    <div class="container">
                        <div class="about-grid">
                            <div class="about-image-wrapper animate-fade-in-up">
                                <div class="about-image" style="
                                    background: linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 50%, var(--color-gold-light) 100%);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 8rem;
                                    border-radius: var(--radius-lg);
                                    aspect-ratio: 1;
                                ">🍫</div>
                            </div>
                            <div class="about-content">
                                <span class="section-label animate-fade-in-up stagger-1">✦ Nossa História</span>
                                <h2 class="section-title animate-fade-in-up stagger-2">A doce jornada da Vellare</h2>
                                <p class="about-text animate-fade-in-up stagger-3">
                                    A confeitaria sempre foi a minha grande paixão. Após muito estudo, dedicação e amor por cada detalhe,
                                    decidi transformar esse sonho em realidade e criar a minha própria marca: a <strong>Vellare</strong>.
                                </p>
                                <p class="about-text animate-fade-in-up stagger-4">
                                    Na Vellare, cada doce é preparado com carinho, utilizando ingredientes selecionados e aquele toque
                                    especial que torna cada momento ainda mais doce. Esta nova fase marca o início da minha jornada,
                                    e fico muito feliz em compartilhar cada etapa com vocês.
                                </p>
                                <p class="about-text animate-fade-in-up stagger-5">
                                    Seja para celebrar uma conquista, presentear alguém especial ou simplesmente adoçar o dia,
                                    espero fazer parte dos seus momentos mais felizes. Sejam muito bem-vindos(as)!
                                </p>
                                <p class="about-text animate-fade-in-up stagger-5">
                                    Que essa doce jornada seja apenas o começo de muitas histórias deliciosas.
                                </p>
                                <p class="about-signature animate-fade-in-up stagger-6">
                                    — Com amor, Vellare Doces 💛
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },

        // ══════════════════════════════════
        // MENU PAGE
        // ══════════════════════════════════
        renderMenu(products) {
            const productCards = products.map((product, index) => {
                const qty = Cart.getQuantity(product.id);
                const gradient = getTrufaStyle(product.name);
                const emoji = getTrufaEmoji(product.name);
                const badgeClass = product.category === 'gourmet' ? 'badge-gourmet' : 'badge-tradicional';
                const delay = Math.min(index + 1, 6);

                return `
                    <div class="product-card animate-fade-in-up stagger-${delay}" data-product-id="${product.id}">
                        <div class="product-card-image">
                            <div style="width:100%;height:100%;background:${gradient};display:flex;align-items:center;justify-content:center;font-size:4rem;">
                                ${emoji}
                            </div>
                            <span class="product-category-badge ${badgeClass}">
                                ${product.category}
                            </span>
                        </div>
                        <div class="product-card-body">
                            <h3 class="product-card-name">${product.name}</h3>
                            <p class="product-card-desc">${product.description || ''}</p>
                            <div class="product-card-footer">
                                <div class="product-price">
                                    ${formatPrice(product.price)}
                                    <span>/un</span>
                                </div>
                                <div class="quantity-controls">
                                    <button class="qty-btn qty-minus" onclick="Components.handleQtyChange(${product.id}, -1)" ${qty === 0 ? 'disabled' : ''}>−</button>
                                    <span class="qty-value" id="qty-${product.id}">${qty}</span>
                                    <button class="qty-btn qty-plus" onclick="Components.handleQtyChange(${product.id}, 1)">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <section class="menu-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                    <div class="container">
                        <div class="menu-header">
                            <span class="section-label">✦ Cardápio</span>
                            <h2 class="section-title">Nossas Trufas</h2>
                            <p style="color: var(--color-chocolate-light); max-width: 500px; margin: 0 auto;">
                                Escolha seus sabores favoritos e monte seu pedido.
                            </p>
                            <div class="menu-filters">
                                <button class="filter-btn active" data-filter="all" onclick="Components.filterProducts('all')">Todos</button>
                                <button class="filter-btn" data-filter="tradicional" onclick="Components.filterProducts('tradicional')">Tradicionais</button>
                                <button class="filter-btn" data-filter="gourmet" onclick="Components.filterProducts('gourmet')">Gourmet</button>
                            </div>
                        </div>
                        <div class="products-grid" id="products-grid">
                            ${productCards}
                        </div>
                    </div>
                </section>
            `;
        },

        // ══════════════════════════════════
        // CHECKOUT PAGE
        // ══════════════════════════════════
        renderCheckout() {
            const items = Cart.getItems();
            const totalPrice = Cart.getTotalPrice();

            const summaryItemsHTML = items.length > 0
                ? items.map(item => `
                    <li class="summary-item">
                        <div class="summary-item-info">
                            <span class="summary-item-name">${getTrufaEmoji(item.product.name)} ${item.product.name}</span>
                            <span class="summary-item-qty">${item.quantity}x ${formatPrice(item.product.price)}</span>
                        </div>
                        <span class="summary-item-price">${formatPrice(item.product.price * item.quantity)}</span>
                        <button class="summary-item-remove" onclick="Components.removeFromCart(${item.product.id})" title="Remover">✕</button>
                    </li>
                `).join('')
                : '';

            const emptyHTML = items.length === 0
                ? `<div class="summary-empty">
                        <span class="summary-empty-icon">🛒</span>
                        <p>Seu carrinho está vazio</p>
                        <a href="#/cardapio" class="btn btn-secondary btn-sm" style="margin-top: var(--space-md);">Ver Cardápio</a>
                   </div>`
                : '';

            return `
                <section class="checkout-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                    <div class="container">
                        <div class="menu-header" style="margin-bottom: var(--space-2xl);">
                            <span class="section-label">✦ Finalizar Pedido</span>
                            <h2 class="section-title">Checkout</h2>
                        </div>
                        <div class="checkout-grid">
                            <div class="checkout-form-card">
                                <h3 class="form-title">📋 Seus Dados</h3>
                                <form id="checkout-form" onsubmit="Components.handleCheckout(event)">
                                    <div class="form-group">
                                        <label class="form-label" for="customer_name">Nome completo *</label>
                                        <input class="form-input" type="text" id="customer_name" name="customer_name"
                                            placeholder="Seu nome" required minlength="2" maxlength="150">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" for="customer_phone">Telefone / WhatsApp *</label>
                                        <input class="form-input" type="tel" id="customer_phone" name="customer_phone"
                                            placeholder="(11) 99999-9999" required minlength="8" maxlength="20">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" for="notes">Observações</label>
                                        <textarea class="form-textarea" id="notes" name="notes"
                                            placeholder="Alguma observação sobre o pedido?" maxlength="500"></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-gold btn-lg form-submit" id="submit-btn"
                                        ${items.length === 0 ? 'disabled' : ''}>
                                        ✨ Enviar Pedido — ${formatPrice(totalPrice)}
                                    </button>
                                </form>
                            </div>
                            <div class="summary-card">
                                <h3 class="summary-title">🛒 Resumo do Pedido</h3>
                                ${emptyHTML}
                                <ul class="summary-items" id="summary-items">
                                    ${summaryItemsHTML}
                                </ul>
                                ${items.length > 0 ? `
                                    <div class="summary-total">
                                        <span class="summary-total-label">Total</span>
                                        <span class="summary-total-value">${formatPrice(totalPrice)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },

        // ══════════════════════════════════
        // ORDER CONFIRMATION MODAL
        // ══════════════════════════════════
        renderOrderConfirmation(order) {
            return `
                <div class="modal-overlay" id="order-modal" onclick="Components.closeModal(event)">
                    <div class="modal-content">
                        <div class="modal-icon">🎉</div>
                        <h2 class="modal-title">Pedido Confirmado!</h2>
                        <p class="modal-text">
                            Obrigada pelo seu pedido, <strong>${order.customer_name}</strong>!<br>
                            Estamos preparando suas trufas com muito carinho.
                        </p>
                        <div class="modal-order-id">Pedido #${order.id}</div>
                        <p class="modal-text" style="font-size: var(--text-sm);">
                            Total: <strong>${formatPrice(order.total)}</strong>
                        </p>
                        <button class="btn btn-primary" onclick="Components.closeConfirmation()">
                            Voltar ao Início
                        </button>
                    </div>
                </div>
            `;
        },

        // ══════════════════════════════════
        // EVENT HANDLERS
        // ══════════════════════════════════

        /**
         * Altera a quantidade de um produto (+ ou -).
         * Busca o produto da cache local.
         */
        handleQtyChange(productId, delta) {
            const currentQty = Cart.getQuantity(productId);
            const newQty = currentQty + delta;

            if (newQty <= 0) {
                Cart.remove(productId);
            } else if (currentQty === 0 && delta > 0) {
                // Precisa buscar o produto da cache
                const product = Components._productsCache.find(p => p.id === productId);
                if (product) {
                    Cart.add(product, 1);
                    App.showToast(`${product.name} adicionado ao carrinho!`, 'success');
                }
            } else {
                Cart.setQuantity(productId, newQty);
            }

            // Atualiza a UI do counter
            const qtyEl = document.getElementById(`qty-${productId}`);
            if (qtyEl) {
                const updatedQty = Cart.getQuantity(productId);
                qtyEl.textContent = updatedQty;

                // Habilitar/desabilitar botão de decrementar
                const card = qtyEl.closest('.product-card');
                const minusBtn = card?.querySelector('.qty-minus');
                if (minusBtn) {
                    minusBtn.disabled = updatedQty === 0;
                }
            }
        },

        /**
         * Remove item do carrinho (na página de checkout).
         */
        removeFromCart(productId) {
            Cart.remove(productId);
            // Re-renderiza a página de checkout
            if (window.location.hash === '#/checkout') {
                App.navigate('checkout');
            }
        },

        /**
         * Filtra os cards de produtos por categoria.
         */
        filterProducts(category) {
            // Atualiza botões de filtro
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === category);
            });

            // Filtra os cards
            document.querySelectorAll('.product-card').forEach(card => {
                const productId = parseInt(card.dataset.productId);
                const product = Components._productsCache.find(p => p.id === productId);

                if (category === 'all' || product?.category === category) {
                    card.style.display = '';
                    card.style.animation = 'fadeInUp 0.4s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        },

        /**
         * Submete o pedido.
         */
        async handleCheckout(event) {
            event.preventDefault();

            const items = Cart.getItems();
            if (items.length === 0) {
                App.showToast('Adicione trufas ao seu pedido primeiro!', 'warning');
                return;
            }

            const form = event.target;
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Enviando...';

            const orderData = {
                customer_name: form.customer_name.value.trim(),
                customer_phone: form.customer_phone.value.trim(),
                notes: form.notes.value.trim() || null,
                items: items.map(i => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                })),
            };

            try {
                const order = await API.createOrder(orderData);

                // Limpa o carrinho
                Cart.clear();

                // Mostra modal de confirmação
                const modal = Components.renderOrderConfirmation(order);
                document.body.insertAdjacentHTML('beforeend', modal);

            } catch (error) {
                App.showToast(`Erro ao enviar pedido: ${error.message}`, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = '✨ Enviar Pedido';
            }
        },

        /**
         * Fecha o modal de confirmação.
         */
        closeConfirmation() {
            const modal = document.getElementById('order-modal');
            if (modal) modal.remove();
            window.location.hash = '#/';
        },

        closeModal(event) {
            if (event.target.id === 'order-modal') {
                Components.closeConfirmation();
            }
        },

        /**
         * Cache de produtos carregados da API.
         */
        _productsCache: [],
    };
})();