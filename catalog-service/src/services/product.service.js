const prisma = require('../config/database');
const logger = require('../utils/logger');
const { getCache, setCache, clearCachePattern } = require('../config/redis');

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData) {
    try {
      const product = await prisma.product.create({
        data: productData,
      });
      logger.info(`Product created: ${product.id}`);
      
      // Clear products cache
      await clearCachePattern('products:*');
      
      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Get all products with filtering and pagination
   */
  async getAllProducts(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        minPrice,
        maxPrice,
        isActive = true,
        isFeatured,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      const cacheKey = `products:${JSON.stringify(filters)}`;
      
      // Check cache
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        logger.info('Products fetched from cache');
        return cachedData;
      }

      const skip = (page - 1) * limit;
      const where = {};

      if (category) where.category = category;
      if (isActive !== undefined) {
        where.isActive = typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
      }
      if (isFeatured !== undefined) {
        where.isFeatured = typeof isFeatured === 'string' ? isFeatured === 'true' : Boolean(isFeatured);
      }

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ];
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.product.count({ where }),
      ]);

      const result = {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };

      // Cache result
      await setCache(cacheKey, result, 3600);

      return result;
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    try {
      const cacheKey = `product:${id}`;
      
      // Check cache
      const cachedProduct = await getCache(cacheKey);
      if (cachedProduct) {
        return cachedProduct;
      }

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (product) {
        await setCache(cacheKey, product, 3600);
      }

      return product;
    } catch (error) {
      logger.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku) {
    try {
      return await prisma.product.findUnique({
        where: { sku },
      });
    } catch (error) {
      logger.error('Error fetching product by SKU:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(id, updateData) {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      logger.info(`Product updated: ${product.id}`);
      
      // Clear cache
      await clearCachePattern('products:*');
      await clearCachePattern(`product:${id}`);
      
      return product;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id) {
    try {
      await prisma.product.delete({
        where: { id },
      });
      logger.info(`Product deleted: ${id}`);
      
      // Clear cache
      await clearCachePattern('products:*');
      await clearCachePattern(`product:${id}`);
      
      return { message: 'Product deleted successfully' };
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10) {
    try {
      const cacheKey = `products:featured:${limit}`;
      
      const cachedProducts = await getCache(cacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }

      const products = await prisma.product.findMany({
        where: {
          isFeatured: true,
          isActive: true,
        },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      });

      await setCache(cacheKey, products, 3600);

      return products;
    } catch (error) {
      logger.error('Error fetching featured products:', error);
      throw error;
    }
  }
}

module.exports = new ProductService();
