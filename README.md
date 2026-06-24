# Vellare Doces — Sistema de Gestão de Pedidos

> Sistema completo de pedidos online para a confeitaria Vellare Doces, com frontend SPA (HTML/CSS/JS) servido por Nginx, backend FastAPI com PostgreSQL, 100% conteinerizado via Docker Compose.

---

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Arquitetura](#arquitetura)
- [Árvore de Diretórios](#árvore-de-diretórios)
- [Setup Local (Docker)](#setup-local-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Inspeção e Troubleshooting](#inspeção-e-troubleshooting)
- [Deploy em Produção](#deploy-em-produção)
- [Stack Tecnológica](#stack-tecnológica)

---

## Pré-requisitos

| Software | Versão Mínima | Verificação |
|----------|---------------|-------------|
| Docker Desktop | 4.x | `docker --version` |
| Docker Compose | v2.x (plugin) | `docker compose version` |
| WSL2 (Windows) | Kernel 5.x | `wsl --list --verbose` |
| Git | 2.x | `git --version` |

> **⚠️ Windows**: Certifique-se de que o Docker Desktop está rodando com o backend WSL2 habilitado em `Settings > General > Use the WSL 2 based engine`.

---

## Arquitetura

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser    │────▶│  Nginx (:80)     │────▶│ FastAPI      │
│   (Client)   │     │  Static Files    │     │ (:8000)      │
│              │     │  Proxy /api/*    │     │              │
└─────────────┘     └──────────────────┘     └──────┬───────┘
                     vellare-frontend                │
                                                     │ SQLAlchemy
                                               ┌────▼───────┐
                                               │ PostgreSQL  │
                                               │ (:5432)     │
                                               │ Alpine 16   │
                                               └─────────────┘
                                                vellare-db
```

### Comunicação entre serviços:
- **Frontend → API**: Nginx faz proxy reverso de `/api/*` para `http://api:8000`
- **API → DB**: Conexão via `DATABASE_URL` na rede interna Docker
- **Rede**: Todos os serviços compartilham a rede `vellare-network`

---

## Árvore de Diretórios

```
Vellari_App/
├── .env                          # Variáveis de ambiente (gitignored)
├── .env.example                  # Template do .env
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile                # Multi-stage build
│   ├── requirements.txt
│   └── app/
│       ├── main.py               # FastAPI app + CORS + lifespan
│       ├── core/
│       │   ├── config.py         # Pydantic Settings
│       │   └── database.py       # SQLAlchemy engine + session
│       ├── models/
│       │   └── models.py         # Product, Order, OrderItem
│       ├── schemas/
│       │   └── schemas.py        # Pydantic schemas
│       ├── api/
│       │   ├── products.py       # GET /api/products
│       │   ├── orders.py         # POST/GET /api/orders
│       │   └── admin.py          # Admin routes + auth
│       └── services/
│           ├── seed.py           # Seed inicial das trufas
│           └── export.py         # PDF (ReportLab) + CSV
│
├── frontend/
│   ├── Dockerfile                # Nginx Alpine
│   ├── nginx.conf                # Proxy reverso + cache
│   ├── index.html                # SPA shell
│   ├── css/styles.css            # Design system completo
│   ├── js/
│   │   ├── app.js                # SPA Router
│   │   ├── api.js                # API Client
│   │   ├── cart.js               # Cart State Manager
│   │   ├── components.js         # Render Functions
│   │   └── admin.js              # Admin Panel
│   ├── assets/
│   └── pages/
│
└── infra/
    └── docker-compose.yml        # 3 serviços orquestrados
```

---

## Setup Local (Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/vellare-doces.git
cd vellare-doces
```

### 2. Configure o arquivo `.env`

```bash
# Copie o template
cp .env.example .env

# Edite conforme necessário (valores padrão já funcionam para dev)
nano .env  # ou code .env
```

### 3. Suba toda a stack

```bash
# Build + Start (detached mode)
docker compose -f infra/docker-compose.yml --env-file .env up -d --build
```

### 4. Verifique se todos os serviços estão saudáveis

```bash
# Status dos containers
docker compose -f infra/docker-compose.yml ps

# Saída esperada:
# NAME               STATUS                  PORTS
# vellare-db         running (healthy)       0.0.0.0:5432->5432/tcp
# vellare-api        running                 0.0.0.0:8000->8000/tcp
# vellare-frontend   running                 0.0.0.0:80->80/tcp
```

### 5. Acesse a aplicação

| Serviço | URL |
|---------|-----|
| Frontend (SPA) | http://localhost |
| API Swagger Docs | http://localhost:8000/api/docs |
| API ReDoc | http://localhost:8000/api/redoc |
| API Health Check | http://localhost:8000/api/health |

### 6. Teste a API diretamente

```bash
# Listar produtos
curl http://localhost:8000/api/products/ | python -m json.tool

# Criar pedido
curl -X POST http://localhost:8000/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Maria Silva",
    "customer_phone": "(11) 99999-9999",
    "notes": "Sem pressa!",
    "items": [
      {"product_id": 1, "quantity": 3},
      {"product_id": 7, "quantity": 2}
    ]
  }'

# Listar pedidos (admin)
curl -H "X-Admin-Key: vellare-admin-2024" \
  http://localhost:8000/api/admin/orders
```

---

## Variáveis de Ambiente

| Variável | Descrição | Valor Padrão (Dev) |
|----------|-----------|-------------------|
| `POSTGRES_USER` | Usuário do PostgreSQL | `vellare_user` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `vellare_secret_2024` |
| `POSTGRES_DB` | Nome do banco | `vellare_db` |
| `DATABASE_URL` | Connection string completa | `postgresql://vellare_user:vellare_secret_2024@db:5432/vellare_db` |
| `API_HOST` | Host de bind da API | `0.0.0.0` |
| `API_PORT` | Porta da API | `8000` |
| `CORS_ORIGINS` | Origens permitidas (vírgula) | `http://localhost,http://localhost:80` |
| `ADMIN_KEY` | Chave de autenticação admin | `vellare-admin-2024` |

---

## Endpoints da API

### Públicos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/products/` | Lista produtos ativos |
| `POST` | `/api/orders/` | Cria novo pedido |
| `GET` | `/api/orders/{id}` | Consulta pedido por ID |
| `GET` | `/api/health` | Health check |

### Admin (requer header `X-Admin-Key`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/admin/orders` | Lista todos os pedidos |
| `PATCH` | `/api/admin/orders/{id}/status` | Atualiza status |
| `GET` | `/api/admin/export/pdf` | Exporta relatório PDF |
| `GET` | `/api/admin/export/csv` | Exporta relatório CSV |

---

## Inspeção e Troubleshooting

### Logs dos serviços

```bash
# Todos os serviços
docker compose -f infra/docker-compose.yml logs -f

# Apenas API
docker compose -f infra/docker-compose.yml logs -f api

# Apenas DB (ver se migrations rodaram)
docker compose -f infra/docker-compose.yml logs db | head -50
```

### Acessar shell do container

```bash
# Shell da API (Python)
docker exec -it vellare-api /bin/bash

# Shell do DB (PostgreSQL)
docker exec -it vellare-db psql -U vellare_user -d vellare_db

# Verificar tabelas no banco
docker exec -it vellare-db psql -U vellare_user -d vellare_db -c "\dt"

# Verificar produtos seedados
docker exec -it vellare-db psql -U vellare_user -d vellare_db -c "SELECT * FROM products;"
```

### Rebuild e Reset

```bash
# Rebuild completo (sem cache)
docker compose -f infra/docker-compose.yml build --no-cache

# Parar e remover tudo (inclusive volumes/dados)
docker compose -f infra/docker-compose.yml down -v

# Parar sem remover dados
docker compose -f infra/docker-compose.yml down

# Restart individual
docker compose -f infra/docker-compose.yml restart api
```

### Problemas comuns

| Sintoma | Causa Provável | Solução |
|---------|---------------|---------|
| `connection refused :80` | Frontend não subiu | `docker compose logs frontend` |
| `connection refused :8000` | API esperando DB | Verificar healthcheck: `docker compose ps` |
| `password authentication failed` | `.env` com credenciais erradas | Verificar `.env`, depois `down -v && up -d --build` |
| `CORS error` no browser | `CORS_ORIGINS` não inclui a URL | Adicionar a URL ao `.env` e restart api |

---

## Deploy em Produção

### Frontend → Vercel ou Netlify

1. **Crie o repositório no GitHub**

```bash
git init
git add .
git commit -m "feat: initial commit — Vellare Doces"
git remote add origin https://github.com/seu-usuario/vellare-doces.git
git push -u origin main
```

2. **Configure na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Import o repositório
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Other`
   - **Build Command**: (vazio — são arquivos estáticos)
   - **Output Directory**: `.` (raiz do frontend)

3. **Configuração crítica**: No frontend em produção, o proxy `/api/` do Nginx NÃO existe.
   Você deve criar um arquivo `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://seu-backend.onrender.com/api/$1" }
  ]
}
```

### Backend + DB → Render

1. **Crie um PostgreSQL no Render**
   - Acesse [render.com](https://render.com) → New → PostgreSQL
   - Anote a **Internal Database URL**

2. **Deploy do Backend**
   - New → Web Service → Connect seu repo GitHub
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Environment Variables**:
     - `DATABASE_URL`: (cole a URL do PostgreSQL do Render)
     - `CORS_ORIGINS`: `https://seu-app.vercel.app`
     - `ADMIN_KEY`: (sua chave secreta de produção)

3. **CORS em Produção**: Atualize `CORS_ORIGINS` no Render para incluir a URL exata do seu frontend na Vercel:
   ```
   CORS_ORIGINS=https://vellare-doces.vercel.app
   ```

### Alternativa: Railway

1. **Crie o projeto** no [railway.app](https://railway.app)
2. **Adicione um PostgreSQL** (plugin nativo)
3. **Deploy do backend**: Conecte o repo GitHub, selecione `backend/` como root
4. Railway injeta `DATABASE_URL` automaticamente via plugin

### Resumo do roteamento CORS em cloud

```
┌────────────────────────┐        CORS: Allow-Origin
│  Vercel/Netlify        │◄───────────────────────────────┐
│  https://vellare.app   │                                │
│  (frontend estático)   │───── /api/* rewrite ──────────▶│
└────────────────────────┘                                │
                                                          │
                              ┌────────────────────────┐  │
                              │  Render/Railway         │──┘
                              │  https://api.vellare.   │
                              │  (FastAPI + PostgreSQL) │
                              └────────────────────────┘
```

**Pontos críticos:**
1. O `CORS_ORIGINS` no backend **DEVE** conter a URL exata do frontend (com `https://`)
2. O `expose_headers` já inclui `Content-Disposition` para download de PDF/CSV
3. Em produção, use `ADMIN_KEY` forte e diferente do valor de desenvolvimento

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | HTML5 + CSS3 + Vanilla JS | ES2022 |
| Servidor Web | Nginx | 1.25 Alpine |
| Backend | Python + FastAPI | 3.12 / 0.115 |
| ORM | SQLAlchemy | 2.0 |
| Validação | Pydantic | 2.10 |
| Banco de Dados | PostgreSQL | 16 Alpine |
| PDF | ReportLab | 4.2 |
| Container Runtime | Docker + Compose | v2 |
| Fontes | Google Fonts | Playfair Display + Inter |

---

## Licença

Projeto desenvolvido para uso interno da confeitaria **Vellare Doces**.
