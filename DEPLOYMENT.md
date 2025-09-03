# NutriForge Pro - Deployment Guide

## 🚀 Deployment Overview

NutriForge Pro supports multiple deployment strategies for different enterprise environments, from single-tenant on-premises to multi-tenant cloud deployments.

## 🏗️ Deployment Architecture

### Cloud-Native Architecture
```text
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                            │
├─────────────────────────────────────────────────────────────┤
│ AWS ALB │ Azure Load Balancer │ GCP Load Balancer          │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 Application Tier                            │
├─────────────────────────────────────────────────────────────┤
│ Container Orchestration (Kubernetes/ECS/AKS/GKE)          │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Data Tier                                 │
├─────────────────────────────────────────────────────────────┤
│ Database │ Cache │ Object Storage │ Message Queue          │
└─────────────────────────────────────────────────────────────┘
```text

## 🐳 Container Deployment

### Docker Configuration
```dockerfile
# Production Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```text

### Docker Compose (Development)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=https://api.nutriforge.com
    volumes:
      - ./logs:/var/log/nginx
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      
volumes:
  redis_data:
```text

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nutriforge-pro
  labels:
    app: nutriforge-pro
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nutriforge-pro
  template:
    metadata:
      labels:
        app: nutriforge-pro
    spec:
      containers:
      - name: nutriforge-pro
        image: nutriforge/nutriforge-pro:1.0.0
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        - name: REACT_APP_API_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: api-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: nutriforge-pro-service
spec:
  selector:
    app: nutriforge-pro
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```text

## ☁️ Cloud Platform Deployments

### AWS Deployment

#### ECS with Fargate
```json
{
  "family": "nutriforge-pro",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "nutriforge-pro",
      "image": "nutriforge/nutriforge-pro:1.0.0",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nutriforge-pro",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```text

#### CloudFormation Template
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'NutriForge Pro Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      SecurityGroups: [!Ref ALBSecurityGroup]
      Subnets: [!Ref PublicSubnet1, !Ref PublicSubnet2]
      
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub 'nutriforge-pro-${Environment}'
      
  ECSService:
    Type: AWS::ECS::Service
    Properties:
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref TaskDefinition
      DesiredCount: 3
      LaunchType: FARGATE
```text

### Azure Deployment

#### Container Instances
```bash
# Create resource group
az group create --name nutriforge-pro-rg --location eastus

# Create container instance
az container create \
  --resource-group nutriforge-pro-rg \
  --name nutriforge-pro \
  --image nutriforge/nutriforge-pro:1.0.0 \
  --cpu 2 \
  --memory 4 \
  --ports 80 \
  --environment-variables NODE_ENV=production \
  --dns-name-label nutriforge-pro
```text

#### Azure Kubernetes Service (AKS)
```bash
# Create AKS cluster
az aks create \
  --resource-group nutriforge-pro-rg \
  --name nutriforge-pro-aks \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group nutriforge-pro-rg --name nutriforge-pro-aks

# Deploy application
kubectl apply -f k8s/
```text

### Google Cloud Platform

#### Cloud Run Deployment
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/nutriforge-pro

# Deploy to Cloud Run
gcloud run deploy nutriforge-pro \
  --image gcr.io/PROJECT_ID/nutriforge-pro \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 10
```text

#### GKE Deployment
```bash
# Create GKE cluster
gcloud container clusters create nutriforge-pro-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autorepair \
  --enable-autoupgrade

# Deploy application
kubectl apply -f k8s/
```text

## 🔧 Environment Configuration

### Environment Variables
```bash
# Production Environment
NODE_ENV=production
REACT_APP_API_URL=https://api.nutriforge.com
REACT_APP_VERSION=1.0.0

# Security
REACT_APP_CSP_NONCE=random_nonce_value
REACT_APP_API_KEY=your_api_key_here

# Analytics
REACT_APP_ANALYTICS_ID=GA_MEASUREMENT_ID
REACT_APP_SENTRY_DSN=SENTRY_DSN_URL

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_REPORTING=true
REACT_APP_ENABLE_INTEGRATIONS=true
```text

### Configuration Management
```typescript
// config/production.ts
export const productionConfig = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL,
    timeout: 30000,
    retryAttempts: 3
  },
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true
  },
  monitoring: {
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true
  },
  features: {
    enableAdvancedMode: true,
    enableReporting: true,
    enableIntegrations: true
  }
}
```text

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
      - run: npm run type-check

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security audit
        run: npm audit --audit-level high
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Build Docker image
        run: docker build -t nutriforge/nutriforge-pro:${{ github.sha }} .
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push nutriforge/nutriforge-pro:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/nutriforge-pro nutriforge-pro=nutriforge/nutriforge-pro:${{ github.sha }}
          kubectl rollout status deployment/nutriforge-pro
```text

### GitLab CI/CD
```yaml
stages:
  - test
  - security
  - build
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test:coverage
    - npm run lint
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

security:
  stage: security
  image: node:18
  script:
    - npm audit --audit-level high
    - npx snyk test

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE

deploy:
  stage: deploy
  image: kubectl:latest
  script:
    - kubectl set image deployment/nutriforge-pro nutriforge-pro=$DOCKER_IMAGE
    - kubectl rollout status deployment/nutriforge-pro
  only:
    - main
```text

## 📊 Monitoring & Observability

### Health Checks
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: checkDatabase(),
      cache: checkCache(),
      external_apis: checkExternalAPIs()
    }
  }
  
  res.status(200).json(health)
})
```text

### Prometheus Metrics
```typescript
// metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client'

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
})

export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
})
```text

### Logging Configuration
```typescript
// logging.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nutriforge-pro' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```text

## 🔒 Security Hardening

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name nutriforge.com www.nutriforge.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nutriforge.com www.nutriforge.com;
    
    ssl_certificate /etc/ssl/certs/nutriforge.crt;
    ssl_certificate_key /etc/ssl/private/nutriforge.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```text

## 📈 Scaling Strategies

### Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nutriforge-pro-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nutriforge-pro
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```text

### Cluster Autoscaler
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-status
  namespace: kube-system
data:
  nodes.max: "100"
  nodes.min: "3"
  scale-down-delay-after-add: "10m"
  scale-down-unneeded-time: "10m"
```text

## 🚨 Disaster Recovery

### Backup Strategy
```bash
#!/bin/bash
# backup.sh - Automated backup script

# Database backup
kubectl exec -n production deployment/postgres -- pg_dump -U postgres nutriforge > backup-$(date +%Y%m%d).sql

# Configuration backup
kubectl get configmaps -o yaml > configmaps-backup-$(date +%Y%m%d).yaml
kubectl get secrets -o yaml > secrets-backup-$(date +%Y%m%d).yaml

# Upload to cloud storage
aws s3 cp backup-$(date +%Y%m%d).sql s3://nutriforge-backups/
aws s3 cp configmaps-backup-$(date +%Y%m%d).yaml s3://nutriforge-backups/
aws s3 cp secrets-backup-$(date +%Y%m%d).yaml s3://nutriforge-backups/
```text

### Recovery Procedures
1. **Infrastructure Recovery** - Restore from Infrastructure as Code
2. **Data Recovery** - Restore from latest backup
3. **Configuration Recovery** - Apply saved configurations
4. **Validation** - Run health checks and tests
5. **Traffic Restoration** - Gradually restore user traffic

---

For deployment support, contact our DevOps team at devops@nutriforge.com
