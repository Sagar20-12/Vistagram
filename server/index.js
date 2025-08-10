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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'vistagram';

let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload photo endpoint
app.post('/api/photos/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, caption, location } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
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
    
    // Insert photo into database
    const result = await photosCollection.insertOne(photoDoc);
    
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
    
    await postsCollection.insertOne(postDoc);
    
    res.json({
      success: true,
      photoId: result.insertedId.toString(),
      url: `/api/photos/${result.insertedId}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get photo by ID endpoint
app.get('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }
    
    const photosCollection = db.collection('photos');
    const photo = await photosCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { data: 1, mimetype: 1, filename: 1 } }
    );
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.set('Content-Type', photo.mimetype);
    res.set('Content-Disposition', `inline; filename="${photo.filename}"`);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=31536000');
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
    
    const photosCollection = db.collection('photos');
    const photos = await photosCollection
      .find({ userId }, { projection: { data: 0 } }) // Exclude binary data
      .sort({ createdAt: -1 })
      .toArray();
    
    const photosWithUrls = photos.map(photo => ({
      id: photo._id.toString(),
      url: `/api/photos/${photo._id}`,
      caption: photo.caption,
      location: photo.location,
      createdAt: photo.createdAt,
      filename: photo.filename
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
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const photosCollection = db.collection('photos');
    const result = await photosCollection.deleteOne({
      _id: new ObjectId(id),
      userId
    });
    
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
    
    const postsCollection = db.collection('posts');
    const posts = await postsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
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
      const result = await postsCollection.updateOne(
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
      const result = await postsCollection.updateOne(
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);
