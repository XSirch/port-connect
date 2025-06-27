# 🚀 PortConnect Production Deployment Guide

This guide provides step-by-step instructions for deploying PortConnect to production.

## 📋 Pre-deployment Checklist

### ✅ Code Preparation
- [x] All console.log statements removed
- [x] Debug buttons and development tools removed
- [x] Test pages and development artifacts cleaned up
- [x] Database schema consolidated into single file
- [x] Documentation updated in English
- [x] Production build tested successfully

### ✅ Environment Setup
- [ ] Production Supabase project created
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Domain/hosting platform selected

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for project initialization (2-3 minutes)
4. Note down your project URL and anon key

### 2. Deploy Database Schema
1. Open Supabase SQL Editor
2. Copy the entire content from `supabase-schema.sql`
3. Execute the SQL script
4. Verify all tables, triggers, and policies are created

### 3. Verify Sample Data
The schema includes sample data for testing:
- 8 ports (Santos, Rotterdam, Singapore, etc.)
- 12 users (4 captains, 4 providers, 4 terminal operators)
- 8 services across different ports
- 4 sample reservations with different approval states

## 🔧 Environment Configuration

### Production Environment Variables
Create a `.env.production` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# App Configuration
VITE_APP_NAME=PortConnect
VITE_APP_VERSION=1.0.0
VITE_APP_TITLE=PortConnect
VITE_APP_DESCRIPTION=Modern Port Management Platform

# Production Configuration
NODE_ENV=production
```

### Security Considerations
- Never commit `.env` files to version control
- Use different Supabase projects for development and production
- Enable Row Level Security (RLS) policies (included in schema)
- Configure proper CORS settings in Supabase

## 🏗️ Build Process

### 1. Install Dependencies
```bash
npm ci --production
```

### 2. Build for Production
```bash
npm run build
```

### 3. Verify Build
```bash
npm run preview
# Test at http://localhost:4173
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

#### Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Netlify

#### Drag & Drop Deployment
1. Build the project locally: `npm run build`
2. Drag the `dist` folder to Netlify deploy page
3. Configure environment variables in Netlify dashboard

#### Git Integration
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Option 3: Static Hosting

#### Any Static Host (AWS S3, GitHub Pages, etc.)
1. Build the project: `npm run build`
2. Upload the `dist` folder contents to your hosting provider
3. Configure environment variables through your hosting platform

## 🔍 Post-Deployment Verification

### 1. Functional Testing
- [ ] User registration and login
- [ ] Role-based access control
- [ ] Service creation and management
- [ ] Reservation creation and approval workflow
- [ ] Dual approval system (terminal + provider)
- [ ] Real-time updates
- [ ] Responsive design on mobile devices

### 2. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile performance optimized
- [ ] Database query performance

### 3. Security Testing
- [ ] RLS policies working correctly
- [ ] Authentication flows secure
- [ ] No sensitive data exposed in client
- [ ] HTTPS enabled

## 🔧 Production Monitoring

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics or Plausible
- **Uptime Monitoring**: UptimeRobot
- **Performance**: Lighthouse CI

### Supabase Monitoring
- Monitor database performance in Supabase dashboard
- Set up alerts for high CPU/memory usage
- Monitor API usage and rate limits

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm ci
npm run build
```

#### Environment Variable Issues
- Ensure all VITE_ prefixed variables are set
- Verify Supabase URL and key are correct
- Check for typos in variable names

#### Database Connection Issues
- Verify Supabase project is active
- Check RLS policies are not blocking access
- Ensure anon key has correct permissions

#### Authentication Issues
- Verify email confirmation is configured in Supabase
- Check redirect URLs in Supabase auth settings
- Ensure proper session management

## 📊 Performance Optimization

### Already Implemented
- Code splitting with manual chunks
- Tree shaking for unused code
- CSS optimization with Tailwind
- Image optimization
- Gzip compression
- Console.log removal in production

### Additional Optimizations
- Enable CDN for static assets
- Configure proper caching headers
- Implement service worker for offline support
- Add image lazy loading for large datasets

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Production Build](https://reactjs.org/docs/optimizing-performance.html)

### Community
- [Supabase Discord](https://discord.supabase.com/)
- [React Community](https://reactjs.org/community/support.html)

---

**🎉 PortConnect is now ready for production deployment!**

For additional support or questions, please refer to the project documentation or create an issue in the repository.
