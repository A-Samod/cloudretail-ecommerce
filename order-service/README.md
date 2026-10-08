# Order Service

Order management microservice with inventory reservation, payment integration, and event-driven status updates.

## Features
- Order creation with product validation
- Inventory reservation on order placement
- Order status tracking (PENDING_PAYMENT, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, FAILED)
- Integration with Catalog, Inventory, and Payment services
- Event-driven architecture with EventBridge

## API Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `GET /api/orders/user/:userId` - Get user's orders
- `PUT /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/cancel` - Cancel order

## Order Flow
1. Customer places order → Status: PENDING_PAYMENT
2. Inventory reserved for order items
3. Payment processed → Status: PAID or FAILED
4. If PAID: Stock confirmed, order moves to PROCESSING
5. If FAILED: Stock released, order marked as FAILED

## Setup
```bash
npm install
npm run prisma:generate
npm run migrate
npm run dev
```
