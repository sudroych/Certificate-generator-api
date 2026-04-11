# Quick Start Guide

Get the IBM Certificate Generator API up and running in 5 minutes!

## 🚀 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

### 3. Test the API

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Generate a Certificate
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

**Windows PowerShell:**
```powershell
$body = @{
    name = "John Doe"
    date = "2026-04-11"
    purpose = "Completion of Advanced Node.js Course"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/generate-certificate" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -OutFile "certificate.png"
```

## 🧪 Run Tests

Use the included test script:

**Windows:**
```powershell
.\test-api.ps1
```

**Linux/Mac:**
```bash
# Create a bash version of the test script if needed
chmod +x test-api.sh
./test-api.sh
```

## 📮 Using Postman

1. Import the Postman collection: `postman_collection.json`
2. The collection includes:
   - Health check
   - Certificate generation
   - Validation error examples
   - API documentation endpoint

## 🌐 Deploy to Production

### Quick Deploy to Render

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

2. Go to [Render](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Click "Apply" - Render will use the `render.yaml` configuration

Your API will be live in minutes!

## 📚 API Endpoints

### POST /generate-certificate
Generate a certificate image

**Request:**
```json
{
  "name": "Recipient Name",
  "date": "2026-04-11",
  "purpose": "Achievement description"
}
```

**Response:** PNG image file

### GET /health
Check API status

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-11T16:00:00.000Z",
  "version": "1.0.0"
}
```

### GET /api-docs
Get OpenAPI specification

### GET /
Get API information

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):
```env
PORT=3000
NODE_ENV=development
```

### Certificate Customization

The certificate includes:
- **Organization:** IBM (hardcoded)
- **Footer:** Distribution Sector Lead (hardcoded)
- **Design:** IBM branded with official colors
- **Format:** PNG, 1200x900px

## 💡 Integration Examples

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3000/generate-certificate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    date: '2026-04-11',
    purpose: 'Completion of Advanced Node.js Course'
  })
});

const blob = await response.blob();
// Save or display the certificate
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3000/generate-certificate',
    json={
        'name': 'John Doe',
        'date': '2026-04-11',
        'purpose': 'Completion of Advanced Node.js Course'
    }
)

with open('certificate.png', 'wb') as f:
    f.write(response.content)
```

### GPT Function Call
```json
{
  "name": "generate_certificate",
  "parameters": {
    "name": "John Doe",
    "date": "2026-04-11",
    "purpose": "Completion of Advanced Node.js Course"
  }
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Certificate Not Generating
- Check that Sharp library installed correctly
- Verify all required fields are provided
- Check server logs for errors

## 📖 More Documentation

- **Full Documentation:** [README.md](README.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Integration:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

## 🎯 Next Steps

1. ✅ Test locally
2. ✅ Try the Postman collection
3. ✅ Generate sample certificates
4. 🚀 Deploy to production
5. 📱 Integrate with your application

## 💬 Need Help?

- Check the [README.md](README.md) for detailed information
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
- Open an issue on GitHub for support

---

**Made with ❤️ for IBM Distribution Sector**