# Vistagram Deployment Guide

This guide will help you deploy your Vistagram application to various hosting platforms.

## Prerequisites

1. **MongoDB Database**: You'll need a MongoDB database (MongoDB Atlas recommended)
2. **Firebase Project** (optional): For authentication features
3. **Environment Variables**: Prepare your `.env` file

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/vistagram?retryWrites=true&w=majority
MONGODB_DB_NAME=vistagram

# API Configuration
VITE_API_BASE_URL=https://your-backend-url.com

# Firebase Configuration (if using Firebase)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Backend Deployment on Railway

1. **Sign up** at [Railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Create a new project** and select your repository
4. **Set environment variables**:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB_NAME`: vistagram
   - `PORT`: 3001
5. **Deploy** - Railway will automatically detect the Node.js app
6. **Get your backend URL** (e.g., `https://your-app.railway.app`)

#### Frontend Deployment on Vercel

1. **Sign up** at [Vercel.com](https://vercel.com)
2. **Import your GitHub repository**
3. **Configure the project**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Set environment variables**:
   - `VITE_API_BASE_URL`: Your Railway backend URL
   - All Firebase variables (if using Firebase)
5. **Deploy** - Vercel will automatically build and deploy

### Option 2: Render (Full-Stack)

1. **Sign up** at [Render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - Name: `vistagram-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm run server`
5. **Set environment variables** (same as above)
6. **Deploy**

For the frontend:
1. **Create a new Static Site**
2. **Configure**:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. **Set environment variables** (same as above)
4. **Deploy**

### Option 3: Netlify (Frontend) + Railway (Backend)

#### Backend: Same as Option 1

#### Frontend on Netlify

1. **Sign up** at [Netlify.com](https://netlify.com)
2. **Import your GitHub repository**
3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Set environment variables** (same as above)
5. **Deploy**

### Option 4: Docker Deployment

If you prefer containerized deployment:

```bash
# Build the Docker image
docker build -t vistagram .

# Run the container
docker run -p 3001:3001 \
  -e MONGODB_URI=your_mongodb_uri \
  -e MONGODB_DB_NAME=vistagram \
  vistagram
```

## Post-Deployment Steps

1. **Test your application**:
   - Check if the frontend loads correctly
   - Test API endpoints
   - Verify database connections
   - Test photo upload functionality

2. **Set up custom domain** (optional):
   - Configure DNS settings
   - Set up SSL certificates (usually automatic)

3. **Monitor your application**:
   - Check logs for errors
   - Monitor performance
   - Set up alerts if needed

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure your backend URL is correctly set in `VITE_API_BASE_URL`
   - Check that CORS is properly configured in your server

2. **MongoDB Connection Issues**:
   - Verify your MongoDB URI is correct
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure the database name is correct

3. **Build Failures**:
   - Check if all dependencies are installed
   - Verify Node.js version compatibility
   - Check for TypeScript errors

4. **Photo Upload Issues**:
   - Verify file size limits
   - Check if the upload endpoint is accessible
   - Ensure proper file permissions

### Environment Variables Checklist

Before deploying, ensure you have:

- [ ] MongoDB connection string
- [ ] Database name
- [ ] Backend URL (for frontend)
- [ ] Firebase configuration (if using)
- [ ] All required API keys

## Support

If you encounter issues:

1. Check the deployment platform's documentation
2. Review application logs
3. Test locally with the same environment variables
4. Verify all environment variables are set correctly

## Performance Optimization

After deployment:

1. **Enable caching** for static assets
2. **Optimize images** before upload
3. **Monitor database performance**
4. **Set up CDN** for better global performance
