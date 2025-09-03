# NutriForge Pro - API Documentation

## 🚀 API Overview

NutriForge Pro provides a comprehensive RESTful API for enterprise integration and third-party applications.

**Base URL**: `https://api.nutriforge.com/v1`
**Authentication**: Bearer Token / API Key
**Rate Limiting**: 1000 requests/hour (Enterprise: 10,000/hour)

## 🔐 Authentication

### API Key Authentication

```http
GET /api/v1/calculations
Authorization: Bearer YOUR_API_KEY
X-API-Version: 1.0
```

### OAuth 2.0 Flow

```http
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "scope": "calculations:read calculations:write"
}
```

## 📊 Core Endpoints

### Nutrition Calculations

#### Calculate Nutrition Plan

```http
POST /api/v1/calculations
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "client_id": "client_123",
  "metrics": {
    "gender": "male",
    "age": 30,
    "weight": 75,
    "height": 180,
    "body_fat_percentage": 15,
    "activity_level": "moderately_active"
  },
  "goals": ["bulk", "cut", "maintain"],
  "units": "metric"
}
```

**Response:**

```json
{
  "calculation_id": "calc_abc123",
  "client_id": "client_123",
  "timestamp": "2025-01-08T10:30:00Z",
  "results": {
    "body_composition": {
      "bmr": 1750,
      "tdee": 2625,
      "bmi": 23.1,
      "lean_body_mass": 63.75
    },
    "nutrition": {
      "bulk": {
        "calories": 3150,
        "protein": 165,
        "fat": 87,
        "carbs": 394
      },
      "cut": {
        "calories": 2363,
        "protein": 198,
        "fat": 66,
        "carbs": 295
      },
      "maintain": {
        "calories": 2625,
        "protein": 165,
        "fat": 73,
        "carbs": 328
      }
    },
    "hydration": {
      "maintenance": 2.6,
      "training": 3.8
    },
    "supplements": {
      "creatine": 5,
      "protein_powder": "as_needed",
      "multivitamin": 1
    }
  },
  "recommendations": [
    "Aim for 165g protein daily",
    "Maintain 2625 calories for weight maintenance",
    "Stay hydrated with 2.6-3.8L water daily"
  ]
}
```

#### Get Calculation History

```http
GET /api/v1/calculations?client_id=client_123&limit=10&offset=0
Authorization: Bearer YOUR_TOKEN
```

### Client Management

#### Create Client Profile

```http
POST /api/v1/clients
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "John Doe",
  "email": "john@example.com",
  "date_of_birth": "1993-05-15",
  "gender": "male",
  "medical_conditions": [],
  "dietary_restrictions": ["vegetarian"],
  "fitness_goals": ["muscle_gain", "fat_loss"]
}
```

#### Update Client Profile

```http
PUT /api/v1/clients/{client_id}
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "weight": 76,
  "body_fat_percentage": 14,
  "activity_level": "highly_active"
}
```

### Reports & Analytics

#### Generate Professional Report

```http
POST /api/v1/reports
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "calculation_id": "calc_abc123",
  "format": "pdf",
  "template": "clinical",
  "include_branding": true,
  "include_recommendations": true
}
```

**Response:**

```json
{
  "report_id": "report_xyz789",
  "download_url": "https://api.nutriforge.com/v1/reports/report_xyz789/download",
  "expires_at": "2025-01-15T10:30:00Z",
  "format": "pdf",
  "size_bytes": 245760
}
```

#### Get Analytics Data

```http
GET /api/v1/analytics/summary?period=30d&metrics=calculations,clients,reports
Authorization: Bearer YOUR_TOKEN
```

## 🔗 Integration Endpoints

### Webhook Management

#### Register Webhook

```http
POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "url": "https://your-app.com/webhooks/nutriforge",
  "events": ["calculation.completed", "client.updated"],
  "secret": "your_webhook_secret"
}
```

#### Webhook Event Example

```json
{
  "event": "calculation.completed",
  "timestamp": "2025-01-08T10:30:00Z",
  "data": {
    "calculation_id": "calc_abc123",
    "client_id": "client_123",
    "status": "completed"
  },
  "signature": "sha256=abc123..."
}
```

### EHR Integration (FHIR R4)

#### Create FHIR Observation

```http
POST /api/v1/fhir/Observation
Content-Type: application/fhir+json
Authorization: Bearer YOUR_TOKEN

{
  "resourceType": "Observation",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "vital-signs"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "33747-0",
      "display": "Body composition analysis"
    }]
  },
  "subject": {
    "reference": "Patient/patient_123"
  },
  "component": [
    {
      "code": { "coding": [{ "code": "BMI" }] },
      "valueQuantity": { "value": 23.1, "unit": "kg/m2" }
    }
  ]
}
```

## 📈 Monitoring & Health

### Health Check

```http
GET /api/v1/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "integrations": "healthy"
  },
  "metrics": {
    "uptime": 99.99,
    "response_time_ms": 45,
    "requests_per_minute": 150
  }
}
```

### API Metrics

```http
GET /api/v1/metrics
Authorization: Bearer YOUR_TOKEN
```

## 🚨 Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "weight",
      "issue": "must be between 30 and 300 kg"
    },
    "request_id": "req_abc123",
    "timestamp": "2025-01-08T10:30:00Z"
  }
}
```

### Error Codes

| Code               | HTTP Status | Description                       |
| ------------------ | ----------- | --------------------------------- |
| `VALIDATION_ERROR` | 400         | Invalid input parameters          |
| `UNAUTHORIZED`     | 401         | Invalid or missing authentication |
| `FORBIDDEN`        | 403         | Insufficient permissions          |
| `NOT_FOUND`        | 404         | Resource not found                |
| `RATE_LIMITED`     | 429         | Rate limit exceeded               |
| `INTERNAL_ERROR`   | 500         | Server error                      |

## 📋 Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641648000
X-RateLimit-Window: 3600
```

### Rate Limit Tiers

| Tier         | Requests/Hour | Burst Limit |
| ------------ | ------------- | ----------- |
| Free         | 100           | 10          |
| Professional | 1,000         | 50          |
| Enterprise   | 10,000        | 200         |
| Healthcare   | 25,000        | 500         |

## 🔒 Security

### Request Signing

```javascript
const crypto = require('crypto')
const signature = crypto
  .createHmac('sha256', API_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex')

headers['X-Signature'] = `sha256=${signature}`
```

### IP Whitelisting

Enterprise customers can restrict API access to specific IP addresses:

```http
POST /api/v1/security/ip-whitelist
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "ips": ["192.168.1.100", "10.0.0.0/8"],
  "description": "Office and VPN IPs"
}
```

## 📚 SDKs & Libraries

### JavaScript/Node.js

```bash
npm install @nutriforge/api-client
```

```javascript
const NutriForge = require('@nutriforge/api-client')
const client = new NutriForge({ apiKey: 'your_api_key' })

const result = await client.calculations.create({
  metrics: { gender: 'male', age: 30, weight: 75, height: 180 },
})
```

### Python

```bash
pip install nutriforge-api
```

```python
from nutriforge import NutriForgeClient

client = NutriForgeClient(api_key='your_api_key')
result = client.calculations.create(
    metrics={'gender': 'male', 'age': 30, 'weight': 75, 'height': 180}
)
```

## 🔄 Versioning

API versions are managed through URL versioning:

- Current: `/api/v1/`
- Beta: `/api/v2-beta/`

### Version Migration

When new versions are released, previous versions are supported for 12 months with deprecation notices.

---

For additional support, contact our API team at <api-support@nutriforge.com>
