# VisualCraft Studio - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your code pushed to a GitHub repository

### 2. Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/visualcraft-studio)

#### Option B: Manual Deployment

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "visualcraft-studio" repository

3. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Build Command: `npm run vercel-build`
   - Output Directory: `build`
   - Install Command: `npm install`

### 3. Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
CORS_ORIGIN=https://your-project-name.vercel.app
NODE_ENV=production
```

### 4. Domain Configuration

#### Custom Domain (Optional)
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain: `visualcraft-studio.com`
3. Configure DNS records as instructed by Vercel

#### Default Vercel Domain
Your app will be available at: `https://your-project-name.vercel.app`

### 5. API Routes Configuration

Vercel automatically handles these API routes:
- `/api/crawl` - Image discovery
- `/api/ai/blend-images` - AI image blending
- `/api/ai/generate-image` - AI image generation
- `/api/health` - Health check

### 6. Performance Optimizations

#### Automatic Optimizations
- ✅ Global CDN
- ✅ Image optimization
- ✅ Automatic HTTPS
- ✅ Gzip compression
- ✅ Edge caching

#### Manual Optimizations
- Static assets cached for 1 year
- API responses cached appropriately
- Serverless functions with 30s timeout

### 7. Monitoring & Analytics

#### Built-in Analytics
- Real-time performance metrics
- Core Web Vitals tracking
- Function execution logs

#### Custom Monitoring
```javascript
// Add to your React components
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 8. Deployment Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### 9. Troubleshooting

#### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
vercel --force

# Check build logs in Vercel dashboard
```

**API Errors:**
- Verify environment variables are set
- Check function logs in Vercel dashboard
- Ensure serverless function timeout is sufficient

**CORS Issues:**
- Update CORS_ORIGIN environment variable
- Check API route CORS headers

#### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [React Deployment Guide](https://vercel.com/guides/deploying-react-with-vercel)
- [Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)

### 10. Cost Optimization

#### Free Tier Limits
- 100GB bandwidth/month
- 100 serverless function executions/day
- 1000 serverless function executions/month
- 6000 build minutes/month

#### Pro Tier Benefits ($20/month)
- 1TB bandwidth/month
- Unlimited serverless executions
- Advanced analytics
- Team collaboration

### 11. Security Best Practices

```javascript
// Add security headers
export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Your API logic here
}
```

### 12. Continuous Deployment

Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Every push to other branches → Preview
- ✅ Every pull request → Preview

---

## 🎯 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test image discovery functionality
- [ ] Test AI blending features
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Test accessibility features
- [ ] Monitor Core Web Vitals
- [ ] Set up custom domain (optional)
- [ ] Configure environment variables
- [ ] Test API endpoints

---

**Your VisualCraft Studio is now live! 🚀**

Share your creation: `https://your-project-name.vercel.app`