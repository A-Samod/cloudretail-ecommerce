const request = require('supertest');
const express = require('express');

// Mock app setup
const app = express();
app.use(express.json());

// Mock category data
const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic items' },
  { id: '2', name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion' },
];

// Mock routes
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: mockCategories,
  });
});

app.post('/api/categories', (req, res) => {
  const newCategory = {
    id: '3',
    ...req.body,
  };
  res.status(201).json({
    success: true,
    data: newCategory,
  });
});

describe('Category API', () => {
  test('GET /api/categories - should return all categories', async () => {
    const response = await request(app).get('/api/categories');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(2);
  });

  test('POST /api/categories - should create a new category', async () => {
    const newCategory = {
      name: 'Books',
      slug: 'books',
      description: 'Books and magazines',
    };

    const response = await request(app)
      .post('/api/categories')
      .send(newCategory);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', 'Books');
    expect(response.body.data).toHaveProperty('slug', 'books');
  });
});
