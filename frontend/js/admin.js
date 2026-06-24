/**
 * Vellare Doces — Admin Panel
 * ============================
 * Painel da doceira: login, fila de pedidos, exportações.
 */

const Admin = (() => {
    const ADMIN_KEY_STORAGE = 'vellare_admin_key';

    /**
     * Retorna a chave admin salva.
     */
    function getStoredKey() {
        return sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
    }

    /**
     * Salva a chave admin na session.
     */
    function storeKey(key) {
        sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    }

    /**
     * Formata valor em reais.
     */
    function formatPrice(value) {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    /**
     * Formata data.
     */
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    /**
     * Retorna o emoji do status.
     */
    function statusEmoji(status) {
        const map = {
            pendente: '🟠',
            preparando: '🔵',
            pronto: '🟢',
            entregue: '✅',
        };
        return map[status] || '⚪';
    }

    return {
        /**
         * Renderiza a página de login ou o painel admin.
         */
        renderAdminPage() {
            const key = getStoredKey();

            if (!key) {
                return Admin.renderLogin();
            }

            return Admin.renderPanel();
        },

        /**
         * Tela de login simples.
         */
        renderLogin() {
            return `
                <section class="admin-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                    <div class="container">
                        <div class="admin-login-card animate-fade-in-up">
                            <div class="admin-login-icon">👩‍🍳</div>
                            <h2 class="admin-login-title">Área da Doceira</h2>
                            <p class="admin-login-subtitle">
                                Insira a chave de acesso para gerenciar seus pedidos.
                            </p>
                            <form onsubmit="Admin.handleLogin(event)">
                                <div class="form-group">
                                    <input class="form-input" type="password" id="admin-key-input"
                                        placeholder="Chave de acesso" required autocomplete="off">
                                </div>
                                <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                                    🔓 Entrar
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            `;
        },

        /**
         * Painel com fila de pedidos (carregado dinamicamente).
         */
        renderPanel() {
            return `
                <section class="admin-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                    <div class="container">
                        <div class="admin-header">
                            <div>
                                <span class="section-label">✦ Painel Administrativo</span>
                                <h2 class="section-title">Fila de Pedidos</h2>
                            </div>
                            <div class="admin-actions">
                                <div class="menu-filters" style="margin: 0;">
                                    <button class="filter-btn active" data-status="all" onclick="Admin.filterByStatus(null)">Todos</button>
                                    <button class="filter-btn" data-status="pendente" onclick="Admin.filterByStatus('pendente')">🟠 Pendentes</button>
                                    <button class="filter-btn" data-status="preparando" onclick="Admin.filterByStatus('preparando')">🔵 Preparando</button>
                                    <button class="filter-btn" data-status="pronto" onclick="Admin.filterByStatus('pronto')">🟢 Prontos</button>
                                </div>
                                <button class="btn btn-secondary btn-sm" onclick="Admin.handleExport('pdf')">📄 PDF</button>
                                <button class="btn btn-secondary btn-sm" onclick="Admin.handleExport('csv')">📊 CSV</button>
                                <button class="btn btn-sm" onclick="Admin.loadOrders()" style="background: var(--color-cream); color: var(--color-chocolate);">🔄 Atualizar</button>
                                <button class="btn btn-sm" onclick="Admin.logout()" style="background: #ffeae6; color: var(--color-error);">🚪 Sair</button>
                            </div>
                        </div>
                        <div id="orders-container">
                            <div style="text-align: center; padding: var(--space-2xl); color: var(--color-chocolate-light);">
                                <div class="spinner" style="margin: 0 auto var(--space-md);"></div>
                                Carregando pedidos...
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },

        /**
         * Renderiza a tabela de pedidos.
         */
        renderOrdersTable(orders) {
            if (orders.length === 0) {
                return `
                    <div style="text-align: center; padding: var(--space-3xl); color: var(--color-chocolate-light);">
                        <div style="font-size: 3rem; margin-bottom: var(--space-md);">📭</div>
                        <p>Nenhum pedido encontrado.</p>
                    </div>
                `;
            }

            const rows = orders.map(order => {
                const itemsList = order.items.map(i =>
                    `${i.product_name || 'Produto'} ×${i.quantity}`
                ).join(', ');

                return `
                    <tr>
                        <td><strong>#${order.id}</strong></td>
                        <td>${order.customer_name}</td>
                        <td>${order.customer_phone}</td>
                        <td style="max-width: 200px;">${itemsList}</td>
                        <td><strong>${formatPrice(order.total)}</strong></td>
                        <td>
                            <select class="status-select" onchange="Admin.changeStatus(${order.id}, this.value)">
                                <option value="pendente" ${order.status === 'pendente' ? 'selected' : ''}>🟠 Pendente</option>
                                <option value="preparando" ${order.status === 'preparando' ? 'selected' : ''}>🔵 Preparando</option>
                                <option value="pronto" ${order.status === 'pronto' ? 'selected' : ''}>🟢 Pronto</option>
                                <option value="entregue" ${order.status === 'entregue' ? 'selected' : ''}>✅ Entregue</option>
                            </select>
                        </td>
                        <td style="font-size: var(--text-xs);">${formatDate(order.created_at)}</td>
                    </tr>
                `;
            }).join('');

            return `
                <div class="orders-table-wrapper animate-fade-in-up">
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Telefone</th>
                                <th>Itens</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
                <div style="text-align: center; margin-top: var(--space-lg); color: var(--color-chocolate-light); font-size: var(--text-sm);">
                    ${orders.length} pedido(s) encontrado(s)
                </div>
            `;
        },

        // ══════════════════════════════════
        // EVENT HANDLERS
        // ══════════════════════════════════

        /**
         * Login do admin.
         */
        async handleLogin(event) {
            event.preventDefault();
            const key = document.getElementById('admin-key-input').value;

            try {
                // Testa a chave fazendo uma request
                await API.getAdminOrders(key);
                storeKey(key);
                App.navigate('admin');
                App.showToast('Bem-vinda ao painel! 👩‍🍳', 'success');
            } catch (error) {
                App.showToast('Chave de acesso inválida.', 'error');
            }
        },

        /**
         * Logout do admin.
         */
        logout() {
            sessionStorage.removeItem(ADMIN_KEY_STORAGE);
            App.navigate('admin');
        },

        /**
         * Carrega pedidos da API.
         */
        async loadOrders(statusFilter = null) {
            const key = getStoredKey();
            const container = document.getElementById('orders-container');

            if (!container) return;

            try {
                const data = await API.getAdminOrders(key, statusFilter);
                container.innerHTML = Admin.renderOrdersTable(data.orders);
            } catch (error) {
                if (error.message.includes('403')) {
                    Admin.logout();
                    App.showToast('Sessão expirada. Faça login novamente.', 'warning');
                } else {
                    container.innerHTML = `
                        <div style="text-align: center; padding: var(--space-2xl); color: var(--color-error);">
                            Erro ao carregar pedidos: ${error.message}
                        </div>
                    `;
                }
            }
        },

        /**
         * Filtrar pedidos por status.
         */
        filterByStatus(status) {
            // Atualiza botões
            document.querySelectorAll('.admin-actions .filter-btn').forEach(btn => {
                const btnStatus = btn.dataset.status;
                btn.classList.toggle('active',
                    (status === null && btnStatus === 'all') ||
                    (btnStatus === status)
                );
            });

            Admin.loadOrders(status);
        },

        /**
         * Altera status de um pedido.
         */
        async changeStatus(orderId, newStatus) {
            const key = getStoredKey();

            try {
                await API.updateOrderStatus(orderId, newStatus, key);
                App.showToast(`Pedido #${orderId} → ${newStatus}`, 'success');
            } catch (error) {
                App.showToast(`Erro: ${error.message}`, 'error');
                Admin.loadOrders(); // Recarrega para resetar
            }
        },

        /**
         * Exporta relatório (PDF ou CSV).
         */
        async handleExport(format) {
            const key = getStoredKey();

            try {
                App.showToast(`Gerando ${format.toUpperCase()}...`, 'info');

                let blob;
                let filename;

                if (format === 'pdf') {
                    blob = await API.exportPDF(key);
                    filename = 'vellare_pedidos.pdf';
                } else {
                    blob = await API.exportCSV(key);
                    filename = 'vellare_pedidos.csv';
                }

                // Trigger download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                App.showToast(`${format.toUpperCase()} exportado com sucesso!`, 'success');
            } catch (error) {
                App.showToast(`Erro ao exportar: ${error.message}`, 'error');
            }
        },
    };
})();
