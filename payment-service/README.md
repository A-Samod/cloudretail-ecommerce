# Payment Service

Mock payment processing service with 90% success rate for academic demonstration.

## Features
- Mock payment processing (no real gateway integration)
- Random success/failure simulation (configurable rate)
- Payment status tracking (PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED)
- Event-driven notifications via EventBridge
- Payment history and refund support

## Mock Payment Logic
- 90% success rate (configurable via PAYMENT_SUCCESS_RATE env)
- 1-second processing delay simulation
- Random failure reasons (Insufficient funds, Card declined, etc.)
- Transaction ID generation for successful payments

## API Endpoints
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get all payments (Admin)
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/order/:orderId` - Get payment by order
- `GET /api/payments/user/:userId` - Get user's payments
- `POST /api/payments/:id/refund` - Refund payment

## Payment Flow
1. Receive payment request with orderId, userId, amount
2. Create payment record with PROCESSING status
3. Simulate 1-second delay
4. Random success/failure based on configured rate
5. Update payment status (SUCCESS/FAILED)
6. Publish event (payment.succeeded / payment.failed)
7. Return payment result to caller

## Setup
```bash
npm install
npm run prisma:generate
npm run migrate
npm run dev
```

## Testing Payment
```bash
# Process payment
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "userId": "USER_ID",
    "amount": 999.99,
    "paymentMethod": "credit_card"
  }'
```

## Response Examples

**Success (200):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": "...",
    "paymentNumber": "PAY-1234...",
    "status": "SUCCESS",
    "transactionId": "TXN-5678...",
    "amount": "999.99"
  }
}
```

**Failure (402):**
```json
{
  "success": false,
  "message": "Payment failed",
  "data": {
    "id": "...",
    "paymentNumber": "PAY-1234...",
    "status": "FAILED",
    "failureReason": "Insufficient funds",
    "amount": "999.99"
  }
}
```
