// Esquemas de datos para Firestore

const userSchema = {
  uid: String,          // ID de Firebase Auth
  email: String,
  name: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean
};

const categorySchema = {
  id: String,
  name: String,
  description: String,
  userId: String,       // Referencia al usuario que la creó
  createdAt: Date,
  updatedAt: Date
};

const urlSchema = {
  id: String,
  url: String,
  categoryId: String,   // Referencia a la categoría
  userId: String,       // Referencia al usuario que la agregó
  status: String,       // pending, processed, failed
  lastProcessed: Date,
  formSelector: String, // Selector CSS del formulario
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    title: String,
    description: String
  }
};

const templateSchema = {
  id: String,
  name: String,
  description: String,
  userId: String,       // Referencia al usuario que lo creó
  fields: [{
    name: String,       // Nombre del campo
    selector: String,   // Selector CSS
    value: String,      // Valor o variable
    type: String        // text, email, tel, etc.
  }],
  createdAt: Date,
  updatedAt: Date
};

const campaignSchema = {
  id: String,
  name: String,
  description: String,
  userId: String,       // Referencia al usuario que la creó
  templateId: String,   // Referencia al template a usar
  urls: [{
    urlId: String,     // Referencia a la URL
    status: String,    // pending, success, error
    processedAt: Date,
    error: String
  }],
  status: String,       // draft, running, paused, completed
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  settings: {
    maxConcurrent: Number,  // Máximo de pestañas concurrentes
    delayBetweenSubmits: Number, // Delay en ms entre envíos
    captchaHandling: String // manual, 2captcha, none
  }
};

module.exports = {
  userSchema,
  categorySchema,
  urlSchema,
  templateSchema,
  campaignSchema
};
