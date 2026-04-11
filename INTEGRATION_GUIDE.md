# Integration Guide

This guide provides detailed instructions for integrating the IBM Certificate Generator API with various platforms and services.

## 📋 Table of Contents

- [GPT Models Integration](#gpt-models-integration)
- [IBM Consulting Advantage Integration](#ibm-consulting-advantage-integration)
- [General HTTP Client Integration](#general-http-client-integration)
- [Postman/SoapUI Testing](#postmansoapui-testing)
- [Programming Language Examples](#programming-language-examples)

## 🤖 GPT Models Integration

### OpenAI GPT-4/GPT-5 Function Calling

Configure the function in your GPT application:

```json
{
  "name": "generate_ibm_certificate",
  "description": "Generate an IBM Distribution Sector certificate for a recipient. Returns a PNG image of the certificate.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The full name of the certificate recipient"
      },
      "date": {
        "type": "string",
        "description": "The certificate date in YYYY-MM-DD format (ISO 8601)"
      },
      "purpose": {
        "type": "string",
        "description": "The purpose or achievement for which the certificate is awarded"
      }
    },
    "required": ["name", "date", "purpose"]
  }
}
```

### Implementation Example

```python
import openai
import requests

def generate_certificate_via_gpt(name, date, purpose):
    # Define the function
    functions = [
        {
            "name": "generate_ibm_certificate",
            "description": "Generate an IBM Distribution Sector certificate",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "date": {"type": "string"},
                    "purpose": {"type": "string"}
                },
                "required": ["name", "date", "purpose"]
            }
        }
    ]
    
    # Call GPT with function
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": f"Generate a certificate for {name}"}
        ],
        functions=functions,
        function_call={"name": "generate_ibm_certificate"}
    )
    
    # Extract function arguments
    function_args = response.choices[0].message.function_call.arguments
    
    # Call the actual API
    api_response = requests.post(
        'https://your-api.onrender.com/generate-certificate',
        json={
            "name": name,
            "date": date,
            "purpose": purpose
        }
    )
    
    return api_response.content
```

### Claude/Anthropic Integration

```python
import anthropic
import requests

def generate_certificate_with_claude(name, date, purpose):
    client = anthropic.Anthropic(api_key="your-api-key")
    
    # Define tool
    tools = [
        {
            "name": "generate_ibm_certificate",
            "description": "Generate an IBM Distribution Sector certificate",
            "input_schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "date": {"type": "string"},
                    "purpose": {"type": "string"}
                },
                "required": ["name", "date", "purpose"]
            }
        }
    ]
    
    # Call Claude
    message = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1024,
        tools=tools,
        messages=[
            {"role": "user", "content": f"Generate a certificate for {name}"}
        ]
    )
    
    # Call the API
    response = requests.post(
        'https://your-api.onrender.com/generate-certificate',
        json={"name": name, "date": date, "purpose": purpose}
    )
    
    return response.content
```

## 🏢 IBM Consulting Advantage Integration

### Agent Configuration

Create an agent in IBM Consulting Advantage that can call the certificate API:

```javascript
// ICA Agent Code Example
class CertificateGeneratorAgent {
  constructor(apiUrl) {
    this.apiUrl = apiUrl || 'https://your-api.onrender.com';
  }

  async generateCertificate(recipientName, certDate, achievement) {
    try {
      const response = await fetch(`${this.apiUrl}/generate-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: recipientName,
          date: certDate,
          purpose: achievement
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error.message}`);
      }

      const imageBuffer = await response.arrayBuffer();
      return {
        success: true,
        certificate: imageBuffer,
        message: `Certificate generated for ${recipientName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validateInputs(name, date, purpose) {
    const errors = [];
    
    if (!name || name.length < 2 || name.length > 100) {
      errors.push('Name must be between 2 and 100 characters');
    }
    
    if (!date || !this.isValidDate(date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
    
    if (!purpose || purpose.length < 5 || purpose.length > 500) {
      errors.push('Purpose must be between 5 and 500 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  async checkApiHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

// Usage in ICA
const agent = new CertificateGeneratorAgent('https://your-api.onrender.com');

// Generate certificate
const result = await agent.generateCertificate(
  'John Doe',
  '2026-04-11',
  'Completion of Advanced Cloud Architecture Training'
);

if (result.success) {
  // Save or process the certificate
  console.log('Certificate generated successfully');
} else {
  console.error('Failed to generate certificate:', result.error);
}
```

### ICA Workflow Integration

```javascript
// ICA Workflow Step: Generate Certificate
async function generateCertificateStep(context) {
  const { recipientName, completionDate, courseName } = context.input;
  
  const agent = new CertificateGeneratorAgent(process.env.CERTIFICATE_API_URL);
  
  // Validate inputs
  const validation = await agent.validateInputs(
    recipientName,
    completionDate,
    `Completion of ${courseName}`
  );
  
  if (!validation.valid) {
    return {
      status: 'error',
      errors: validation.errors
    };
  }
  
  // Generate certificate
  const result = await agent.generateCertificate(
    recipientName,
    completionDate,
    `Completion of ${courseName}`
  );
  
  if (result.success) {
    // Store certificate in ICA storage
    const certificateId = await context.storage.save({
      type: 'certificate',
      recipient: recipientName,
      date: completionDate,
      data: result.certificate
    });
    
    return {
      status: 'success',
      certificateId,
      message: result.message
    };
  } else {
    return {
      status: 'error',
      error: result.error
    };
  }
}
```

## 🌐 General HTTP Client Integration

### cURL

```bash
# Generate certificate
curl -X POST https://your-api.onrender.com/generate-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "date": "2026-04-11",
    "purpose": "Completion of Advanced Node.js Course"
  }' \
  --output certificate.png

# Check health
curl https://your-api.onrender.com/health
```

### Wget

```bash
wget --method=POST \
  --header='Content-Type: application/json' \
  --body-data='{"name":"John Doe","date":"2026-04-11","purpose":"Completion of Course"}' \
  -O certificate.png \
  https://your-api.onrender.com/generate-certificate
```

## 🧪 Postman/SoapUI Testing

### Postman Setup

1. **Import Collection**:
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json`
   - Collection will be imported with all endpoints

2. **Set Environment Variable**:
   - Click "Environments"
   - Create new environment
   - Add variable: `base_url` = `https://your-api.onrender.com`
   - Save and select the environment

3. **Test Endpoints**:
   - Select "Generate Certificate" request
   - Click "Send"
   - View response in "Body" tab
   - Save response as PNG file

### SoapUI Setup

1. **Create REST Project**:
   - File → New REST Project
   - Name: IBM Certificate Generator
   - Base URL: `https://your-api.onrender.com`

2. **Add POST Request**:
   - Right-click project → New Resource
   - Path: `/generate-certificate`
   - Method: POST

3. **Configure Request**:
   - Media Type: `application/json`
   - Request Body:
   ```json
   {
     "name": "John Doe",
     "date": "2026-04-11",
     "purpose": "Completion of Advanced Node.js Course"
   }
   ```

4. **Send Request**:
   - Click green play button
   - Response will show PNG binary data
   - Right-click response → Save As → certificate.png

## 💻 Programming Language Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');
const fs = require('fs');

async function generateCertificate(name, date, purpose) {
  try {
    const response = await axios.post(
      'https://your-api.onrender.com/generate-certificate',
      { name, date, purpose },
      { responseType: 'arraybuffer' }
    );
    
    fs.writeFileSync('certificate.png', response.data);
    console.log('Certificate generated successfully!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

generateCertificate(
  'John Doe',
  '2026-04-11',
  'Completion of Advanced Node.js Course'
);
```

### Python

```python
import requests

def generate_certificate(name, date, purpose):
    url = 'https://your-api.onrender.com/generate-certificate'
    data = {
        'name': name,
        'date': date,
        'purpose': purpose
    }
    
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        with open('certificate.png', 'wb') as f:
            f.write(response.content)
        print('Certificate generated successfully!')
    else:
        print(f'Error: {response.json()}')

generate_certificate(
    'John Doe',
    '2026-04-11',
    'Completion of Advanced Python Course'
)
```

### Java

```java
import java.io.*;
import java.net.http.*;
import java.nio.file.*;

public class CertificateGenerator {
    public static void generateCertificate(String name, String date, String purpose) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            
            String json = String.format(
                "{\"name\":\"%s\",\"date\":\"%s\",\"purpose\":\"%s\"}",
                name, date, purpose
            );
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://your-api.onrender.com/generate-certificate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
            
            HttpResponse<byte[]> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofByteArray()
            );
            
            if (response.statusCode() == 200) {
                Files.write(Paths.get("certificate.png"), response.body());
                System.out.println("Certificate generated successfully!");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public static void main(String[] args) {
        generateCertificate(
            "John Doe",
            "2026-04-11",
            "Completion of Advanced Java Course"
        );
    }
}
```

### C#

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.IO;

class CertificateGenerator
{
    static async Task GenerateCertificate(string name, string date, string purpose)
    {
        using var client = new HttpClient();
        
        var json = $@"{{
            ""name"": ""{name}"",
            ""date"": ""{date}"",
            ""purpose"": ""{purpose}""
        }}";
        
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await client.PostAsync(
            "https://your-api.onrender.com/generate-certificate",
            content
        );
        
        if (response.IsSuccessStatusCode)
        {
            var bytes = await response.Content.ReadAsByteArrayAsync();
            await File.WriteAllBytesAsync("certificate.png", bytes);
            Console.WriteLine("Certificate generated successfully!");
        }
    }
    
    static async Task Main()
    {
        await GenerateCertificate(
            "John Doe",
            "2026-04-11",
            "Completion of Advanced C# Course"
        );
    }
}
```

### PHP

```php
<?php

function generateCertificate($name, $date, $purpose) {
    $url = 'https://your-api.onrender.com/generate-certificate';
    
    $data = json_encode([
        'name' => $name,
        'date' => $date,
        'purpose' => $purpose
    ]);
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => $data
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result !== false) {
        file_put_contents('certificate.png', $result);
        echo "Certificate generated successfully!\n";
    } else {
        echo "Error generating certificate\n";
    }
}

generateCertificate(
    'John Doe',
    '2026-04-11',
    'Completion of Advanced PHP Course'
);
?>
```

## 🔐 Authentication (Future Enhancement)

When API key authentication is implemented:

```javascript
// Add API key to headers
const response = await fetch('https://your-api.onrender.com/generate-certificate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({ name, date, purpose })
});
```

## 📊 Error Handling

Always implement proper error handling:

```javascript
async function generateCertificateWithErrorHandling(name, date, purpose) {
  try {
    const response = await fetch('https://your-api.onrender.com/generate-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date, purpose })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error.message}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Failed to generate certificate:', error);
    throw error;
  }
}
```

## 🎯 Best Practices

1. **Validate inputs** before calling the API
2. **Handle errors** gracefully
3. **Cache responses** if generating the same certificate multiple times
4. **Use environment variables** for API URLs
5. **Implement retry logic** for network failures
6. **Monitor API health** before making requests
7. **Log API calls** for debugging and auditing

## 📞 Support

For integration support:
- Check API documentation: `/api-docs`
- Review error messages in API responses
- Test with Postman collection first
- Contact support team for assistance