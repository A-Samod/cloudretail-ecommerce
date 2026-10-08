const swaggerJsdoc = require('swagger-jsdoc');
module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'Order Service API', 
      version: '1.0.0',
      description: 'API for managing orders in the eCommerce platform'
    },
    servers: [{ url: 'http://localhost:3004' }],
    components: {
      schemas: {
        OrderItem: {
          type: 'object',
          required: ['productId', 'productSku', 'productName', 'quantity', 'price'],
          properties: {
            productId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
            productSku: { type: 'string', example: 'PROD-001' },
            productName: { type: 'string', example: 'Wireless Headphones' },
            quantity: { type: 'integer', minimum: 1, example: 2 },
            price: { type: 'number', format: 'decimal', example: 49.99 }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['userId', 'userEmail', 'items', 'shippingAddress'],
          properties: {
            userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            userEmail: { type: 'string', format: 'email', example: 'customer@example.com' },
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/OrderItem' }
            },
            shippingAddress: { 
              type: 'string', 
              example: '123 Main St, Apt 4B, New York, NY 10001, USA' 
            },
            billingAddress: { 
              type: 'string', 
              example: '123 Main St, Apt 4B, New York, NY 10001, USA' 
            },
            notes: { type: 'string', example: 'Please call before delivery' }
          }
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'],
              example: 'PAID'
            },
            paymentId: { type: 'string', example: 'pay_1234567890abcdef' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440099' },
            orderNumber: { type: 'string', example: 'ORD-20260201-001' },
            userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            userEmail: { type: 'string', example: 'customer@example.com' },
            status: { type: 'string', example: 'PENDING_PAYMENT' },
            totalAmount: { type: 'number', example: 99.98 },
            shippingAddress: { type: 'string', example: '123 Main St, Apt 4B, New York, NY 10001, USA' },
            billingAddress: { type: 'string', example: '123 Main St, Apt 4B, New York, NY 10001, USA' },
            paymentId: { type: 'string', example: 'pay_1234567890abcdef' },
            notes: { type: 'string', example: 'Please call before delivery' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-02-01T10:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-02-01T10:30:00Z' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440010' },
                  productId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                  productSku: { type: 'string', example: 'PROD-001' },
                  productName: { type: 'string', example: 'Wireless Headphones' },
                  quantity: { type: 'integer', example: 2 },
                  price: { type: 'number', example: 49.99 },
                  subtotal: { type: 'number', example: 99.98 }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        },
        PaginatedOrdersResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Order' }
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 100 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 10 }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'],
});
