const request = require('supertest');
const express = require('express');

// Mock the app setup similar to index.js
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'catalog-service',
    timestamp: new Date().toISOString(),
  });
});

describe('Health Check API', () => {
  test('GET /health - should return healthy status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'catalog-service');
    expect(response.body).toHaveProperty('timestamp');
  });
});
