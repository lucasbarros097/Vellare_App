/**
 * Vellare Doces — SPA Router & App Controller
 * =============================================
 * Hash-based router, inicialização, toast system.
 */

const App = (() => {
    const appEl = () => document.getElementById('app');
    let currentPage = '';

    /**
     * Rotas do SPA.
     */
    const routes = {
        '':         'home',
        '/':        'home',
        '/sobre':   'about',
        '/cardapio':'menu',
        '/checkout':'checkout',
        '/admin':   'admin',
    };

    /**
     * Navega para uma página.
     */
    async function navigate(page) {
        currentPage = page;
        const main = appEl();
        if (!main) return;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        switch (page) {
            case 'home':
                main.innerHTML = Components.renderHome();
                break;

            case 'about':
                main.innerHTML = Components.renderAbout();
                break;

            case 'menu':
                main.innerHTML = `
                    <section class="menu-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                        <div class="container" style="text-align: center;">
                            <div class="spinner" style="margin: var(--space-2xl) auto;"></div>
                            <p style="color: var(--color-chocolate-light);">Carregando cardápio...</p>
                        </div>
                    </section>
                `;
                try {
                    const products = await API.getProducts();
                    Components._productsCache = products;
                    main.innerHTML = Components.renderMenu(products);
                } catch (error) {
                    main.innerHTML = `
                        <section class="menu-section section page-content" style="padding-top: calc(var(--space-4xl) + 60px);">
                            <div class="container" style="text-align: center; padding: var(--space-3xl);">
                                <div style="font-size: 3rem; margin-bottom: var(--space-md);">😞</div>
                                <h3 style="color: var(--color-chocolate);">Não foi possível carregar o cardápio</h3>
                                <p style="color: var(--color-chocolate-light); margin: var(--space-md) 0;">
                                    Verifique se o servidor está rodando.<br>
                                    <code style="font-size: var(--text-sm);">${error.message}</code>
                                </p>
                                <button class="btn btn-secondary" onclick="App.navigate('menu')">🔄 Tentar novamente</button>
                            </div>
                        </section>
                    `;
                }
                break;

            case 'checkout':
                main.innerHTML = Components.renderCheckout();
                break;

            case 'admin':
                main.innerHTML = Admin.renderAdminPage();
                // Se já estiver autenticado, carrega pedidos
                if (sessionStorage.getItem('vellare_admin_key')) {
                    setTimeout(() => Admin.loadOrders(), 100);
                }
                break;

            default:
                main.innerHTML = Components.renderHome();
        }

        // Update nav active state
        updateNavActive(page);
    }

    /**
     * Atualiza o estado ativo dos links de navegação.
     */
    function updateNavActive(page) {
        const pageMap = {
            'home': 'home',
            'about': 'about',
            'menu': 'menu',
            'checkout': 'checkout',
            'admin': 'admin',
        };

        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.dataset.page;
            link.classList.toggle('active', linkPage === pageMap[page]);
        });
    }

    /**
     * Handler de mudança de hash.
     */
    function handleHashChange() {
        const hash = window.location.hash.replace('#', '') || '/';
        const page = routes[hash] || 'home';
        navigate(page);
    }

    /**
     * Toast notification system.
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💡',
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    /**
     * Inicialização da aplicação.
     */
    function init() {
        // Hash change listener
        window.addEventListener('hashchange', handleHashChange);

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }
        });

        // Hamburger menu toggle
        const hamburger = document.getElementById('hamburger');
        const nav = document.getElementById('nav');
        if (hamburger && nav) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                nav.classList.toggle('open');
            });

            // Close nav on link click (mobile)
            nav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    nav.classList.remove('open');
                });
            });
        }

        // Cart badge update
        Cart.subscribe(({ totalItems }) => {
            const badge = document.getElementById('cart-badge');
            if (badge) {
                if (totalItems > 0) {
                    badge.textContent = totalItems;
                    badge.style.display = 'flex';
                    badge.classList.remove('bump');
                    void badge.offsetWidth; // Force reflow
                    badge.classList.add('bump');
                } else {
                    badge.style.display = 'none';
                }
            }
        });

        // Navigate to initial page
        handleHashChange();
    }

    // Boot the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        navigate,
        showToast,
        init,
    };
})();
