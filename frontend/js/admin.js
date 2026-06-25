/**
 * Vellare Doces — Admin Panel
 * ============================
 * Painel da doceira: login, fila de pedidos, exportações, métricas de produção.
 */

const Admin = (() => {
    const ADMIN_KEY_STORAGE = 'vellare_admin_key';

    let _cachedOrders = [];
    let _currentStatusFilter = null;
    let _currentProductFilter = '';

    function getStoredKey() {
        return sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
    }

    function storeKey(key) {
        sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    }

    function formatPrice(value) {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        // Formatação nativa para o padrão Brasileiro (pt-BR)
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return {
        renderAdminPage() {
            const key = getStoredKey();
            if (!key) return Admin.renderLogin();
            return Admin.renderPanel();
        },

        renderLogin() {
            return `
                <section class="admin-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                    <div class="container">
                        <div class="admin-login-card animate-fade-in-up">
                            <div class="admin-login-icon">👩‍🍳</div>
                            <h2 class="admin-login-title">Área da Doceira</h2>
                            <p class="admin-login-subtitle">Insira a chave de acesso para gerenciar seus pedidos.</p>
                            <form onsubmit="Admin.handleLogin(event)">
                                <div class="form-group">
                                    <input class="form-input" type="password" id="admin-key-input" placeholder="Chave de acesso" required autocomplete="off">
                                </div>
                                <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">🔓 Entrar</button>
                            </form>
                        </div>
                    </div>
                </section>
            `;
        },

        renderPanel() {
            return `
                <section class="admin-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                    <div class="container">
                        <div class="admin-header" style="flex-wrap: wrap; gap: var(--space-md);">
                            <div>
                                <span class="section-label">✦ Painel Administrativo</span>
                                <h2 class="section-title">Fila de Pedidos</h2>
                            </div>
                            
                            <div class="admin-actions" style="display: flex; flex-wrap: wrap; gap: var(--space-sm); align-items: center; width: 100%;">
                                <!-- Botoes de Status -->
                                <div class="menu-filters" style="margin: 0;">
                                    <button class="filter-btn active" data-status="all" onclick="Admin.filterByStatus(null)">Todos</button>
                                    <button class="filter-btn" data-status="pendente" onclick="Admin.filterByStatus('pendente')">🟠 Pendentes</button>
                                    <button class="filter-btn" data-status="preparando" onclick="Admin.filterByStatus('preparando')">🔵 Preparando</button>
                                    <button class="filter-btn" data-status="pronto" onclick="Admin.filterByStatus('pronto')">🟢 Prontos</button>
                                    <button class="filter-btn" data-status="entregue" onclick="Admin.filterByStatus('entregue')">✅ Entregues</button>
                                </div>
                                
                                <select id="product-filter" class="status-select" style="padding: 10px 16px; border-radius: var(--radius-md); border: 1px solid var(--color-cream-dark); background: white; font-family: inherit; color: var(--color-chocolate); cursor: pointer; font-weight: 500;" onchange="Admin.filterByProduct(this.value)">
                                    <option value="">🍬 Todos os Sabores</option>
                                </select>
                            </div>

                            <!-- Barra de Calendário e Extração -->
                            <div class="admin-actions" style="display: flex; flex-wrap: wrap; gap: var(--space-sm); align-items: center; background: #faf6f0; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); margin-top: var(--space-sm);">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: var(--text-sm); font-weight: 600; color: var(--color-chocolate);">📅 Período:</span>
                                    <input type="date" id="filter-start-date" class="form-input" style="padding: 6px 10px; max-width: 140px; font-size: 14px; border-color: var(--color-gold-light);">
                                    <span style="color: var(--color-chocolate-light); font-size: 14px;">até</span>
                                    <input type="date" id="filter-end-date" class="form-input" style="padding: 6px 10px; max-width: 140px; font-size: 14px; border-color: var(--color-gold-light);">
                                    <button class="btn btn-sm" onclick="Admin.loadOrders(Admin.getCurrentStatus())" style="background: var(--color-gold); color: white; padding: 6px 12px;">🔍 Filtrar</button>
                                </div>
                                
                                <div style="flex-grow: 1;"></div>
                                
                                <button class="btn btn-secondary btn-sm" onclick="Admin.handleExport('pdf')">📄 PDF</button>
                                <button class="btn btn-secondary btn-sm" onclick="Admin.handleExport('csv')">📊 CSV</button>
                                <button class="btn btn-sm" onclick="Admin.loadOrders(Admin.getCurrentStatus())" style="background: var(--color-cream); color: var(--color-chocolate);">🔄 Atualizar</button>
                                <button class="btn btn-sm" onclick="Admin.logout()" style="background: #ffeae6; color: var(--color-error);">🚪 Sair</button>
                            </div>
                        </div>

                        <div id="production-summary-container" style="margin-bottom: var(--space-xl);"></div>

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

        renderProductionSummary(orders) {
            const totals = {};
            orders.forEach(order => {
                if (order.status === 'entregue' || order.status === 'cancelado') {
                    return;
                }
                order.items.forEach(item => {
                    const name = item.product_name || 'Produto';
                    totals[name] = (totals[name] || 0) + item.quantity;
                });
            });

            const productNames = Object.keys(totals);
            if (productNames.length === 0) {
                return `
                    <div style="background: #faf6f0; border-radius: var(--radius-lg); padding: var(--space-md); border: 1px dashed var(--color-cream-dark); text-align: center; color: var(--color-chocolate-light); font-size: var(--text-sm);">
                        Nenhuma trufa pendente para produção neste filtro.
                    </div>
                `;
            }

            const emojis = {
                'leite condensado': '🍬', 'doce de leite': '🍮', 'coco': '🥥',
                'limão': '🍋', 'cacau': '🍫', 'chocolate': '🍫',
                'geléia de morango': '🍓', 'ganache com conhaque': '🥃'
            };

            const cards = productNames.map(name => {
                const emoji = emojis[name.toLowerCase().trim()] || '🍬';
                return `
                    <div class="production-card" style="background: white; border: 1px solid var(--color-cream-dark); border-radius: var(--radius-md); padding: var(--space-md); display: flex; align-items: center; gap: var(--space-md); box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
                        <div style="font-size: 2rem;">${emoji}</div>
                        <div>
                            <div style="font-size: var(--text-xs); color: var(--color-chocolate-light); font-weight: 600; text-transform: capitalize;">${name}</div>
                            <div style="font-size: var(--text-lg); font-weight: 700; color: var(--color-chocolate);">${totals[name]} <span style="font-size: var(--text-xs); font-weight: 400; color: var(--color-chocolate-light);">unidades</span></div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div style="background: #faf6f0; border-radius: var(--radius-lg); padding: var(--space-lg); border: 1px dashed var(--color-gold);">
                    <h3 style="font-size: var(--text-sm); margin-bottom: var(--space-md); color: var(--color-chocolate); display: flex; align-items: center; gap: var(--space-xs);">👨‍🍳 Necessidade de Produção Atual</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-md);">
                        ${cards}
                    </div>
                </div>
            `;
        },

        renderOrdersTable(orders) {
            if (orders.length === 0) {
                return `
                    <div style="text-align: center; padding: var(--space-3xl); color: var(--color-chocolate-light);">
                        <div style="font-size: 3rem; margin-bottom: var(--space-md);">📭</div>
                        <p>Nenhum pedido encontrado para este filtro.</p>
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
                        <td style="max-width: 250px; font-weight: 500;">${itemsList}</td>
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
                    ${orders.length} pedido(s) listado(s)
                </div>
            `;
        },

        async loadOrders(statusFilter = null) {
            _currentStatusFilter = statusFilter;
            const key = getStoredKey();
            const container = document.getElementById('orders-container');

            const startDateEl = document.getElementById('filter-start-date');
            const endDateEl = document.getElementById('filter-end-date');
            const startDate = startDateEl ? startDateEl.value : null;
            const endDate = endDateEl ? endDateEl.value : null;

            // 🛑 TRAVA: Verificação de Data Futura
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const checkFutureDate = (dateStr) => {
                if (!dateStr) return false;
                const [year, month, day] = dateStr.split('-');
                const selectedDate = new Date(year, month - 1, day);
                return selectedDate > today;
            };

            if (checkFutureDate(startDate) || checkFutureDate(endDate)) {
                App.showToast('Erro: Você não pode filtrar dias no futuro.', 'error');
                return;
            }
            // ============================================

            if (!container) return;

            try {
                const data = await API.getAdminOrders(key, statusFilter, startDate, endDate);
                _cachedOrders = data.orders;

                Admin.updateProductDropdownOptions();
                Admin.applyFiltersAndRender();
            } catch (error) {
                if (error.message && error.message.includes('403')) {
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

        updateProductDropdownOptions() {
            const select = document.getElementById('product-filter');
            if (!select) return;

            const productsSet = new Set();
            _cachedOrders.forEach(order => {
                order.items.forEach(item => {
                    if (item.product_name) productsSet.add(item.product_name);
                });
            });

            select.innerHTML = '<option value="">🍬 Todos os Sabores</option>';
            Array.from(productsSet).sort().forEach(prod => {
                const selected = _currentProductFilter === prod ? 'selected' : '';
                select.innerHTML += `<option value="${prod}" ${selected}>${prod}</option>`;
            });
        },

        applyFiltersAndRender() {
            const container = document.getElementById('orders-container');
            const summaryContainer = document.getElementById('production-summary-container');
            if (!container) return;

            if (summaryContainer) {
                summaryContainer.innerHTML = Admin.renderProductionSummary(_cachedOrders);
            }

            let filteredOrders = _cachedOrders;
            if (_currentProductFilter) {
                filteredOrders = _cachedOrders.filter(order =>
                    order.items.some(item => item.product_name === _currentProductFilter)
                );
            }

            container.innerHTML = Admin.renderOrdersTable(filteredOrders);
        },

        filterByStatus(status) {
            _currentProductFilter = '';
            _currentStatusFilter = status;

            document.querySelectorAll('.admin-actions .filter-btn').forEach(btn => {
                const btnStatus = btn.dataset.status;
                btn.classList.toggle('active',
                    (status === null && btnStatus === 'all') ||
                    (btnStatus === status)
                );
            });

            Admin.loadOrders(status);
        },

        filterByProduct(productName) {
            _currentProductFilter = productName;
            Admin.applyFiltersAndRender();
        },

        getCurrentStatus() {
            return _currentStatusFilter;
        },

        async handleLogin(event) {
            event.preventDefault();
            const key = document.getElementById('admin-key-input').value;

            try {
                await API.getAdminOrders(key);
                storeKey(key);
                App.navigate('admin');
                App.showToast('Bem-vinda ao painel! 👩‍🍳', 'success');
            } catch (error) {
                App.showToast('Chave de acesso inválida.', 'error');
            }
        },

        logout() {
            sessionStorage.removeItem(ADMIN_KEY_STORAGE);
            App.navigate('admin');
        },

        async changeStatus(orderId, newStatus) {
            const key = getStoredKey();

            try {
                await API.updateOrderStatus(orderId, newStatus, key);
                App.showToast(`Pedido #${orderId} atualizado para ${newStatus}`, 'success');
                Admin.loadOrders(_currentStatusFilter);
            } catch (error) {
                console.error("Erro detalhado ao mudar status:", error);
                App.showToast(`Falha: ${error.message}`, 'error');
                Admin.loadOrders(_currentStatusFilter);
            }
        },

        async handleExport(format) {
            const key = getStoredKey();

            const startDateEl = document.getElementById('filter-start-date');
            const endDateEl = document.getElementById('filter-end-date');
            const startDate = startDateEl ? startDateEl.value : null;
            const endDate = endDateEl ? endDateEl.value : null;

            try {
                App.showToast(`Gerando ${format.toUpperCase()}...`, 'info');

                let blob;
                let filename;

                if (format === 'pdf') {
                    blob = await API.exportPDF(key, startDate, endDate);
                    filename = 'vellare_pedidos.pdf';
                } else {
                    blob = await API.exportCSV(key, startDate, endDate);
                    filename = 'vellare_pedidos.csv';
                }

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
                App.showToast(`Erro ao exportar: ${error.message || 'Falha na geração do arquivo'}`, 'error');
            }
        },
    };
})();