const paymentService = require('../services/payment.service');

class PaymentController {
  async processPayment(req, res, next) {
    try {
      const payment = await paymentService.processPayment(req.body);
      
      const statusCode = payment.status === 'SUCCESS' ? 200 : 402;
      
      res.status(statusCode).json({
        success: payment.status === 'SUCCESS',
        message: payment.status === 'SUCCESS' ? 'Payment processed successfully' : 'Payment failed',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentByOrderId(req, res, next) {
    try {
      const payment = await paymentService.getPaymentByOrderId(req.params.orderId);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async getAllPayments(req, res, next) {
    try {
      const result = await paymentService.getAllPayments(req.query);
      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPayments(req, res, next) {
    try {
      const result = await paymentService.getUserPayments(req.params.userId, req.query);
      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req, res, next) {
    try {
      const payment = await paymentService.refundPayment(req.params.id);
      res.json({
        success: true,
        message: 'Payment refunded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
