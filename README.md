# CloudRetail

Cloud-native e-commerce platform built as a microservices monorepo. A React storefront talks to Express APIs (database-per-service with Prisma/MySQL), with AWS Cognito for auth and SQS/Lambda workers for post-payment email and inventory confirmation.

## Features

- Cognito sign-up / sign-in with JWT-protected APIs
- Product catalog with categories, search/filters, and S3 image upload
- Redis-backed catalog caching
- Inventory reserve / release / confirm-sale with low-stock alerts
- Order lifecycle with cross-service orchestration
- Mock payments, refunds, and async confirmation emails (SES)
- Role-based access (`CUSTOMER`, `ADMIN`, `SUPPORT`)
- Per-service Swagger docs and health checks

## Architecture

```
┌─────────────────────┐
│  React Frontend     │  :3000  (AWS Amplify → Cognito)
│  (customer-web)     │
└─────────┬───────────┘
          │ HTTP (direct service URLs)
    ┌─────┴─────┬─────────┬─────────┬─────────┐
    ▼           ▼         ▼         ▼         ▼
 User:3001  Catalog:3002 Inv:3003 Order:3004 Pay:3005
    │           │         │         │         │
 MySQL       MySQL+S3  MySQL     MySQL     MySQL
             +Redis              │         │
                                 │    SQS / EventBridge
                                 │         │
                    ┌────────────┴─────────┴────────────┐
                    ▼                                   ▼
             email-lambda (SES)              inventory-lambda
                                                    │
                                                    ▼
                                            inventory-service
                                            (confirm-sale)
```

| Concern | Approach |
|---------|----------|
| Data | Database per service (MySQL + Prisma) |
| Auth | Cognito JWTs (Amplify UI + JWKS validation in user-service) |
| Sync | Order service calls catalog, inventory, payment, and user over HTTP |
| Async | Payment success → SQS → Lambdas; EventBridge bus `ecommerce-events` |
| Local AWS | LocalStack at `http://localhost:4566` |

## Services

| Service | Path | Port | Role |
|---------|------|------|------|
| Frontend (`customer-web`) | `frontend/` | 3000 | Storefront: auth, browse, cart, checkout, orders, profile |
| User Service | `user-service/` | 3001 | Profiles, Cognito JWT auth, RBAC |
| Catalog Service | `catalog-service/` | 3002 | Products & categories, S3 images, Redis cache |
| Inventory Service | `inventory-service/` | 3003 | Stock, reserve/release/confirm-sale, low-stock events |
| Order Service | `order-service/` | 3004 | Orders; orchestrates catalog, inventory, payment |
| Payment Service | `payment-service/` | 3005 | Mock payments/refunds; publishes SQS & EventBridge events |
| Email Lambda | `email-lambda/` | — | On `payment.succeeded` → SES confirmation email |
| Inventory Lambda | `inventory-lambda/` | — | On `payment.succeeded` → inventory confirm-sale |

**Infra ports:** MySQL `3306` · Redis `6379` · LocalStack `4566`

**API docs / health:** `http://localhost:<port>/api-docs` · `GET /health`

| Service | Database |
|---------|----------|
| user-service | `user_db` |
| catalog-service | `catalog_db` |
| inventory-service | `inventory_db` |
| order-service | `order_db` |
| payment-service | `payment_db` |

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, CRA, Ant Design, AWS Amplify UI, Axios, React Router v6 |
| APIs | Node.js 18, Express, Prisma, Helmet, Winston, Swagger, Jest |
| Data | MySQL, Redis (catalog) |
| AWS | Cognito, S3, SQS, EventBridge, SES, Lambda |
| Local | LocalStack; Dockerfiles for each API service |

## Repository layout

```
├── frontend/              # React customer web
├── user-service/          # Auth & profiles
├── catalog-service/       # Products & categories
├── inventory-service/     # Stock management
├── order-service/         # Orders & orchestration
├── payment-service/       # Mock payments + event publish
├── email-lambda/          # Order confirmation (SES)
└── inventory-lambda/      # Post-payment inventory confirm
```

Each app has its own `package.json` and `.env.example`. API services also have Prisma schemas, Dockerfiles, and service-level READMEs.

## Prerequisites

- Node.js 18+ and npm
- MySQL with `user_db`, `catalog_db`, `inventory_db`, `order_db`, `payment_db`
- Redis (optional — set `DISABLE_REDIS=true` in catalog-service to skip)
- LocalStack or AWS (Cognito, S3, SQS, EventBridge, SES)
- Cognito User Pool + App Client for the frontend

## Quick start

### 1. Configure environment

```bash
cp frontend/.env.example frontend/.env
cp user-service/.env.example user-service/.env
cp catalog-service/.env.example catalog-service/.env
cp inventory-service/.env.example inventory-service/.env
cp order-service/.env.example order-service/.env
cp payment-service/.env.example payment-service/.env
```

Set Cognito IDs, each service’s `DATABASE_URL`, and AWS/LocalStack values. See each `.env.example` for the full list.

**Payment service queues** (used after successful payment): `EMAIL_QUEUE_URL`, `INVENTORY_QUEUE_URL` (or legacy `SQS_QUEUE_URL`).

**Frontend service URLs** (optional overrides): `REACT_APP_USER_SERVICE_URL`, `REACT_APP_CATALOG_SERVICE_URL`, `REACT_APP_INVENTORY_SERVICE_URL`, `REACT_APP_ORDER_SERVICE_URL`, `REACT_APP_PAYMENT_SERVICE_URL`.

### 2. Start API services

Recommended order: **user → catalog → inventory → payment → order**.

In each service directory:

```bash
npm install
npm run prisma:generate
npm run migrate
npm run dev
```

| Service | Command directory | URL |
|---------|-------------------|-----|
| User | `user-service/` | http://localhost:3001 |
| Catalog | `catalog-service/` | http://localhost:3002 |
| Inventory | `inventory-service/` | http://localhost:3003 |
| Order | `order-service/` | http://localhost:3004 |
| Payment | `payment-service/` | http://localhost:3005 |

### 3. Start the frontend

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). Production build: `npm run build`.

### 4. Deploy Lambdas

Wire `email-lambda` and `inventory-lambda` to AWS Lambda with SQS triggers from the payment queues.

| Lambda | Env vars |
|--------|----------|
| `email-lambda` | `AWS_REGION`, `SENDER_EMAIL` |
| `inventory-lambda` | `INVENTORY_SERVICE_URL` |

## Purchase flow

1. Sign in with Cognito (frontend).
2. Browse catalog; stock comes from inventory-service.
3. Checkout → order-service validates catalog/stock, reserves inventory, calls payment-service.
4. On payment success:
   - Order status updates
   - SQS → email-lambda (SES) and inventory-lambda (confirm-sale)
   - Domain events on EventBridge (`ecommerce-events`)

## Docker

API services ship with `Dockerfile` (`node:18-alpine`: install → `prisma generate` → `prisma migrate deploy` → `npm start`).

```bash
docker build -t cloudretail-user-service ./user-service
docker run --env-file user-service/.env -p 3001:3001 cloudretail-user-service
```

MySQL, Redis, and LocalStack are run separately (no root Compose file in this repo).

## Testing

From any API service directory:

```bash
npm test
```

Inventory suite notes: `inventory-service/tests/README.md`.

## Further reading

| Path | Contents |
|------|----------|
| `frontend/README.md` | Storefront setup & shopping flow |
| `user-service/README.md` | Endpoints, schema, Swagger |
| `catalog-service/README.md` | Product & category APIs |
| `inventory-service/README.md` | Inventory APIs |
| `order-service/README.md` | Order flow & APIs |
| `payment-service/README.md` | Mock payment behavior & samples |
