const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
 definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the NojeJs JWT application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
 },
 apis: ['./index.js', './APIData.js'], // Paths to the files containing your API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = {
 swaggerDocs,
 swaggerUi,
};
