const request = require('supertest');
const express = require('express');
const swaggerUi = require('swagger-ui-express');

// Mock swagger spec
const mockSwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Catalog Service API',
    version: '1.0.0',
  },
  paths: {
    '/api/products': {
      get: {
        summary: 'Get all products',
      },
    },
  },
};

// Mock app setup
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mockSwaggerSpec));

describe('Swagger Documentation', () => {
  test('GET /api-docs - should return Swagger UI HTML', async () => {
    const response = await request(app).get('/api-docs/');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
  });

  test('Swagger spec should have required properties', () => {
    expect(mockSwaggerSpec).toHaveProperty('openapi');
    expect(mockSwaggerSpec).toHaveProperty('info');
    expect(mockSwaggerSpec).toHaveProperty('paths');
    expect(mockSwaggerSpec.info).toHaveProperty('title');
    expect(mockSwaggerSpec.info).toHaveProperty('version');
  });
});
