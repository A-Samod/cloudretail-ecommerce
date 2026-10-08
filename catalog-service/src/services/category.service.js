const prisma = require('../config/database');
const logger = require('../utils/logger');

class CategoryService {
  async createCategory(categoryData) {
    try {
      const category = await prisma.category.create({
        data: categoryData,
      });
      logger.info(`Category created: ${category.id}`);
      return category;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      return await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      return await prisma.category.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Error fetching category:', error);
      throw error;
    }
  }

  async updateCategory(id, updateData) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: updateData,
      });
      logger.info(`Category updated: ${category.id}`);
      return category;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      await prisma.category.delete({
        where: { id },
      });
      logger.info(`Category deleted: ${id}`);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }
}

module.exports = new CategoryService();
