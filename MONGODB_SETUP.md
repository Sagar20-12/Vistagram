# MongoDB Setup for Photo Uploads

This guide will help you set up MongoDB for photo uploads in your Vistagram application.

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster:
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"
4. Set up database access:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Select "Read and write to any database"
   - Click "Add User"
5. Set up network access:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"
6. Get your connection string:
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### Option B: Local MongoDB

1. Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Your connection string will be: `mongodb://localhost:27017`

## Step 2: Set Up Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/vistagram?retryWrites=true&w=majority
MONGODB_DB_NAME=vistagram

# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Firebase Configuration (if you're using both)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual MongoDB connection string and other credentials.

## Step 3: Install Dependencies

The required dependencies are already installed:

```bash
npm install mongodb multer express cors dotenv
npm install -D @types/multer @types/express @types/cors
```

## Step 4: Start the Backend Server

1. Open a new terminal in your project directory
2. Start the MongoDB server:

```bash
node server/index.js
```

The server will start on port 3001 by default. You should see:
```
Connected to MongoDB successfully
Server running on port 3001
Health check: http://localhost:3001/api/health
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Sign in to your application
3. Try uploading a photo using the "Start capturing" button
4. Check the browser console for any errors
5. Verify the photo appears in your MongoDB database

## Step 6: Database Schema

The application uses the following MongoDB collections:

### Photos Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  data: Buffer, // Binary image data
  caption: String,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection (for future use)
```javascript
{
  _id: ObjectId,
  firebaseUid: String,
  username: String,
  email: String,
  profilePicture: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection (for future use)
```javascript
{
  _id: ObjectId,
  userId: String,
  photoId: String,
  caption: String,
  location: String,
  likes: Number,
  shares: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Step 7: API Endpoints

The server provides the following endpoints:

- `POST /api/photos/upload` - Upload a new photo
- `GET /api/photos/:id` - Get a photo by ID
- `GET /api/photos/user/:userId` - Get all photos for a user
- `DELETE /api/photos/:id` - Delete a photo
- `GET /api/health` - Health check

## Step 8: Security Considerations

1. **File Size Limits**: Set to 5MB in the server configuration
2. **File Type Validation**: Only image files are allowed
3. **User Authentication**: Only authenticated users can upload
4. **User Isolation**: Users can only access their own photos
5. **Input Validation**: All inputs are validated on the server

## Troubleshooting

### Common Issues:

1. **"MongoDB not connected" error**:
   - Check your connection string in `.env`
   - Ensure MongoDB Atlas cluster is running
   - Check network access settings in Atlas

2. **Upload fails**:
   - Check browser console for errors
   - Verify server is running on port 3001
   - Check server console for errors
   - Ensure user is authenticated

3. **Photos not displaying**:
   - Check if server is running
   - Verify photo URLs in browser network tab
   - Check MongoDB database for photo records

4. **CORS errors**:
   - Server is configured to allow all origins in development
   - For production, configure specific origins

### Getting Help:

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

## Next Steps

After setting up MongoDB:

1. **User Profiles**: Store user profile data in the users collection
2. **Comments & Likes**: Add social features using the posts collection
3. **Search**: Implement full-text search with MongoDB Atlas Search
4. **Real-time Updates**: Use WebSockets for real-time features
5. **Analytics**: Track usage with MongoDB Charts
6. **Backup**: Set up automated backups in MongoDB Atlas

## Production Deployment

For production deployment:

1. **Environment Variables**: Use proper environment variables for production
2. **CORS**: Configure specific origins instead of allowing all
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **File Storage**: Consider using cloud storage (AWS S3, Google Cloud Storage) for large files
5. **CDN**: Use a CDN for serving images
6. **Monitoring**: Set up monitoring and logging

Your Vistagram app now has a robust photo upload system powered by MongoDB! 🚀
