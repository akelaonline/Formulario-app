const request = require('supertest');
const express = require('express');
const categoryController = require('../../src/controllers/categoryController');
const { CategoryModel } = require('../../src/models');

// Mock del modelo
jest.mock('../../src/models', () => ({
  CategoryModel: {
    getCategoriesByUserId: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn()
  }
}));

// Configuración de la app Express para pruebas
const app = express();
app.use(express.json());

// Mock del middleware de autenticación
app.use((req, res, next) => {
  req.user = { uid: 'test-user-id' };
  next();
});

// Rutas para pruebas
app.get('/categories', categoryController.getCategories);
app.get('/categories/:id', categoryController.getCategory);
app.post('/categories', categoryController.createCategory);
app.put('/categories/:id', categoryController.updateCategory);
app.delete('/categories/:id', categoryController.deleteCategory);

describe('Category Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /categories', () => {
    it('should return all categories for user', async () => {
      const mockCategories = [
        { id: '1', name: 'Category 1', userId: 'test-user-id' },
        { id: '2', name: 'Category 2', userId: 'test-user-id' }
      ];

      CategoryModel.getCategoriesByUserId.mockResolvedValue(mockCategories);

      const response = await request(app).get('/categories');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategories);
      expect(CategoryModel.getCategoriesByUserId).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'New Category',
        description: 'Test description'
      };

      const createdCategory = {
        id: '3',
        ...newCategory,
        userId: 'test-user-id'
      };

      CategoryModel.createCategory.mockResolvedValue(createdCategory);

      const response = await request(app)
        .post('/categories')
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdCategory);
      expect(CategoryModel.createCategory).toHaveBeenCalledWith({
        ...newCategory,
        userId: 'test-user-id'
      });
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a specific category', async () => {
      const mockCategory = {
        id: '1',
        name: 'Category 1',
        userId: 'test-user-id'
      };

      CategoryModel.getCategoryById.mockResolvedValue(mockCategory);

      const response = await request(app).get('/categories/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategory);
      expect(CategoryModel.getCategoryById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if category not found', async () => {
      CategoryModel.getCategoryById.mockResolvedValue(null);

      const response = await request(app).get('/categories/999');

      expect(response.status).toBe(404);
    });
  });

  // Más pruebas aquí...
});
