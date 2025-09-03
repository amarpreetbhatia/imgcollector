# 🚀 CollageForge Render Deployment Guide

This guide will help you deploy CollageForge to Render with both frontend and backend services.

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Environment Variables**: Prepare your API keys (optional)

## 🔧 Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. **Connect GitHub to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**
   - In Render dashboard, go to each service
   - Add environment variables:
     ```
     REACT_APP_PRINTFUL_API_KEY=your_printful_key_here (optional)
     REACT_APP_PRINT_ORDER_EMAIL=orders@yourdomain.com (optional)
     ```

3. **Deploy**
   - Render will automatically build and deploy both services
   - Frontend will be available at: `https://collageforge-frontend.onrender.com`
   - Backend will be available at: `https://collageforge-backend.onrender.com`

### Option 2: Manual Service Creation

#### Backend Service
1. **Create Web Service**
   - Service Type: `Web Service`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: `Node`

2. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

#### Frontend Service
1. **Create Static Site**
   - Service Type: `Static Site`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

2. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_PRINTFUL_API_KEY=your_key_here (optional)
   REACT_APP_PRINT_ORDER_EMAIL=orders@yourdomain.com (optional)
   ```

## 🔍 Service Configuration Details

### Backend Service (`collageforge-backend`)
- **Plan**: Starter (Free tier available)
- **Runtime**: Node.js
- **Port**: 10000 (Render default)
- **Health Check**: `/health` endpoint
- **Auto-Deploy**: On git push

### Frontend Service (`collageforge-frontend`)
- **Plan**: Starter (Free tier available)
- **Type**: Static Site
- **Build**: React production build
- **CDN**: Global distribution
- **Auto-Deploy**: On git push

## 🌐 Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to service settings in Render
   - Add your domain (e.g., `collageforge.com`)
   - Update DNS records as instructed

2. **SSL Certificate**
   - Render provides free SSL certificates
   - Automatically configured for custom domains

## 📊 Monitoring & Logs

### Health Checks
- Backend: `https://your-backend-url.onrender.com/health`
- Frontend: Automatic static site monitoring

### Logs
- View real-time logs in Render dashboard
- Monitor performance and errors
- Set up alerts for downtime

## 🔧 Environment Variables Reference

### Required
- `NODE_ENV`: Set to `production` for backend
- `CORS_ORIGIN`: Frontend URL for CORS configuration

### Optional
- `REACT_APP_PRINTFUL_API_KEY`: For print service integration
- `REACT_APP_PRINT_ORDER_EMAIL`: Fallback email for orders

## 🚀 Performance Optimization

### Backend Optimizations
- ✅ CORS properly configured
- ✅ Request size limits set
- ✅ Error handling implemented
- ✅ Graceful shutdown handling

### Frontend Optimizations
- ✅ Production React build
- ✅ Static asset optimization
- ✅ CDN distribution via Render
- ✅ Environment-based API URLs

## 🔄 Continuous Deployment

### Automatic Deployments
- **Trigger**: Git push to main branch
- **Backend**: Rebuilds and restarts service
- **Frontend**: Rebuilds and updates static files

### Manual Deployments
- Use Render dashboard to trigger manual deploys
- Useful for testing or rollbacks

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` is set correctly
   - Check frontend URL matches CORS configuration

2. **API Connection Issues**
   - Verify `REACT_APP_API_URL` points to backend service
   - Check backend service is running and healthy

3. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

### Debug Commands
```bash
# Test backend locally
cd server && npm start

# Test frontend build
npm run build

# Check environment variables
echo $REACT_APP_API_URL
```

## 📈 Scaling

### Free Tier Limits
- **Backend**: 750 hours/month, sleeps after 15min inactivity
- **Frontend**: Unlimited static hosting
- **Bandwidth**: 100GB/month

### Paid Plans
- **Starter**: $7/month, no sleep, more resources
- **Standard**: $25/month, enhanced performance
- **Pro**: $85/month, dedicated resources

## 🎉 Success!

Once deployed, your CollageForge application will be available at:
- **Frontend**: `https://collageforge-frontend.onrender.com`
- **Backend API**: `https://collageforge-backend.onrender.com`

Users can now:
- ✅ Discover images from any website
- ✅ Create custom collages with text overlays
- ✅ Download high-quality images
- ✅ Order professional prints

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node-version)
- [Static Sites on Render](https://render.com/docs/static-sites)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**Need Help?** Check the [Render Community](https://community.render.com) or [GitHub Issues](https://github.com/your-repo/issues) for support.