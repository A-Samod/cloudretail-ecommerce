const request = require('supertest');

describe('Payment Service API', () => {
  let app;
  let server;

  beforeAll(() => {
    // Mock EventBridge to avoid network errors
    jest.mock('../src/utils/eventBridge', () => ({
      publishEvent: jest.fn().mockResolvedValue(true),
    }));
    
    app = require('../src/index');
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'payment-service');
    });
  });

  describe('GET /api/payments', () => {
    it('should get all payments with pagination', async () => {
      const response = await request(app).get('/api/payments?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should return 404 for non-existent payment', async () => {
      const response = await request(app).get('/api/payments/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
