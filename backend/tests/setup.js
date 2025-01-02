// Mock de Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com'
    })
  }),
  firestore: () => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }),
  FieldValue: {
    serverTimestamp: jest.fn()
  }
}));

// Configuración de variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
