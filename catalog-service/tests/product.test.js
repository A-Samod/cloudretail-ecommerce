const request = require('supertest');
const express = require('express');

// Mock app setup
const app = express();
app.use(express.json());

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15',
    description: 'Latest iPhone model',
    price: 999.99,
    sku: 'IPH-15-001',
    category: 'Electronics',
    brand: 'Apple',
    stock: 50,
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    description: 'Samsung flagship phone',
    price: 899.99,
    sku: 'SAM-S24-001',
    category: 'Electronics',
    brand: 'Samsung',
    stock: 30,
  },
];

// Mock routes
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: mockProducts,
    total: mockProducts.length,
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (product) {
    res.json({
      success: true,
      data: product,
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: '3',
    ...req.body,
  };
  res.status(201).json({
    success: true,
    data: newProduct,
  });
});

describe('Product API', () => {
  test('GET /api/products - should return all products', async () => {
    const response = await request(app).get('/api/products');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(2);
    expect(response.body).toHaveProperty('total', 2);
  });

  test('GET /api/products/:id - should return a specific product', async () => {
    const response = await request(app).get('/api/products/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', 'iPhone 15');
    expect(response.body.data).toHaveProperty('price', 999.99);
  });

  test('GET /api/products/:id - should return 404 for non-existent product', async () => {
    const response = await request(app).get('/api/products/999');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Product not found');
  });

  test('POST /api/products - should create a new product', async () => {
    const newProduct = {
      name: 'MacBook Pro',
      description: 'High-performance laptop',
      price: 2499.99,
      sku: 'MBP-16-001',
      category: 'Electronics',
      brand: 'Apple',
      stock: 20,
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', 'MacBook Pro');
    expect(response.body.data).toHaveProperty('price', 2499.99);
  });
});
