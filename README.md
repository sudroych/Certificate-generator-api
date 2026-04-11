# IBM Certificate Generator API

A REST API service that generates professional IBM Distribution Sector certificates in PNG format. The API accepts recipient name, date, and purpose, and returns a beautifully designed certificate image.

## 🚀 Features

- **Simple REST API**: Easy-to-use POST endpoint for certificate generation
- **IBM Branding**: Professional design with IBM colors and branding
- **Platform Independent**: Can be called from any HTTP client (Postman, SoapUI, GPT models, IBM Consulting Advantage, etc.)
- **Input Validation**: Comprehensive validation of all input parameters
- **CORS Enabled**: Accessible from any domain
- **Health Monitoring**: Built-in health check endpoint
- **API Documentation**: OpenAPI/Swagger specification included

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Request Examples](#request-examples)
- [Integration Examples](#integration-examples)
- [Deployment](#deployment)
- [Testing](#testing)

## 🛠️ Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/sudroych/Certificate-generator-api.git
cd Certificate-generator-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📖 Usage

### Generate a Certificate

Send a POST request to `/generate-certificate` with the following JSON body:

```json
{
  "name": "John Doe",
  "date": "2026-04-11",
  "purpose": "Completion of Advanced Node.js Course"
}
```

The API will return a PNG image of the certificate.

## 🔌 API Endpoints

### POST /generate-certificate

Generates an IBM Distribution Sector certificate.

**Request Body:**
```json
{
  "name": "string (required, 2-100 characters)",
  "date": "string (required, ISO 8601 format: YYYY-MM-DD)",
  "purpose": "string (required, 5-500 characters)"
}
```

**Response:**
- Content-Type: `image/png`
- Body: PNG image binary data

**Certificate Content:**
- Organization: IBM (hardcoded)
- Signature: None (blank)
- Footer: "Distribution Sector Lead"
- Certificate ID: Auto-generated unique ID

**Status Codes:**
- `200`: Success - Certificate generated
- `400`: Bad Request - Validation error
- `500`: Internal Server Error

### GET /health

Health check endpoint to verify API status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-11T15:45:00.000Z",
  "version": "1.0.0",
  "service": "IBM Certificate Generator API"
}
```

### GET /api-docs

Returns OpenAPI/Swagger specification for the API.

### GET /

Returns API information and available endpoints.

## 📝 Request Examples

### cURL

```bash
curl -X POST http://localhost:3000/generate-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "date": "2026-04-11",
    "purpose": "Completion of Advanced Node.js Course"
  }' \
  --output certificate.png
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('http://localhost:3000/generate-certificate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    date: '2026-04-11',
    purpose: 'Completion of Advanced Node.js Course'
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
// Use the URL to display or download the image
```

### Python (requests)

```python
import requests

url = 'http://localhost:3000/generate-certificate'
data = {
    'name': 'John Doe',
    'date': '2026-04-11',
    'purpose': 'Completion of Advanced Node.js Course'
}

response = requests.post(url, json=data)

if response.status_code == 200:
    with open('certificate.png', 'wb') as f:
        f.write(response.content)
    print('Certificate saved!')
```

### Node.js (axios)

```javascript
const axios = require('axios');
const fs = require('fs');

async function generateCertificate() {
  const response = await axios.post(
    'http://localhost:3000/generate-certificate',
    {
      name: 'John Doe',
      date: '2026-04-11',
      purpose: 'Completion of Advanced Node.js Course'
    },
    {
      responseType: 'arraybuffer'
    }
  );

  fs.writeFileSync('certificate.png', response.data);
  console.log('Certificate saved!');
}

generateCertificate();
```

## 🔗 Integration Examples

### GPT Function Calling

Configure the function in your GPT model:

```json
{
  "name": "generate_certificate",
  "description": "Generate an IBM Distribution Sector certificate",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Recipient's full name"
      },
      "date": {
        "type": "string",
        "description": "Certificate date in YYYY-MM-DD format"
      },
      "purpose": {
        "type": "string",
        "description": "Purpose or achievement description"
      }
    },
    "required": ["name", "date", "purpose"]
  }
}
```

### IBM Consulting Advantage Agent

```javascript
// Example ICA agent integration
async function generateCertificateForClient(clientName, achievementDate, achievement) {
  const apiUrl = 'https://your-api.render.com/generate-certificate';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: clientName,
      date: achievementDate,
      purpose: achievement
    })
  });

  if (response.ok) {
    const imageBuffer = await response.arrayBuffer();
    // Process or store the certificate
    return imageBuffer;
  } else {
    throw new Error('Failed to generate certificate');
  }
}
```

## 🚢 Deployment

### Deploy to Render

1. Push your code to GitHub

2. Create a new Web Service on Render:
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

3. The service will be deployed automatically

### Environment Variables

No environment variables are required for basic operation. Optional variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## 🧪 Testing

### Using Postman

1. Import the Postman collection (see `postman_collection.json`)
2. Send a POST request to `/generate-certificate`
3. View the generated certificate image in the response

### Using SoapUI

1. Create a new REST project
2. Add a POST request to `/generate-certificate`
3. Set Content-Type header to `application/json`
4. Add the request body with name, date, and purpose
5. Send the request and save the response as a PNG file

### Manual Testing

```bash
# Start the server
npm start

# In another terminal, test the health endpoint
curl http://localhost:3000/health

# Generate a test certificate
curl -X POST http://localhost:3000/generate-certificate \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","date":"2026-04-11","purpose":"Testing"}' \
  --output test-certificate.png

# Open the generated certificate
# Windows: start test-certificate.png
# Mac: open test-certificate.png
# Linux: xdg-open test-certificate.png
```

## 📄 Certificate Design

The generated certificates feature:

- **Dimensions**: 1200px × 900px (4:3 ratio)
- **IBM Branding**: Official IBM blue color (#0F62FE)
- **Clean Layout**: Modern, professional design with proper spacing
- **Content**:
  - Title: "CERTIFICATE OF ACHIEVEMENT"
  - Organization: IBM
  - Recipient name (centered, bold)
  - Purpose/achievement (wrapped text)
  - Date (formatted as "Month Day, Year")
  - Unique certificate ID
  - Footer: "Distribution Sector Lead"

## 🔒 Security Considerations

- Input validation on all parameters
- CORS enabled for cross-origin access
- Error messages sanitized to prevent information leakage
- No sensitive data stored or logged

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License

## 📞 Support

For issues or questions, please open an issue on GitHub.

## 🔄 API Versioning

Current version: 1.0.0

## 📊 Rate Limiting

Currently no rate limiting is implemented. For production use, consider adding rate limiting middleware.

## 🎯 Future Enhancements

- [ ] Multiple certificate templates
- [ ] Custom font selection
- [ ] Logo upload support
- [ ] PDF format support
- [ ] Batch certificate generation
- [ ] Email delivery integration
- [ ] QR code for verification
- [ ] API key authentication
- [ ] Rate limiting