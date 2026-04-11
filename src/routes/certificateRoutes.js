const express = require('express');
const { body, validationResult } = require('express-validator');
const CertificateGenerator = require('../services/certificateGenerator');

const router = express.Router();
const certificateGenerator = new CertificateGenerator();

/**
 * Validation middleware for certificate generation
 */
const validateCertificateRequest = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO 8601 format (YYYY-MM-DD)'),
  
  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Purpose must be between 5 and 500 characters')
];

/**
 * POST /generate-certificate
 * Generate an IBM Distribution Sector certificate
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "date": "2026-04-11",
 *   "purpose": "Completion of Advanced Node.js Course"
 * }
 * 
 * Response: PNG image (image/png)
 */
router.post('/generate-certificate', validateCertificateRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input parameters',
          details: errors.array().map(err => err.msg)
        }
      });
    }

    const { name, date, purpose } = req.body;

    // Generate certificate
    const imageBuffer = await certificateGenerator.generate({
      name,
      date,
      purpose
    });

    // Set response headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Content-Disposition': `attachment; filename="certificate-${Date.now()}.png"`
    });

    // Send image
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      error: {
        code: 'GENERATION_ERROR',
        message: 'Failed to generate certificate',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'IBM Certificate Generator API'
  });
});

/**
 * GET /api-docs
 * API documentation endpoint
 */
router.get('/api-docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'IBM Certificate Generator API',
      version: '1.0.0',
      description: 'REST API for generating IBM Distribution Sector certificates',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: req.protocol + '://' + req.get('host'),
        description: 'Current server'
      }
    ],
    paths: {
      '/generate-certificate': {
        post: {
          summary: 'Generate a certificate',
          description: 'Generates an IBM Distribution Sector certificate PNG image',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'date', 'purpose'],
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Recipient full name',
                      example: 'John Doe',
                      minLength: 2,
                      maxLength: 100
                    },
                    date: {
                      type: 'string',
                      format: 'date',
                      description: 'Certificate date in ISO 8601 format (YYYY-MM-DD)',
                      example: '2026-04-11'
                    },
                    purpose: {
                      type: 'string',
                      description: 'Purpose or achievement description',
                      example: 'Completion of Advanced Node.js Course',
                      minLength: 5,
                      maxLength: 500
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Certificate generated successfully',
              content: {
                'image/png': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'object',
                        properties: {
                          code: { type: 'string', example: 'VALIDATION_ERROR' },
                          message: { type: 'string', example: 'Invalid input parameters' },
                          details: {
                            type: 'array',
                            items: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'object',
                        properties: {
                          code: { type: 'string', example: 'GENERATION_ERROR' },
                          message: { type: 'string', example: 'Failed to generate certificate' },
                          details: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Check if the API is running',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                      version: { type: 'string', example: '1.0.0' },
                      service: { type: 'string', example: 'IBM Certificate Generator API' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api-docs': {
        get: {
          summary: 'API documentation',
          description: 'Get OpenAPI specification',
          responses: {
            '200': {
              description: 'OpenAPI specification',
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});

module.exports = router;

// Made with Bob
