import { MongoClient, Db } from 'mongodb';

// MongoDB connection configuration
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = import.meta.env.VITE_MONGODB_DB_NAME || 'vistagram';

let client: MongoClient | null = null;
let db: Db | null = null;

// Initialize MongoDB connection
export const connectToMongoDB = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

// Get database instance
export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not connected. Call connectToMongoDB() first.');
  }
  return db;
};

// Close MongoDB connection
export const closeMongoDBConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
};

// Collection names
export const COLLECTIONS = {
  POSTS: 'posts',
  USERS: 'users',
  PHOTOS: 'photos'
} as const;

// Photo upload helper function
export const uploadPhotoToMongoDB = async (
  file: File, 
  userId: string,
  caption?: string,
  location?: string
): Promise<{ url: string; id: string } | null> => {
  try {
    const db = getDB();
    const photosCollection = db.collection(COLLECTIONS.PHOTOS);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create photo document
    const photoDoc = {
      userId,
      filename: file.name,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      data: buffer,
      caption: caption || '',
      location: location || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert photo into database
    const result = await photosCollection.insertOne(photoDoc);
    
    // Return photo URL (will be served by our API)
    const photoUrl = `/api/photos/${result.insertedId}`;
    
    return {
      url: photoUrl,
      id: result.insertedId.toString()
    };
  } catch (error) {
    console.error('Photo upload failed:', error);
    return null;
  }
};

// Get user photos helper function
export const getUserPhotosFromMongoDB = async (userId: string): Promise<Array<{ id: string; url: string; caption: string; location: string; createdAt: Date }>> => {
  try {
    const db = getDB();
    const photosCollection = db.collection(COLLECTIONS.PHOTOS);
    
    const photos = await photosCollection
      .find({ userId }, { projection: { data: 0 } }) // Exclude binary data
      .sort({ createdAt: -1 })
      .toArray();
    
    return photos.map(photo => ({
      id: photo._id.toString(),
      url: `/api/photos/${photo._id}`,
      caption: photo.caption,
      location: photo.location,
      createdAt: photo.createdAt
    }));
  } catch (error) {
    console.error('Failed to get user photos:', error);
    return [];
  }
};

// Delete photo helper function
export const deletePhotoFromMongoDB = async (photoId: string, userId: string): Promise<boolean> => {
  try {
    const db = getDB();
    const photosCollection = db.collection(COLLECTIONS.PHOTOS);
    
    const result = await photosCollection.deleteOne({
      _id: new ObjectId(photoId),
      userId
    });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Photo deletion failed:', error);
    return false;
  }
};

// Get photo by ID helper function
export const getPhotoById = async (photoId: string): Promise<{ data: Buffer; mimetype: string; filename: string } | null> => {
  try {
    const db = getDB();
    const photosCollection = db.collection(COLLECTIONS.PHOTOS);
    
    const photo = await photosCollection.findOne(
      { _id: new ObjectId(photoId) },
      { projection: { data: 1, mimetype: 1, filename: 1 } }
    );
    
    if (!photo) {
      return null;
    }
    
    return {
      data: photo.data,
      mimetype: photo.mimetype,
      filename: photo.filename
    };
  } catch (error) {
    console.error('Failed to get photo:', error);
    return null;
  }
};

// Import ObjectId for type safety
import { ObjectId } from 'mongodb';
