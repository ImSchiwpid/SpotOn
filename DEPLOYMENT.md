# 🚀 SPOT-ON Deployment Guide

Complete guide for deploying SPOT-ON parking platform to production.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Razorpay production keys obtained
- [ ] SendGrid API key verified
- [ ] Cloudinary account configured
- [ ] Google OAuth credentials created (optional)
- [ ] Domain name purchased (optional)
- [ ] All environment variables documented

## 🗄️ MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier or paid plan

2. **Create Cluster**
   - Click "Build a Database"
   - Choose tier (M0 free for development)
   - Select region closest to your users
   - Name your cluster (e.g., "spoton-production")

3. **Create Database User**
   - Go to Database Access
   - Add new database user
   - Choose password authentication
   - Save credentials securely

4. **Configure Network Access**
   - Go to Network Access
   - Add IP Address
   - Allow access from anywhere: `0.0.0.0/0` (for production)
   - Or add specific IPs of your hosting servers

5. **Get Connection String**
   - Go to Database > Connect
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/spoton?retryWrites=true&w=majority`

## 🖥️ Backend Deployment (Render)

### Option 1: Via GitHub

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: spoton-backend
     Region: Choose closest to users
     Branch: main
     Root Directory: backend
     Runtime: Node
     Build Command: npm install
     Start Command: npm start
     ```

4. **Add Environment Variables**
   In Render dashboard, add all variables from `.env.example`:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-strong-random-string>
   JWT_EXPIRES_IN=7d
   RAZORPAY_KEY_ID=<your-production-key>
   RAZORPAY_KEY_SECRET=<your-production-secret>
   SENDGRID_API_KEY=<your-sendgrid-key>
   SENDGRID_FROM_EMAIL=<verified-email>
   SENDGRID_FROM_NAME=SPOT-ON Parking
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   FRONTEND_URL=<your-frontend-url>
   SESSION_SECRET=<generate-strong-random-string>
   GOOGLE_CLIENT_ID=<optional>
   GOOGLE_CLIENT_SECRET=<optional>
   GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL (e.g., `https://spoton-backend.onrender.com`)

### Option 2: Manual Deployment

1. **Install Render CLI** (if needed)
   ```bash
   npm install -g render-cli
   ```

2. **Deploy**
   ```bash
   render deploy
   ```

## 🌐 Frontend Deployment (Vercel)

### Option 1: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

3. **Create Production .env**
   Create `.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxx
   REACT_APP_SOCKET_URL=https://your-backend.onrender.com
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts
   - Choose project name
   - Production: Yes

5. **Add Environment Variables**
   ```bash
   vercel env add REACT_APP_API_URL production
   vercel env add REACT_APP_RAZORPAY_KEY production
   vercel env add REACT_APP_SOCKET_URL production
   ```

6. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Via Vercel Dashboard

1. **Connect GitHub**
   - Go to https://vercel.com
   - Import your repository

2. **Configure Project**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Get your production URL

## 🔧 Post-Deployment Configuration

### 1. Update Backend CORS

Ensure your backend allows your frontend URL:
```javascript
// backend/server.js
cors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
})
```

### 2. Update Google OAuth (if used)

In Google Cloud Console:
- Add production callback URL:
  `https://your-backend.onrender.com/api/auth/google/callback`
- Add authorized JavaScript origins:
  `https://your-frontend.vercel.app`

### 3. Razorpay Production Mode

1. Go to Razorpay Dashboard
2. Toggle to "Live Mode"
3. Generate new API keys
4. Update environment variables

### 4. SendGrid Domain Authentication

1. Go to SendGrid → Settings → Sender Authentication
2. Authenticate your domain
3. Add DNS records to your domain

### 5. Test Payment Flow

Use real card (small amount):
```
Card: Your actual credit/debit card
CVV: Your card CVV
```

## 📊 Monitoring & Logs

### Render Logs
- Go to your service dashboard
- Click "Logs" tab
- View real-time logs

### Vercel Logs
- Go to project dashboard
- Click "Deployments"
- View deployment logs

### MongoDB Monitoring
- Go to Atlas dashboard
- View metrics, slow queries
- Set up alerts

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong secrets (32+ characters)
   - Rotate secrets regularly

2. **Database**
   - Use strong database passwords
   - Enable network access restrictions
   - Regular backups

3. **API Keys**
   - Store securely in environment variables
   - Use different keys for dev/production
   - Monitor usage

4. **HTTPS**
   - Render provides automatic HTTPS
   - Vercel provides automatic HTTPS
   - Always use HTTPS in production

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: curl https://api.render.com/deploy/...

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 🐛 Troubleshooting

### Backend Issues

**Server won't start**
```bash
# Check logs on Render
# Common issues:
- Missing environment variables
- MongoDB connection failed
- Port already in use
```

**Database connection errors**
```bash
# Verify:
- MongoDB URI is correct
- Database user exists
- Network access configured
- Whitelist IP addresses
```

### Frontend Issues

**API calls failing**
```bash
# Check:
- REACT_APP_API_URL is correct
- CORS configured on backend
- Backend is running
```

**Build failures**
```bash
# Common issues:
- Missing dependencies
- Environment variables not set
- Build command incorrect
```

## 📈 Scaling Considerations

### Free Tier Limits

**Render Free**
- Web services sleep after 15 min inactivity
- 750 hours/month
- Consider upgrading for production

**Vercel Free**
- 100 GB bandwidth/month
- Unlimited deployments
- Good for most applications

**MongoDB Atlas Free (M0)**
- 512 MB storage
- Shared RAM
- Upgrade when needed

### Upgrade Path

1. **Render Starter ($7/month)**
   - No sleep
   - More resources

2. **Vercel Pro ($20/month)**
   - More bandwidth
   - Better performance

3. **MongoDB Atlas (M10+)**
   - Dedicated resources
   - Auto-scaling

## ✅ Deployment Verification

Test these after deployment:

- [ ] Homepage loads
- [ ] User registration works
- [ ] Login works
- [ ] Map displays correctly
- [ ] Search functionality works
- [ ] Booking flow completes
- [ ] Payment processes
- [ ] Email notifications send
- [ ] Real-time updates work
- [ ] Admin dashboard accessible
- [ ] Mobile responsive

## 🆘 Support

If issues persist:
1. Check Render/Vercel logs
2. Check MongoDB Atlas metrics
3. Verify all environment variables
4. Test locally first
5. Contact support

## 📝 Maintenance

Regular tasks:
- Monitor error logs
- Update dependencies monthly
- Backup database weekly
- Review security alerts
- Monitor performance metrics

---

**Deployment complete! 🎉**
