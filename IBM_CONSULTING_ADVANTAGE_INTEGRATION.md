# IBM Consulting Advantage Integration Guide

Complete guide for integrating the Certificate Generator API with IBM Consulting Advantage (ICA) platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [ICA Agent Implementation](#ica-agent-implementation)
- [Workflow Integration](#workflow-integration)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This integration enables IBM Consulting Advantage to automatically generate professional certificates for training completions, achievements, and recognitions using the Certificate Generator API.

### Key Features

- **Automated Certificate Generation**: Generate certificates directly from ICA workflows
- **Validation**: Built-in input validation before API calls
- **Error Handling**: Comprehensive error handling and retry logic
- **Storage Integration**: Save certificates to ICA storage
- **Notification Support**: Send certificates via email or notifications
- **Batch Processing**: Generate multiple certificates in bulk

## 📦 Prerequisites

### API Requirements

- Certificate Generator API deployed and accessible
- API endpoint URL (e.g., `https://your-api.onrender.com`)
- Network connectivity from ICA to the API

### ICA Requirements

- IBM Consulting Advantage account with agent creation permissions
- Access to workflow builder
- Storage configuration for certificate files
- (Optional) Email/notification service configured

## 🚀 Quick Start

### Step 1: Deploy the Certificate API

If not already deployed, follow the deployment guide:

```bash
# Clone the repository
git clone https://github.com/sudroych/Certificate-generator-api.git
cd Certificate-generator-api

# Install dependencies
npm install

# Deploy to Render or your preferred platform
# See DEPLOYMENT.md for detailed instructions
```

### Step 2: Get Your API Endpoint

After deployment, note your API endpoint:
```
https://your-certificate-api.onrender.com
```

### Step 3: Test the API

```bash
curl -X POST https://your-certificate-api.onrender.com/generate-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "date": "2026-04-11",
    "purpose": "Testing ICA Integration"
  }' \
  --output test-certificate.png
```

### Step 4: Import ICA Agent Code

Copy the agent code from the [ICA Agent Implementation](#ica-agent-implementation) section below and create a new agent in ICA.

## 🤖 ICA Agent Implementation

### Complete Agent Code

Create a new agent in IBM Consulting Advantage with the following code:

```javascript
/**
 * IBM Certificate Generator Agent for ICA
 * Version: 1.0.0
 * 
 * This agent integrates with the Certificate Generator API to create
 * professional IBM Distribution Sector certificates.
 */

class CertificateGeneratorAgent {
  constructor(config = {}) {
    // API Configuration
    this.apiUrl = config.apiUrl || process.env.CERTIFICATE_API_URL || 'https://your-api.onrender.com';
    this.timeout = config.timeout || 30000; // 30 seconds
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 second
    
    // Validation rules
    this.validationRules = {
      name: { min: 2, max: 100 },
      purpose: { min: 5, max: 500 }
    };
  }

  /**
   * Generate a certificate
   * @param {Object} params - Certificate parameters
   * @param {string} params.name - Recipient name
   * @param {string} params.date - Certificate date (YYYY-MM-DD)
   * @param {string} params.purpose - Purpose or achievement
   * @returns {Promise<Object>} Result with certificate data
   */
  async generateCertificate(params) {
    try {
      // Validate inputs
      const validation = this.validateInputs(params);
      if (!validation.valid) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input parameters',
          details: validation.errors
        };
      }

      // Check API health before generating
      const isHealthy = await this.checkApiHealth();
      if (!isHealthy) {
        return {
          success: false,
          error: 'API_UNAVAILABLE',
          message: 'Certificate API is currently unavailable'
        };
      }

      // Generate certificate with retry logic
      const certificate = await this.generateWithRetry(params);
      
      return {
        success: true,
        certificate: certificate,
        metadata: {
          name: params.name,
          date: params.date,
          purpose: params.purpose,
          generatedAt: new Date().toISOString(),
          size: certificate.byteLength
        }
      };

    } catch (error) {
      console.error('Certificate generation failed:', error);
      return {
        success: false,
        error: error.code || 'GENERATION_ERROR',
        message: error.message || 'Failed to generate certificate',
        details: error.details
      };
    }
  }

  /**
   * Generate certificate with retry logic
   * @private
   */
  async generateWithRetry(params, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.apiUrl}/generate-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'IBM-Consulting-Advantage/1.0'
        },
        body: JSON.stringify({
          name: params.name,
          date: params.date,
          purpose: params.purpose
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          code: errorData.error?.code || 'API_ERROR',
          message: errorData.error?.message || `API returned ${response.status}`,
          details: errorData.error?.details
        };
      }

      return await response.arrayBuffer();

    } catch (error) {
      // Retry on network errors
      if (attempt < this.retryAttempts && this.isRetryableError(error)) {
        console.log(`Retry attempt ${attempt}/${this.retryAttempts}`);
        await this.sleep(this.retryDelay * attempt);
        return this.generateWithRetry(params, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Validate input parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateInputs(params) {
    const errors = [];

    // Validate name
    if (!params.name || typeof params.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else {
      const name = params.name.trim();
      if (name.length < this.validationRules.name.min) {
        errors.push(`Name must be at least ${this.validationRules.name.min} characters`);
      }
      if (name.length > this.validationRules.name.max) {
        errors.push(`Name must not exceed ${this.validationRules.name.max} characters`);
      }
    }

    // Validate date
    if (!params.date) {
      errors.push('Date is required');
    } else if (!this.isValidDate(params.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }

    // Validate purpose
    if (!params.purpose || typeof params.purpose !== 'string') {
      errors.push('Purpose is required and must be a string');
    } else {
      const purpose = params.purpose.trim();
      if (purpose.length < this.validationRules.purpose.min) {
        errors.push(`Purpose must be at least ${this.validationRules.purpose.min} characters`);
      }
      if (purpose.length > this.validationRules.purpose.max) {
        errors.push(`Purpose must not exceed ${this.validationRules.purpose.max} characters`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if date is valid ISO 8601 format
   * @private
   */
  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check API health
   * @returns {Promise<boolean>} True if API is healthy
   */
  async checkApiHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.apiUrl}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) return false;

      const data = await response.json();
      return data.status === 'healthy';

    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Check if error is retryable
   * @private
   */
  isRetryableError(error) {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
    return retryableCodes.includes(error.code) || 
           error.name === 'AbortError' ||
           (error.message && error.message.includes('network'));
  }

  /**
   * Sleep utility
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch generate certificates
   * @param {Array<Object>} recipients - Array of recipient data
   * @returns {Promise<Object>} Batch generation results
   */
  async batchGenerate(recipients) {
    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0,
      certificates: [],
      errors: []
    };

    for (const recipient of recipients) {
      try {
        const result = await this.generateCertificate(recipient);
        
        if (result.success) {
          results.successful++;
          results.certificates.push({
            name: recipient.name,
            certificate: result.certificate,
            metadata: result.metadata
          });
        } else {
          results.failed++;
          results.errors.push({
            name: recipient.name,
            error: result.error,
            message: result.message
          });
        }

        // Add delay between requests to avoid overwhelming the API
        await this.sleep(500);

      } catch (error) {
        results.failed++;
        results.errors.push({
          name: recipient.name,
          error: 'UNEXPECTED_ERROR',
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get API information
   * @returns {Promise<Object>} API information
   */
  async getApiInfo() {
    try {
      const response = await fetch(`${this.apiUrl}/`);
      return await response.json();
    } catch (error) {
      throw new Error('Failed to get API information');
    }
  }
}

// Export for ICA
module.exports = CertificateGeneratorAgent;

// Example usage in ICA
/*
const agent = new CertificateGeneratorAgent({
  apiUrl: 'https://your-api.onrender.com',
  timeout: 30000,
  retryAttempts: 3
});

const result = await agent.generateCertificate({
  name: 'John Doe',
  date: '2026-04-11',
  purpose: 'Completion of Advanced Cloud Architecture Training'
});

if (result.success) {
  console.log('Certificate generated successfully');
  // Save to ICA storage or send via email
} else {
  console.error('Failed:', result.message);
}
*/
```

## 🔄 Workflow Integration

### Example 1: Training Completion Workflow

```javascript
/**
 * ICA Workflow: Generate Certificate on Training Completion
 */

async function trainingCompletionWorkflow(context) {
  const { studentName, courseId, completionDate } = context.input;
  
  // Initialize agent
  const agent = new CertificateGeneratorAgent({
    apiUrl: process.env.CERTIFICATE_API_URL
  });
  
  // Get course details
  const course = await context.database.getCourse(courseId);
  
  // Generate certificate
  const result = await agent.generateCertificate({
    name: studentName,
    date: completionDate,
    purpose: `Successful completion of ${course.name}`
  });
  
  if (result.success) {
    // Save certificate to ICA storage
    const certificateId = await context.storage.save({
      type: 'certificate',
      studentName: studentName,
      courseId: courseId,
      completionDate: completionDate,
      data: result.certificate,
      metadata: result.metadata
    });
    
    // Send notification
    await context.notifications.send({
      to: context.input.studentEmail,
      subject: 'Your Certificate is Ready!',
      template: 'certificate-ready',
      data: {
        studentName: studentName,
        courseName: course.name,
        certificateId: certificateId
      },
      attachments: [{
        filename: `certificate-${studentName.replace(/\s+/g, '-')}.png`,
        content: result.certificate,
        contentType: 'image/png'
      }]
    });
    
    // Update student record
    await context.database.updateStudent(context.input.studentId, {
      certificateGenerated: true,
      certificateId: certificateId,
      certificateDate: completionDate
    });
    
    return {
      status: 'success',
      certificateId: certificateId,
      message: `Certificate generated and sent to ${studentName}`
    };
  } else {
    // Log error and notify admin
    await context.logging.error('Certificate generation failed', {
      studentName: studentName,
      error: result.error,
      message: result.message
    });
    
    await context.notifications.sendToAdmin({
      subject: 'Certificate Generation Failed',
      body: `Failed to generate certificate for ${studentName}: ${result.message}`
    });
    
    return {
      status: 'error',
      error: result.error,
      message: result.message
    };
  }
}
```

### Example 2: Batch Certificate Generation

```javascript
/**
 * ICA Workflow: Batch Generate Certificates for Course Graduates
 */

async function batchCertificateWorkflow(context) {
  const { courseId, graduationDate } = context.input;
  
  // Initialize agent
  const agent = new CertificateGeneratorAgent({
    apiUrl: process.env.CERTIFICATE_API_URL
  });
  
  // Get all graduates
  const graduates = await context.database.getGraduates(courseId);
  const course = await context.database.getCourse(courseId);
  
  // Prepare recipient data
  const recipients = graduates.map(graduate => ({
    name: graduate.fullName,
    date: graduationDate,
    purpose: `Successful completion of ${course.name}`
  }));
  
  // Generate certificates in batch
  const batchResult = await agent.batchGenerate(recipients);
  
  // Process results
  for (const cert of batchResult.certificates) {
    // Save to storage
    const certificateId = await context.storage.save({
      type: 'certificate',
      studentName: cert.name,
      courseId: courseId,
      data: cert.certificate,
      metadata: cert.metadata
    });
    
    // Find graduate and send notification
    const graduate = graduates.find(g => g.fullName === cert.name);
    if (graduate) {
      await context.notifications.send({
        to: graduate.email,
        subject: 'Your Certificate is Ready!',
        template: 'certificate-ready',
        attachments: [{
          filename: `certificate-${cert.name.replace(/\s+/g, '-')}.png`,
          content: cert.certificate,
          contentType: 'image/png'
        }]
      });
    }
  }
  
  // Log summary
  await context.logging.info('Batch certificate generation completed', {
    courseId: courseId,
    total: batchResult.total,
    successful: batchResult.successful,
    failed: batchResult.failed
  });
  
  // Notify admin of any failures
  if (batchResult.failed > 0) {
    await context.notifications.sendToAdmin({
      subject: 'Batch Certificate Generation - Some Failures',
      body: `Generated ${batchResult.successful} certificates successfully, ${batchResult.failed} failed.`,
      data: batchResult.errors
    });
  }
  
  return {
    status: 'completed',
    summary: {
      total: batchResult.total,
      successful: batchResult.successful,
      failed: batchResult.failed
    },
    errors: batchResult.errors
  };
}
```

### Example 3: On-Demand Certificate Generation

```javascript
/**
 * ICA Workflow: Generate Certificate on User Request
 */

async function onDemandCertificateWorkflow(context) {
  const { userId, achievementId } = context.input;
  
  // Initialize agent
  const agent = new CertificateGeneratorAgent({
    apiUrl: process.env.CERTIFICATE_API_URL
  });
  
  // Get user and achievement details
  const user = await context.database.getUser(userId);
  const achievement = await context.database.getAchievement(achievementId);
  
  // Check if user is eligible
  if (!achievement.isEligible(user)) {
    return {
      status: 'error',
      message: 'User is not eligible for this certificate'
    };
  }
  
  // Check if certificate already exists
  const existing = await context.database.getCertificate({
    userId: userId,
    achievementId: achievementId
  });
  
  if (existing) {
    return {
      status: 'exists',
      certificateId: existing.id,
      message: 'Certificate already generated',
      certificate: existing.data
    };
  }
  
  // Generate new certificate
  const result = await agent.generateCertificate({
    name: user.fullName,
    date: new Date().toISOString().split('T')[0],
    purpose: achievement.description
  });
  
  if (result.success) {
    // Save certificate
    const certificateId = await context.database.saveCertificate({
      userId: userId,
      achievementId: achievementId,
      data: result.certificate,
      metadata: result.metadata,
      generatedAt: new Date()
    });
    
    return {
      status: 'success',
      certificateId: certificateId,
      certificate: result.certificate,
      message: 'Certificate generated successfully'
    };
  } else {
    return {
      status: 'error',
      error: result.error,
      message: result.message
    };
  }
}
```

## ⚙️ Configuration

### Environment Variables

Set these in your ICA environment:

```bash
# Certificate API Configuration
CERTIFICATE_API_URL=https://your-api.onrender.com
CERTIFICATE_API_TIMEOUT=30000
CERTIFICATE_API_RETRY_ATTEMPTS=3

# Storage Configuration
CERTIFICATE_STORAGE_PATH=/certificates
CERTIFICATE_STORAGE_TYPE=s3  # or 'local', 'azure', etc.

# Notification Configuration
ENABLE_EMAIL_NOTIFICATIONS=true
EMAIL_TEMPLATE_CERTIFICATE_READY=certificate-ready
```

### ICA Agent Configuration

```javascript
// config/certificate-agent.js
module.exports = {
  agent: {
    name: 'CertificateGenerator',
    version: '1.0.0',
    description: 'Generate IBM Distribution Sector certificates',
    apiUrl: process.env.CERTIFICATE_API_URL,
    timeout: parseInt(process.env.CERTIFICATE_API_TIMEOUT) || 30000,
    retryAttempts: parseInt(process.env.CERTIFICATE_API_RETRY_ATTEMPTS) || 3,
    retryDelay: 1000
  },
  storage: {
    path: process.env.CERTIFICATE_STORAGE_PATH || '/certificates',
    type: process.env.CERTIFICATE_STORAGE_TYPE || 'local'
  },
  notifications: {
    enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    template: process.env.EMAIL_TEMPLATE_CERTIFICATE_READY || 'certificate-ready'
  }
};
```

## 🧪 Testing

### Unit Tests

```javascript
// tests/certificate-agent.test.js
const CertificateGeneratorAgent = require('../agents/CertificateGeneratorAgent');

describe('CertificateGeneratorAgent', () => {
  let agent;
  
  beforeEach(() => {
    agent = new CertificateGeneratorAgent({
      apiUrl: 'https://test-api.example.com'
    });
  });
  
  describe('validateInputs', () => {
    test('should validate correct inputs', () => {
      const result = agent.validateInputs({
        name: 'John Doe',
        date: '2026-04-11',
        purpose: 'Test purpose'
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should reject invalid name', () => {
      const result = agent.validateInputs({
        name: 'J',
        date: '2026-04-11',
        purpose: 'Test purpose'
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name must be at least 2 characters');
    });
    
    test('should reject invalid date format', () => {
      const result = agent.validateInputs({
        name: 'John Doe',
        date: '11-04-2026',
        purpose: 'Test purpose'
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Date must be in YYYY-MM-DD format');
    });
  });
  
  describe('checkApiHealth', () => {
    test('should return true for healthy API', async () => {
      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' })
        })
      );
      
      const isHealthy = await agent.checkApiHealth();
      expect(isHealthy).toBe(true);
    });
  });
});
```

### Integration Tests

```javascript
// tests/integration/certificate-workflow.test.js
const CertificateGeneratorAgent = require('../../agents/CertificateGeneratorAgent');

describe('Certificate Workflow Integration', () => {
  let agent;
  
  beforeAll(() => {
    agent = new CertificateGeneratorAgent({
      apiUrl: process.env.TEST_API_URL || 'http://localhost:3000'
    });
  });
  
  test('should generate certificate end-to-end', async () => {
    const result = await agent.generateCertificate({
      name: 'Integration Test User',
      date: '2026-04-11',
      purpose: 'Integration Testing'
    });
    
    expect(result.success).toBe(true);
    expect(result.certificate).toBeInstanceOf(ArrayBuffer);
    expect(result.metadata.name).toBe('Integration Test User');
  }, 30000);
  
  test('should handle API errors gracefully', async () => {
    const result = await agent.generateCertificate({
      name: 'X',  // Invalid name
      date: '2026-04-11',
      purpose: 'Test'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('VALIDATION_ERROR');
  });
});
```

### Manual Testing Script

```javascript
// scripts/test-ica-integration.js
const CertificateGeneratorAgent = require('../agents/CertificateGeneratorAgent');

async function testIntegration() {
  console.log('Testing ICA Certificate Generator Integration...\n');
  
  const agent = new CertificateGeneratorAgent({
    apiUrl: process.env.CERTIFICATE_API_URL || 'http://localhost:3000'
  });
  
  // Test 1: Health Check
  console.log('Test 1: API Health Check');
  const isHealthy = await agent.checkApiHealth();
  console.log(`Result: ${isHealthy ? 'PASS' : 'FAIL'}\n`);
  
  // Test 2: Single Certificate Generation
  console.log('Test 2: Single Certificate Generation');
  const singleResult = await agent.generateCertificate({
    name: 'Test User',
    date: '2026-04-11',
    purpose: 'Testing ICA Integration'
  });
  console.log(`Result: ${singleResult.success ? 'PASS' : 'FAIL'}`);
  if (!singleResult.success) {
    console.log(`Error: ${singleResult.message}`);
  }
  console.log();
  
  // Test 3: Batch Generation
  console.log('Test 3: Batch Certificate Generation');
  const batchResult = await agent.batchGenerate([
    { name: 'User 1', date: '2026-04-11', purpose: 'Batch Test 1' },
    { name: 'User 2', date: '2026-04-11', purpose: 'Batch Test 2' },
    { name: 'User 3', date: '2026-04-11', purpose: 'Batch Test 3' }
  ]);
  console.log(`Result: ${batchResult.successful}/${batchResult.total} successful`);
  console.log();
  
  // Test 4: Validation
  console.log('Test 4: Input Validation');
  const validation = agent.validateInputs({
    name: 'X',
    date: 'invalid',
    purpose: 'Too short'
  });
  console.log(`Result: ${!validation.valid ? 'PASS' : 'FAIL'}`);
  console.log(`Errors: ${validation.errors.join(', ')}\n`);
  
  console.log('Integration testing completed!');
}

testIntegration().catch(console.error);
```

## 🚀 Deployment

### Step 1: Deploy Certificate API

Ensure your Certificate Generator API is deployed and accessible:

```bash
# Verify API is running
curl https://your-api.onrender.com/health
```

### Step 2: Configure ICA Environment

1. Log in to IBM Consulting Advantage
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `CERTIFICATE_API_URL`: Your API endpoint
   - `CERTIFICATE_API_TIMEOUT`: 30000
   - `CERTIFICATE_API_RETRY_ATTEMPTS`: 3

### Step 3: Import Agent

1. Navigate to Agents → Create New Agent
2. Name: "Certificate Generator"
3. Copy and paste the agent code
4. Save and activate

### Step 4: Create Workflows

1. Navigate to Workflows → Create New Workflow
2. Add the certificate generation step
3. Configure triggers (e.g., training completion)
4. Test the workflow

### Step 5: Configure Storage

1. Set up certificate storage location
2. Configure access permissions
3. Set retention policies

### Step 6: Configure Notifications

1. Set up email templates
2. Configure SMTP settings
3. Test notification delivery

## 📚 Best Practices

### 1. Error Handling

Always implement comprehensive error handling:

```javascript
try {
  const result = await agent.generateCertificate(params);
  if (!result.success) {
    // Log error
    await context.logging.error('Certificate generation failed', result);
    // Notify admin
    await context.notifications.sendToAdmin({
      subject: 'Certificate Generation Error',
      body: result.message
    });
  }
} catch (error) {
  // Handle unexpected errors
  await context.logging.critical('Unexpected error', error);
}
```

### 2. Input Validation

Validate all inputs before API calls:

```javascript
const validation = agent.validateInputs(params);
if (!validation.valid) {
  return {
    status: 'error',
    errors: validation.errors
  };
}
```

### 3. Retry Logic

Use built-in retry logic for transient failures:

```javascript
const agent = new CertificateGeneratorAgent({
  retryAttempts: 3,
  retryDelay: 1000
});
```

### 4. Monitoring

Implement monitoring and alerting:

```javascript
// Log all certificate generations
await context.logging.info('Certificate generated', {
  name: params.name,
  date: params.date,
  duration: Date.now() - startTime
});

// Alert on failures
if (failureRate > 0.1) {
  await context.alerts.send({
    severity: 'high',
    message: 'Certificate generation failure rate exceeded 10%'
  });
}
```

### 5. Caching

Cache API health checks:

```javascript
let healthCheckCache = null;
let healthCheckTime = 0;

async function checkApiHealthCached() {
  const now = Date.now();
  if (healthCheckCache && (now - healthCheckTime) < 60000) {
    return healthCheckCache;
  }
  
  healthCheckCache = await agent.checkApiHealth();
  healthCheckTime = now;
  return healthCheckCache;
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. API Connection Timeout

**Problem**: Requests timeout before completion

**Solution**:
```javascript
// Increase timeout
const agent = new CertificateGeneratorAgent({
  timeout: 60000  // 60 seconds
});
```

#### 2. Validation Errors

**Problem**: Inputs fail validation

**Solution**:
```javascript
// Check validation rules
const validation = agent.validateInputs(params);
console.log('Validation errors:', validation.errors);

// Adjust inputs to meet requirements
```

#### 3. API Unavailable

**Problem**: API health check fails

**Solution**:
```javascript
// Check API status
const isHealthy = await agent.checkApiHealth();
if (!isHealthy) {
  // Use fallback or queue for later
  await context.queue.add('certificate-generation', params);
}
```

#### 4. Certificate Not Saved

**Problem**: Certificate generation succeeds but storage fails

**Solution**:
```javascript
try {
  const result = await agent.generateCertificate(params);
  if (result.success) {
    try {
      await context.storage.save(result.certificate);
    } catch (storageError) {
      // Retry storage or use alternative
      await context.storage.saveToBackup(result.certificate);
    }
  }
} catch (error) {
  // Handle error
}
```

### Debug Mode

Enable debug logging:

```javascript
const agent = new CertificateGeneratorAgent({
  apiUrl: process.env.CERTIFICATE_API_URL,
  debug: true  // Enable debug logging
});

// Agent will log detailed information
```

### Health Check Endpoint

Monitor API health:

```bash
# Check API health
curl https://your-api.onrender.com/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-04-11T18:00:00.000Z",
#   "version": "1.0.0",
#   "service": "IBM Certificate Generator API"
# }
```

## 📞 Support

For issues or questions:

1. Check the [main documentation](README.md)
2. Review [API documentation](INTEGRATION_GUIDE.md)
3. Test with [Postman collection](postman_collection.json)
4. Contact ICA support team
5. Open an issue on GitHub

## 📝 Changelog

### Version 1.0.0 (2026-04-11)
- Initial ICA integration
- Agent implementation
- Workflow examples
- Testing suite
- Documentation

---

**Made with ❤️ for IBM Consulting Advantage**