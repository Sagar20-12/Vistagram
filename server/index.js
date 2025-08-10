import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'vistagram';

let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Attempting to connect to MongoDB:', MONGODB_URI);
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database name:', DB_NAME);
    
    // Test the connection
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter check:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Root endpoint for basic health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Vistagram API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint - responds immediately
app.get('/api/health', (req, res) => {
  console.log('Health check requested at:', new Date().toISOString());
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Simple ping endpoint for basic connectivity
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Test endpoint to check database and photos
app.get('/api/test/photos', async (req, res) => {
  try {
    console.log('Test photos endpoint called');
    
    if (!db) {
      console.log('Database not connected');
      return res.json({ error: 'Database not connected' });
    }
    
    const photosCollection = db.collection('photos');
    const count = await photosCollection.countDocuments();
    const photos = await photosCollection.find({}, {
      projection: { _id: 1, filename: 1, createdAt: 1, size: 1, userId: 1 }
    }).limit(5).toArray();
    
    console.log('Database test results:', { count, photos });
    
    res.json({
      connected: true,
      photoCount: count,
      samplePhotos: photos
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.json({ error: error.message });
  }
});



// Upload photo endpoint with enhanced debugging
app.post('/api/photos/upload', upload.single('photo'), async (req, res) => {
  try {
    console.log('\n=== UPLOAD REQUEST START ===');
    console.log('Upload request received at:', new Date().toISOString());
    console.log('File received:', req.file ? 'YES' : 'NO');
    console.log('Request body:', req.body);
    
    if (req.file) {
      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        bufferLength: req.file.buffer ? req.file.buffer.length : 0
      });
    }
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, caption, location } = req.body;
    
    if (!userId) {
      console.log('❌ No user ID provided');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Database connection status:', db ? 'CONNECTED' : 'NOT CONNECTED');
    
    if (!db) {
      console.log('❌ Database not connected');
      return res.status(500).json({ error: 'Database not connected' });
    }

    const photosCollection = db.collection('photos');
    
    // Create photo document
    const photoDoc = {
      userId,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      caption: caption || '',
      location: location || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Photo document to insert:', {
      userId: photoDoc.userId,
      filename: photoDoc.filename,
      mimetype: photoDoc.mimetype,
      size: photoDoc.size,
      caption: photoDoc.caption,
      location: photoDoc.location,
      hasData: !!photoDoc.data,
      dataLength: photoDoc.data ? photoDoc.data.length : 0
    });
    
    // Insert photo into database
    console.log('Inserting photo into database...');
    const result = await photosCollection.insertOne(photoDoc);
    console.log('✅ Photo inserted successfully with ID:', result.insertedId);
    
    // Create a post from the uploaded photo
    const postsCollection = db.collection('posts');
    const postDoc = {
      userId,
      photoId: result.insertedId.toString(),
      photoUrl: `/api/photos/${result.insertedId}`,
      caption: caption || '',
      location: location || '',
      likes: 0,
      shares: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating post document...');
    const postResult = await postsCollection.insertOne(postDoc);
    console.log('✅ Post created successfully with ID:', postResult.insertedId);
    
    const responseUrl = `/api/photos/${result.insertedId}`;
    console.log('Response URL:', responseUrl);
    console.log('Full URL would be: http://localhost:' + PORT + responseUrl);
    
    console.log('=== UPLOAD REQUEST END ===\n');
    
    res.json({
      success: true,
      photoId: result.insertedId.toString(),
      url: responseUrl
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Debug photo endpoint - must be before the photo serving endpoint
app.get('/api/debug/photo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Debug photo request for ID:', id);
    
    if (!db) {
      return res.json({ error: 'Database not connected' });
    }
    
    if (!ObjectId.isValid(id)) {
      return res.json({ error: 'Invalid ObjectId format', id });
    }
    
    const photosCollection = db.collection('photos');
    const objectId = new ObjectId(id);
    
    const photo = await photosCollection.findOne(
      { _id: objectId },
      { projection: { data: 0 } } // Exclude binary data
    );
    
    if (!photo) {
      return res.json({ error: 'Photo not found', id });
    }
    
    res.json({
      found: true,
      photo: {
        _id: photo._id.toString(),
        filename: photo.filename,
        mimetype: photo.mimetype,
        userId: photo.userId,
        size: photo.size,
        createdAt: photo.createdAt,
        hasData: !!photo.data
      }
    });
  } catch (error) {
    console.error('Debug photo error:', error);
    res.json({ error: error.message });
  }
});

// Get photo by ID endpoint - Simplified and reliable
app.get('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Photo request for ID:', id);
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid photo ID format' });
    }
    
    const photosCollection = db.collection('photos');
    const objectId = new ObjectId(id);
    
    const photo = await photosCollection.findOne({ _id: objectId });
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    if (!photo.data) {
      return res.status(500).json({ error: 'Photo data missing' });
    }
    
    // Set proper headers
    res.set('Content-Type', photo.mimetype || 'image/jpeg');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=31536000');
    
    // Send the photo data
    res.send(photo.data);
    
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
});

// Get user photos endpoint
app.get('/api/photos/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Get user photos request for user:', userId);
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const photosCollection = db.collection('photos');
    const likesCollection = db.collection('likes');
    
    const photos = await photosCollection
      .find({ userId }, { projection: { data: 0 } }) // Exclude binary data
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${photos.length} photos for user ${userId}`);
    
    // Get like counts for each photo by finding the corresponding post
    const postsCollection = db.collection('posts');
    const photosWithUrls = await Promise.all(photos.map(async (photo) => {
      const photoId = photo._id.toString();
      
      // Find the post that corresponds to this photo
      const post = await postsCollection.findOne({ photoId: photoId });
      const postId = post ? post._id.toString() : null;
      
      // Get like count for the post
      const likeCount = postId ? await likesCollection.countDocuments({ postId: postId }) : 0;
      
      return {
        id: photoId,
        postId: postId, // Include postId for like functionality
        url: `/api/photos/${photo._id}`,
        caption: photo.caption,
        location: photo.location,
        createdAt: photo.createdAt,
        filename: photo.filename,
        likes: likeCount
      };
    }));
    
    res.json(photosWithUrls);
  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({ error: 'Failed to get user photos' });
  }
});

// Delete photo endpoint
app.delete('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    console.log('Delete photo request:', { id, userId });
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const photosCollection = db.collection('photos');
    const result = await photosCollection.deleteOne({
      _id: new ObjectId(id),
      userId
    });
    
    console.log('Photo delete result:', result);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Photo not found or unauthorized' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Get user posts endpoint
app.get('/api/posts/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Get user posts request for user:', userId);
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const postsCollection = db.collection('posts');
    const posts = await postsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${posts.length} posts for user ${userId}`);
    
    // Get comments for each post
    const commentsCollection = db.collection('comments');
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await commentsCollection
          .find({ postId: post._id.toString() })
          .sort({ createdAt: -1 })
          .toArray();
        
        return {
          ...post,
          comments: comments.map(comment => ({
            id: comment._id.toString(),
            userId: comment.userId,
            username: comment.username,
            text: comment.text,
            createdAt: comment.createdAt
          }))
        };
      })
    );
    
    res.json(postsWithComments);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to get user posts' });
  }
});

// Delete post endpoint
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    console.log('Delete post request:', { id, userId });
    
    if (!ObjectId.isValid(id)) {
      console.log('Invalid post ID:', id);
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    if (!userId) {
      console.log('Missing user ID');
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({
      _id: new ObjectId(id),
      userId
    });
    
    console.log('Found post:', post ? 'yes' : 'no');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    
    // Delete the post
    const result = await postsCollection.deleteOne({
      _id: new ObjectId(id),
      userId
    });
    
    console.log('Delete result:', result);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    
    // Delete associated photo if it exists
    if (post.photoId) {
      const photosCollection = db.collection('photos');
      const photoDeleteResult = await photosCollection.deleteOne({
        _id: new ObjectId(post.photoId),
        userId
      });
      console.log('Photo delete result:', photoDeleteResult);
    }
    
    // Delete associated comments
    const commentsCollection = db.collection('comments');
    const commentsDeleteResult = await commentsCollection.deleteMany({
      postId: id
    });
    console.log('Comments delete result:', commentsDeleteResult);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post', details: error.message });
  }
});

// Add comment endpoint
app.post('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, username, text } = req.body;
    
    console.log('Add comment request:', { postId, userId, username, text });
    
    if (!userId || !text) {
      console.log('Missing required fields:', { userId: !!userId, text: !!text });
      return res.status(400).json({ error: 'User ID and comment text are required' });
    }
    
    if (!ObjectId.isValid(postId)) {
      console.log('Invalid post ID:', postId);
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Check if post exists
    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      console.log('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const commentsCollection = db.collection('comments');
    const commentDoc = {
      postId,
      userId,
      username: username || 'Anonymous',
      text,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting comment:', commentDoc);
    const result = await commentsCollection.insertOne(commentDoc);
    console.log('Comment inserted:', result.insertedId);
    
    // Update post comment count
    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { comments: 1 } }
    );
    
    const response = {
      success: true,
      commentId: result.insertedId.toString(),
      comment: {
        id: result.insertedId.toString(),
        userId,
        username: commentDoc.username,
        text,
        createdAt: commentDoc.createdAt
      }
    };
    
    console.log('Comment response:', response);
    res.json(response);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
});

// Get comments for a post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const commentsCollection = db.collection('comments');
    const comments = await commentsCollection
      .find({ postId })
      .sort({ createdAt: -1 })
      .toArray();
    
    const commentsWithIds = comments.map(comment => ({
      id: comment._id.toString(),
      userId: comment.userId,
      username: comment.username,
      text: comment.text,
      createdAt: comment.createdAt
    }));
    
    res.json(commentsWithIds);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Toggle like for a post
app.post('/api/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    console.log('Toggle like request:', { postId, userId });
    
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const likesCollection = db.collection('likes');
    const postsCollection = db.collection('posts');
    
    // Check if user already liked the post
    const existingLike = await likesCollection.findOne({
      postId,
      userId
    });
    
    let liked = false;
    let likes = 0;
    
    if (existingLike) {
      // Unlike: remove the like
      await likesCollection.deleteOne({
        postId,
        userId
      });
      
      // Decrease like count
      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { likes: -1 } }
      );
      
      liked = false;
    } else {
      // Like: add the like
      await likesCollection.insertOne({
        postId,
        userId,
        createdAt: new Date()
      });
      
      // Increase like count
      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { likes: 1 } }
      );
      
      liked = true;
    }
    
    // Get updated like count
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    likes = post ? post.likes : 0;
    
    console.log('Like toggle result:', { liked, likes });
    
    res.json({
      success: true,
      liked,
      likes
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like', details: error.message });
  }
});

// Check if user has liked a post
app.post('/api/posts/:postId/like/check', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const likesCollection = db.collection('likes');
    const existingLike = await likesCollection.findOne({
      postId,
      userId
    });
    
    res.json({
      liked: !!existingLike
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ error: 'Failed to check like' });
  }
});

// Get user's liked posts
app.get('/api/users/:userId/liked-posts', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const likesCollection = db.collection('likes');
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');
    
    // Get all posts that the user has liked
    const likedPosts = await likesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get the actual post data for each liked post
    const postsWithComments = await Promise.all(
      likedPosts.map(async (like) => {
        const post = await postsCollection.findOne({ _id: new ObjectId(like.postId) });
        
        if (!post) return null;
        
        // Get comments for this post
        const comments = await commentsCollection
          .find({ postId: like.postId })
          .sort({ createdAt: -1 })
          .toArray();
        
        return {
          ...post,
          comments: comments.map(comment => ({
            id: comment._id.toString(),
            userId: comment.userId,
            username: comment.username,
            text: comment.text,
            createdAt: comment.createdAt
          }))
        };
      })
    );
    
    // Filter out null posts and return
    const validPosts = postsWithComments.filter(post => post !== null);
    
    res.json(validPosts);
  } catch (error) {
    console.error('Get liked posts error:', error);
    res.status(500).json({ error: 'Failed to get liked posts' });
  }
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting server...');
    console.log('📋 Environment:', {
      PORT: PORT,
      NODE_ENV: process.env.NODE_ENV || 'development',
      MONGODB_URI: MONGODB_URI ? 'Set' : 'Not set'
    });
    
    // Start the server first
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Ping endpoint: http://localhost:${PORT}/ping`);
      console.log(`📊 Root endpoint: http://localhost:${PORT}/`);
      console.log('🔍 Server is ready to receive requests');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error('Port is already in use');
        process.exit(1);
      }
    });
    
    // Try to connect to MongoDB in the background
    setTimeout(async () => {
      try {
        await connectToMongoDB();
      } catch (error) {
        console.error('⚠️ MongoDB connection failed, but server is running:', error.message);
        console.log('🔄 Server will continue running without database connection');
      }
    }, 1000); // Wait 1 second before trying to connect to MongoDB
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);