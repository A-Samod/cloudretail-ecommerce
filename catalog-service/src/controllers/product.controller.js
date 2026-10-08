const productService = require('../services/product.service');
const { uploadFile } = require('../config/s3');
const logger = require('../utils/logger');

class ProductController {
  /**
   * @desc Create a new product
   * @route POST /api/products
   * @access Private (Admin)
   */
  async createProduct(req, res, next) {
    try {
      const { name, description, price, category, brand, sku, tags, isFeatured } = req.body;

      // Check if SKU already exists
      const existingProduct = await productService.getProductBySku(sku);
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'Product with this SKU already exists',
        });
      }

      let images = [];

      // Handle image uploads
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const key = `products/${sku}/${Date.now()}-${file.originalname}`;
          const imageUrl = await uploadFile(file, key);
          images.push(imageUrl);
        }
      }

      const product = await productService.createProduct({
        name,
        description,
        price: parseFloat(price),
        category,
        brand,
        sku,
        images: images.length > 0 ? JSON.stringify(images) : null,
        tags,
        isFeatured: isFeatured === 'true',
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          ...product,
          images: product.images ? JSON.parse(product.images) : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get all products
   * @route GET /api/products
   * @access Public
   */
  async getAllProducts(req, res, next) {
    try {
      const filters = req.query;
      const result = await productService.getAllProducts(filters);

      // Parse images JSON for each product
      const productsWithImages = result.products.map((product) => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
      }));

      res.json({
        success: true,
        data: productsWithImages,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get product by ID
   * @route GET /api/products/:id
   * @access Public
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: {
          ...product,
          images: product.images ? JSON.parse(product.images) : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get featured products
   * @route GET /api/products/featured
   * @access Public
   */
  async getFeaturedProducts(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const products = await productService.getFeaturedProducts(limit);

      const productsWithImages = products.map((product) => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
      }));

      res.json({
        success: true,
        data: productsWithImages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Update product
   * @route PUT /api/products/:id
   * @access Private (Admin)
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      if (updateData.isFeatured) {
        updateData.isFeatured = updateData.isFeatured === 'true';
      }

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        const product = await productService.getProductById(id);
        const existingImages = product.images ? JSON.parse(product.images) : [];

        for (const file of req.files) {
          const key = `products/${product.sku}/${Date.now()}-${file.originalname}`;
          const imageUrl = await uploadFile(file, key);
          existingImages.push(imageUrl);
        }

        updateData.images = JSON.stringify(existingImages);
      }

      const updatedProduct = await productService.updateProduct(id, updateData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: {
          ...updatedProduct,
          images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Delete product
   * @route DELETE /api/products/:id
   * @access Private (Admin)
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
