const { CategoryModel } = require('../models');
const logger = require('../config/logger');

const categoryController = {
  // Obtener todas las categorías del usuario
  async getCategories(req, res) {
    try {
      const categories = await CategoryModel.getCategoriesByUserId(req.user.uid);
      res.json(categories);
    } catch (error) {
      logger.error('Error getting categories', { error, userId: req.user.uid });
      res.status(500).json({ error: 'Error getting categories' });
    }
  },

  // Obtener una categoría específica
  async getCategory(req, res) {
    try {
      const category = await CategoryModel.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      if (category.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      res.json(category);
    } catch (error) {
      logger.error('Error getting category', { error, categoryId: req.params.id });
      res.status(500).json({ error: 'Error getting category' });
    }
  },

  // Crear una nueva categoría
  async createCategory(req, res) {
    try {
      const categoryData = {
        ...req.body,
        userId: req.user.uid
      };
      const category = await CategoryModel.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      logger.error('Error creating category', { error, data: req.body });
      res.status(500).json({ error: 'Error creating category' });
    }
  },

  // Actualizar una categoría
  async updateCategory(req, res) {
    try {
      const category = await CategoryModel.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      if (category.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedCategory = await CategoryModel.updateCategory(req.params.id, req.body);
      res.json(updatedCategory);
    } catch (error) {
      logger.error('Error updating category', { error, categoryId: req.params.id });
      res.status(500).json({ error: 'Error updating category' });
    }
  },

  // Eliminar una categoría
  async deleteCategory(req, res) {
    try {
      const category = await CategoryModel.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      if (category.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await CategoryModel.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting category', { error, categoryId: req.params.id });
      res.status(500).json({ error: 'Error deleting category' });
    }
  }
};

module.exports = categoryController;
