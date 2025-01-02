const request = require('supertest');
const express = require('express');
const urlController = require('../../src/controllers/urlController');
const { UrlModel } = require('../../src/models');

// Mock del modelo
jest.mock('../../src/models', () => ({
  UrlModel: {
    getUrlsByCategory: jest.fn(),
    getUrlById: jest.fn(),
    createUrl: jest.fn(),
    updateUrl: jest.fn(),
    deleteUrl: jest.fn(),
    updateUrlStatus: jest.fn()
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
app.get('/urls', urlController.getUrls);
app.get('/urls/:id', urlController.getUrl);
app.post('/urls', urlController.createUrl);
app.put('/urls/:id', urlController.updateUrl);
app.delete('/urls/:id', urlController.deleteUrl);
app.put('/urls/:id/status', urlController.updateUrlStatus);

describe('URL Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /urls', () => {
    it('should return URLs for category', async () => {
      const mockUrls = [
        { id: '1', url: 'http://example1.com', categoryId: 'cat1', userId: 'test-user-id' },
        { id: '2', url: 'http://example2.com', categoryId: 'cat1', userId: 'test-user-id' }
      ];

      UrlModel.getUrlsByCategory.mockResolvedValue(mockUrls);

      const response = await request(app)
        .get('/urls')
        .query({ categoryId: 'cat1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUrls);
      expect(UrlModel.getUrlsByCategory).toHaveBeenCalledWith('cat1', 'test-user-id');
    });
  });

  describe('POST /urls', () => {
    it('should create a new URL', async () => {
      const newUrl = {
        url: 'http://example.com',
        categoryId: 'cat1'
      };

      const createdUrl = {
        id: '3',
        ...newUrl,
        userId: 'test-user-id',
        status: 'pending'
      };

      UrlModel.createUrl.mockResolvedValue(createdUrl);

      const response = await request(app)
        .post('/urls')
        .send(newUrl);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUrl);
      expect(UrlModel.createUrl).toHaveBeenCalledWith({
        ...newUrl,
        userId: 'test-user-id',
        status: 'pending'
      });
    });
  });

  // Más pruebas aquí...
});
