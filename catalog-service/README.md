# Catalog Service

Product catalog management microservice with S3 image storage and Redis caching.

## Features

- Product CRUD operations
- Category management
- Image upload to S3
- Redis caching for performance
- Advanced product filtering and search
- Swagger API documentation

## API Endpoints

### Products
- `POST /api/products` - Create product (with image upload)
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Setup

```bash
npm install
npm run prisma:generate
npm run migrate
npm run dev
```

## API Documentation

http://localhost:3002/api-docs
