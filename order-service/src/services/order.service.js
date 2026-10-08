const prisma = require('../config/database');
const logger = require('../utils/logger');
const { publishEvent } = require('../utils/eventBridge');
const axios = require('axios');

class OrderService {
  async createOrder(orderData) {
    try {
      const { userId, userEmail, items, shippingAddress, billingAddress, notes } = orderData;

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Validate products and calculate total
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        // Fetch product details from catalog service
        const productResponse = await axios.get(
          `${process.env.CATALOG_SERVICE_URL}/api/products/${item.productId}`
        );
        const product = productResponse.data.data;

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Check inventory availability
        const inventoryResponse = await axios.get(
          `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${item.productId}`
        );
        const inventory = inventoryResponse.data.data;

        if (!inventory || inventory.availableQty < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const subtotal = parseFloat(product.price) * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productSku: product.sku,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          subtotal,
        });
      }

      // Create order with items
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          userEmail,
          status: 'PENDING_PAYMENT',
          totalAmount,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress),
          notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Reserve inventory for each item
      for (const item of orderItems) {
        try {
          await axios.post(
            `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${item.productId}/reserve`,
            {
              quantity: item.quantity,
              orderId: order.id,
            }
          );
        } catch (error) {
          logger.error(`Failed to reserve inventory for ${item.productId}:`, error.message);
          // Rollback: cancel order and release any reserved stock
          await this.cancelOrder(order.id);
          throw new Error('Failed to reserve inventory. Order cancelled.');
        }
      }

      // Publish OrderCreated event (optional - continue even if fails)
      try {
        await publishEvent('order.created', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          userEmail: order.userEmail,
          totalAmount: parseFloat(order.totalAmount),
          items: orderItems,
        });
      } catch (eventError) {
        logger.warn('Failed to publish order.created event:', eventError.message);
      }

      logger.info(`Order created: ${order.orderNumber}`);
      return order;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      
      if (!order) return null;
      
      // Parse JSON strings back to objects
      return {
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
      };
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrderByNumber(orderNumber) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      });
      
      if (!order) return null;
      
      // Parse JSON strings back to objects
      return {
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
      };
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error;
    }
  }

  async getUserOrders(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, status } = filters;
      const skip = (page - 1) * limit;
      const where = { userId };

      if (status) where.status = status;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { items: true },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
      ]);

      // Parse JSON strings back to objects
      const parsedOrders = orders.map(order => ({
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
      }));

      return {
        orders: parsedOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async getAllOrders(filters = {}) {
    try {
      const { page = 1, limit = 20, status, userId } = filters;
      const skip = (page - 1) * limit;
      const where = {};

      if (status) where.status = status;
      if (userId) where.userId = userId;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { items: true },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
      ]);

      // Parse JSON strings back to objects
      const parsedOrders = orders.map(order => ({
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
      }));

      return {
        orders: parsedOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching all orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(id, status, paymentId = null) {
    try {
      const updateData = { status };
      if (paymentId) updateData.paymentId = paymentId;

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: { items: true },
      });

      logger.info(`Order ${order.orderNumber} status updated to ${status}`);

      // Publish event based on status (optional - continue even if fails)
      try {
        if (status === 'PAID') {
          await publishEvent('order.paid', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            userEmail: order.userEmail,
            totalAmount: parseFloat(order.totalAmount),
            items: order.items,
          });
        } else if (status === 'FAILED') {
          await publishEvent('order.failed', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            userEmail: order.userEmail,
            items: order.items,
          });
        }
      } catch (eventError) {
        logger.warn('Failed to publish order status event:', eventError.message);
      }

      return order;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  async cancelOrder(id) {
    try {
      const order = await this.getOrderById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!['PENDING_PAYMENT', 'PAID'].includes(order.status)) {
        throw new Error('Order cannot be cancelled');
      }

      // Release reserved inventory
      for (const item of order.items) {
        try {
          await axios.post(
            `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${item.productId}/release`,
            {
              quantity: item.quantity,
              orderId: order.id,
            }
          );
        } catch (error) {
          logger.error(`Failed to release inventory for ${item.productId}:`, error.message);
        }
      }

      const cancelledOrder = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });

      // Publish event (optional - continue even if fails)
      try {
        await publishEvent('order.cancelled', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
        });
      } catch (eventError) {
        logger.warn('Failed to publish order.cancelled event:', eventError.message);
      }

      logger.info(`Order cancelled: ${order.orderNumber}`);
      return cancelledOrder;
    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  async handlePaymentSuccess(paymentData) {
    try {
      const { orderId, paymentId } = paymentData;
      await this.updateOrderStatus(orderId, 'PAID', paymentId);
      logger.info(`Payment successful for order: ${orderId}`);
    } catch (error) {
      logger.error('Error handling payment success:', error);
    }
  }

  async handlePaymentFailure(paymentData) {
    try {
      const { orderId } = paymentData;
      const order = await this.getOrderById(orderId);

      // Release reserved inventory
      for (const item of order.items) {
        await axios.post(
          `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${item.productId}/release`,
          {
            quantity: item.quantity,
            orderId: order.id,
          }
        );
      }

      await this.updateOrderStatus(orderId, 'FAILED');
      logger.info(`Payment failed for order: ${orderId}`);
    } catch (error) {
      logger.error('Error handling payment failure:', error);
    }
  }
}

module.exports = new OrderService();
