# 🚀 Questify Frontend Deployment Guide (Vercel)

## Prerequisites
- [Vercel Account](https://vercel.com/signup) (free tier available)
- Git repository for your frontend
- Backend deployed to Heroku (see backend deployment guide)

## Step 1: Get Your Backend URL

From your Heroku backend deployment, you should have a URL like:
`https://questify-backend.herokuapp.com`

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your frontend Git repository
4. Vercel will auto-detect it's a Vite project

#### Configure Build Settings:
5. **Framework Preset**: Vite
6. **Build Command**: `npm run build` (auto-detected)
7. **Output Directory**: `dist` (auto-detected)
8. **Install Command**: `npm install` (auto-detected)

#### Add Environment Variables:
9. Click **Environment Variables**
10. Add this variable:
    - **Name**: `VITE_API_URL`
    - **Value**: `https://your-backend-app.herokuapp.com/api`
    - **Environment**: Production, Preview, Development (select all)

11. Click **Deploy**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd c:\Users\aabir\OneDrive\Desktop\Questify\Questify-frontend\frontend

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Set environment variable
vercel env add VITE_API_URL
# When prompted, enter: https://your-backend-app.herokuapp.com/api
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

## Step 3: Update Backend CORS

After your frontend is deployed, you'll get a Vercel URL like:
`https://questify-frontend.vercel.app`

Update your backend's `FRONTEND_URL` environment variable:

```bash
# Using Heroku CLI
heroku config:set FRONTEND_URL="https://questify-frontend.vercel.app"

# Or via Heroku Dashboard:
# Settings → Config Vars → Add FRONTEND_URL
```

## Step 4: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to register/login
3. Check browser console for any errors
4. Verify API calls are going to your Heroku backend

## Automatic Deployments

Vercel automatically deploys when you push to your Git repository:
- **Push to main/master** → Production deployment
- **Push to other branches** → Preview deployment

## Environment Variables for Different Environments

### Local Development (.env file)
```env
VITE_API_URL=http://localhost:3000/api
```

### Vercel Production
```env
VITE_API_URL=https://your-backend-app.herokuapp.com/api
```

## Troubleshooting

### API calls failing (CORS errors)
1. Check browser console for exact error
2. Verify `VITE_API_URL` is set correctly in Vercel
3. Verify `FRONTEND_URL` is set correctly in Heroku backend
4. Check backend CORS configuration allows your Vercel domain

### Environment variables not working
- Vercel requires `VITE_` prefix for Vite environment variables
- Redeploy after adding/changing environment variables
- Check: Project Settings → Environment Variables

### 404 errors on page refresh
- The `vercel.json` file handles this (already created)
- Ensures all routes redirect to `index.html` for client-side routing

### Build fails
```bash
# Test build locally first
npm run build

# Check for errors
# Common issues: missing dependencies, TypeScript errors
```

## Useful Commands

```bash
# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove [deployment-url]

# View environment variables
vercel env ls
```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` in Heroku backend to your custom domain

## Next Steps

After both deployments:
1. ✅ Test complete user flows (registration, login, assignments)
2. ✅ Verify file uploads work
3. ✅ Test admin functionality
4. ✅ Monitor logs for any errors

## Future Deployments

**Super easy!** Just push to your Git repositories:

```bash
# Frontend changes
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys! ✨

# Backend changes
git add .
git commit -m "Update backend"
git push origin main
# Heroku auto-deploys (if auto-deploy enabled)! ✨
```

That's it! Your app is live and future updates are automatic! 🎉
