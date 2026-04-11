# Deployment Guide

This guide covers deploying the IBM Certificate Generator API to Render and other platforms.

## 📦 Prerequisites

- GitHub account
- Render account (free tier available at https://render.com)
- Git installed locally

## 🚀 Deploy to Render

### Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: IBM Certificate Generator API"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/ibm-certificate-generator.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. Go to https://render.com and sign in
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to deploy

#### Option B: Manual Setup

1. Go to https://render.com and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: ibm-certificate-generator
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add environment variable:
   - Key: `NODE_ENV`
   - Value: `production`

6. Click "Create Web Service"

### Step 3: Verify Deployment

Once deployed, Render will provide a URL like:
```
https://ibm-certificate-generator.onrender.com
```

Test the deployment:

1. Health check:
```bash
curl https://your-app.onrender.com/health
```

2. Generate a test certificate:
```bash
curl -X POST https://your-app.onrender.com/generate-certificate \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","date":"2026-04-11","purpose":"Testing deployment"}' \
  --output test-certificate.png
```

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect the push
2. Build the application
3. Deploy the new version
4. Run health checks

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Go to your service settings on Render
2. Click "Custom Domain"
3. Add your domain
4. Update your DNS records as instructed
5. Render will automatically provision SSL certificate

## 📊 Monitoring

### Render Dashboard

Monitor your service:
- Logs: Real-time application logs
- Metrics: CPU, memory usage
- Events: Deployment history

### Health Checks

Render automatically monitors `/health` endpoint:
- Frequency: Every 30 seconds
- Timeout: 30 seconds
- Failure threshold: 3 consecutive failures

## 🔧 Environment Variables

Add environment variables in Render dashboard:

1. Go to service settings
2. Click "Environment"
3. Add variables:
   - `NODE_ENV=production` (already set)
   - Add any future variables as needed

## 💰 Pricing

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month of runtime

### Paid Plans
- Starter ($7/month): Always on, no spin-down
- Standard ($25/month): More resources, better performance

## 🐛 Troubleshooting

### Build Failures

Check build logs in Render dashboard. Common issues:

1. **Missing dependencies**: Ensure all dependencies are in `package.json`
2. **Node version**: Verify `engines` field in `package.json`
3. **Canvas installation**: Canvas requires system dependencies (automatically handled by Render)

### Runtime Errors

Check application logs:

1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab

### Slow First Request

Free tier services spin down after inactivity. Solutions:

1. Upgrade to paid plan
2. Use a service like UptimeRobot to ping your API every 10 minutes
3. Accept the cold start delay

## 🔐 Security Best Practices

1. **HTTPS**: Render provides free SSL certificates
2. **Environment Variables**: Never commit sensitive data to git
3. **CORS**: Currently allows all origins; restrict in production if needed
4. **Rate Limiting**: Consider adding for production use

## 📈 Scaling

### Horizontal Scaling

Render supports multiple instances:

1. Go to service settings
2. Increase instance count
3. Render handles load balancing automatically

### Vertical Scaling

Upgrade to plans with more resources:
- More CPU
- More RAM
- Better performance

## 🔄 Rollback

To rollback to a previous version:

1. Go to Render dashboard
2. Click "Events" tab
3. Find the previous successful deployment
4. Click "Rollback"

## 📝 Post-Deployment Checklist

- [ ] Verify health endpoint responds
- [ ] Test certificate generation
- [ ] Check application logs for errors
- [ ] Update README with production URL
- [ ] Test from Postman/SoapUI
- [ ] Configure monitoring/alerts
- [ ] Set up custom domain (optional)
- [ ] Document API URL for team

## 🌍 Alternative Deployment Options

### Vercel

```bash
npm install -g vercel
vercel
```

### Heroku

```bash
heroku create ibm-certificate-generator
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Railway auto-detects Node.js
3. Deploy automatically

### AWS Lambda (Serverless)

Requires additional configuration with serverless framework or AWS SAM.

### Google Cloud Run

```bash
gcloud run deploy ibm-certificate-generator \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📞 Support

For deployment issues:
- Render Support: https://render.com/docs
- GitHub Issues: Create an issue in your repository
- Community: Render Community Forum

## 🎯 Next Steps

After successful deployment:

1. Update README.md with production URL
2. Share API documentation with team
3. Set up monitoring and alerts
4. Configure rate limiting if needed
5. Implement API key authentication for production use
6. Set up automated testing
7. Configure CI/CD pipeline