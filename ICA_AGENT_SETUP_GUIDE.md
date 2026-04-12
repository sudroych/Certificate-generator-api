# IBM Consulting Advantage (ICA) Agent Setup Guide

## Certificate Generator API Integration

This guide explains how to integrate the Certificate Generator API with IBM Consulting Advantage (ICA) using MCP Tools.

---

## Overview

The Certificate Generator API provides two endpoints:
1. **`/generate-certificate`** - Returns binary PNG image (for direct download)
2. **`/generate-certificate-json`** - Returns JSON with base64-encoded image (for ICA integration)

**For ICA integration, you MUST use `/generate-certificate-json`** because ICA's REST tool requires JSON responses.

---

## ICA Tool Configuration

### Step 1: Create New Tool in ICA

1. Navigate to **Tools** section in ICA
2. Click **"Create Tool"** or **"Add Tool"**
3. Select **"REST"** as the Integration Type

### Step 2: Basic Information

| Field | Value |
|-------|-------|
| **Name** | `certificate-generator-api` |
| **Display Name** | `Certificate Generator API` |
| **Description** | `Generates IBM Distribution Sector certificates with custom name, date, and purpose` |
| **Integration Type** | `REST` |
| **Request Type** | `POST` |

### Step 3: API Configuration

#### URL
```
https://ibm-certificate-generator.onrender.com/generate-certificate-json
```

**Important:** Use `/generate-certificate-json` endpoint, NOT `/generate-certificate`

#### Headers (JSON)
```json
{
  "Content-Type": "application/json"
}
```

#### Authentication Type
```
None
```

### Step 4: Input Schema (JSON)

```json
{
  "type": "object",
  "required": ["name", "date", "purpose"],
  "properties": {
    "name": {
      "type": "string",
      "description": "Full name of the certificate recipient",
      "minLength": 2,
      "maxLength": 100,
      "example": "Sudip Roy Choudhury"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Certificate date in ISO 8601 format (YYYY-MM-DD)",
      "example": "2026-04-11"
    },
    "purpose": {
      "type": "string",
      "description": "Purpose or achievement description",
      "minLength": 5,
      "maxLength": 500,
      "example": "AHM Meeting"
    }
  }
}
```

### Step 5: Output Schema (JSON)

```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Indicates if certificate generation was successful"
    },
    "certificate": {
      "type": "object",
      "properties": {
        "image": {
          "type": "string",
          "description": "Base64-encoded PNG image"
        },
        "contentType": {
          "type": "string",
          "description": "MIME type of the image",
          "const": "image/png"
        },
        "filename": {
          "type": "string",
          "description": "Suggested filename for the certificate"
        },
        "size": {
          "type": "integer",
          "description": "Size of the image in bytes"
        }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Recipient name"
        },
        "date": {
          "type": "string",
          "description": "Certificate date"
        },
        "purpose": {
          "type": "string",
          "description": "Certificate purpose"
        },
        "generatedAt": {
          "type": "string",
          "format": "date-time",
          "description": "Timestamp when certificate was generated"
        }
      }
    }
  }
}
```

### Step 6: Annotations (Optional)

Leave empty or add:
```json
{}
```

### Step 7: Tags (Optional)

Suggested tags:
```
certificate, document-generation, ibm, api
```

---

## Testing the Tool

### Test in ICA

1. After saving the tool configuration, click **"Test Tool"**
2. Use the following test input:

```json
{
  "name": "Sudip Roy Choudhury",
  "date": "2026-04-11",
  "purpose": "AHM Meeting"
}
```

3. Expected response structure:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{...JSON response...}"
      }
    ],
    "isError": false,
    "structuredContent": {
      "success": true,
      "certificate": {
        "image": "iVBORw0KGgoAAAANS...",
        "contentType": "image/png",
        "filename": "certificate-1775982026311.png",
        "size": 35743
      },
      "metadata": {
        "name": "Sudip Roy Choudhury",
        "date": "2026-04-11",
        "purpose": "AHM Meeting",
        "generatedAt": "2026-04-12T08:20:26.311Z"
      }
    }
  },
  "id": 1775981614286
}
```

### Verify Success

✅ **Success indicators:**
- `success: true` in response
- `certificate.image` contains base64 string
- `certificate.size` shows image size in bytes
- No error messages

❌ **Common errors:**
- **"Invalid method"** - Wrong endpoint (use `/generate-certificate-json`)
- **"VALIDATION_ERROR"** - Invalid input format (check date format YYYY-MM-DD)
- **"GENERATION_ERROR"** - Server error (check API status)

---

## Using the Tool in ICA Agent

### Example Agent Prompt

```
Generate a certificate for John Smith dated April 15, 2026 for completing the Advanced Leadership Training program.
```

### Agent Tool Call

The ICA agent will automatically call the tool with:
```json
{
  "name": "John Smith",
  "date": "2026-04-15",
  "purpose": "Completion of Advanced Leadership Training"
}
```

### Handling the Response

The agent will receive the base64-encoded image and can:
1. Display it to the user
2. Save it to a file
3. Include it in a document
4. Send it via email

---

## Troubleshooting

### Issue: "Invalid method" Error

**Cause:** Using wrong endpoint or ICA wrapping issue

**Solution:**
1. Verify URL is `/generate-certificate-json` (not `/generate-certificate`)
2. Confirm Integration Type is set to `REST`
3. Check Headers include `Content-Type: application/json`

### Issue: Validation Errors

**Cause:** Invalid input format

**Solution:**
- **Name:** Must be 2-100 characters
- **Date:** Must be ISO 8601 format (YYYY-MM-DD)
- **Purpose:** Must be 5-500 characters

### Issue: Empty Response

**Cause:** API server not responding

**Solution:**
1. Test health endpoint: `https://ibm-certificate-generator.onrender.com/health`
2. Check if Render.com service is active (may need to wake up)
3. Wait 30-60 seconds for cold start

### Issue: Base64 Decoding Problems

**Cause:** Incomplete or corrupted base64 string

**Solution:**
1. Verify `certificate.image` field exists in response
2. Check `certificate.size` matches expected image size
3. Ensure no truncation occurred during transmission

---

## API Endpoints Reference

### Health Check
```
GET https://ibm-certificate-generator.onrender.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-12T08:13:34.100Z",
  "version": "1.0.0",
  "service": "IBM Certificate Generator API"
}
```

### Generate Certificate (Binary)
```
POST https://ibm-certificate-generator.onrender.com/generate-certificate
```

Returns: PNG image (binary)

**Note:** Not compatible with ICA - use JSON endpoint instead

### Generate Certificate (JSON)
```
POST https://ibm-certificate-generator.onrender.com/generate-certificate-json
```

Returns: JSON with base64-encoded image

**Recommended for ICA integration**

---

## Best Practices

1. **Always use `/generate-certificate-json`** for ICA integration
2. **Validate input** before sending to API (date format, length constraints)
3. **Handle errors gracefully** - check `success` field in response
4. **Cache certificates** if generating multiple times for same parameters
5. **Monitor API health** - use `/health` endpoint for status checks
6. **Set appropriate timeouts** - certificate generation takes 2-5 seconds

---

## Support

For issues or questions:
- Check API documentation: `/api-docs` endpoint
- Review server logs on Render.com dashboard
- Test locally using `test-json-endpoint.ps1` script
- Verify API is deployed and running on Render.com

---

## Version History

- **v1.0.0** (2026-04-12) - Initial ICA integration with JSON endpoint
- Added `/generate-certificate-json` endpoint for ICA compatibility
- Original `/generate-certificate` endpoint still available for direct downloads

---

*Last Updated: April 12, 2026*