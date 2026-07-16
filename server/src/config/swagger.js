import swaggerJSDoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Tùng Việt API',
    version: '1.0.0',
    description: 'API backend cho website Tùng Việt (nhựa thông).',
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 5000}`, description: 'Local' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {},
        },
      },
      Paginated: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: {} },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              pages: { type: 'integer' },
            },
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          nameEn: { type: 'string' },
          description: { type: 'string' },
          descriptionEn: { type: 'string' },
          imageUrl: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          nameEn: { type: 'string' },
          description: { type: 'string' },
          descriptionEn: { type: 'string' },
          imageUrl: { type: 'string' },
          softeningPoint: { type: 'string' },
          acidValue: { type: 'string' },
          color: { type: 'string' },
          benefits: { type: 'array', items: { type: 'string' } },
          applications: { type: 'array', items: { type: 'string' } },
          tdsUrl: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Market: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          titleEn: { type: 'string' },
          imageUrl: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' } },
          applicationCategoryId: { $ref: '#/components/schemas/Category' },
          selectedProducts: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          userName: { type: 'string' },
          userEmail: { type: 'string' },
          userPhone: { type: 'string' },
          userAddress: { type: 'string' },
          totalAmount: { type: 'number' },
          status: { type: 'string', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
          note: { type: 'string' },
        },
      },
      Estimate: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          stt: { type: 'integer' },
          feature: { type: 'string' },
          requirement: { type: 'string' },
          description: { type: 'string' },
          complexity: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          estimatedHours: { type: 'number' },
          estimatedDays: { type: 'number' },
          hourlyRate: { type: 'number' },
          totalCost: { type: 'number' },
          notes: { type: 'string' },
          product: { type: 'string' },
        },
      },
      Auth: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['user', 'admin'] },
                },
              },
              token: { type: 'string' },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth' },
    { name: 'Public' },
    { name: 'Client' },
    { name: 'Admin - Products' },
    { name: 'Admin - Categories' },
    { name: 'Admin - Markets' },
    { name: 'Admin - Orders' },
    { name: 'Admin - Upload' },
    { name: 'Estimates' },
  ],
  paths: {},
};

const options = {
  definition,
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerDefinition = definition;
