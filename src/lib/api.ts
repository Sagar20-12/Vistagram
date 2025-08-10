// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Photo upload function
export const uploadPhoto = async (
  file: File, 
  userId: string, 
  caption?: string, 
  location?: string
): Promise<{ url: string; id: string } | null> => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);
    
    if (caption) {
      formData.append('caption', caption);
    }
    
    if (location) {
      formData.append('location', location);
    }

    const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        url: `${API_BASE_URL}${result.url}`,
        id: result.photoId
      };
    }
    
    return null;
  } catch (error) {
    console.error('Photo upload failed:', error);
    return null;
  }
};

// Get user photos function
export const getUserPhotos = async (userId: string): Promise<Array<{
  id: string;
  url: string;
  caption: string;
  location: string;
  createdAt: Date;
  filename: string;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/photos/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get photos: ${response.statusText}`);
    }

    const photos = await response.json();
    
    // Convert string dates back to Date objects
    return photos.map((photo: any) => ({
      ...photo,
      createdAt: new Date(photo.createdAt)
    }));
  } catch (error) {
    console.error('Failed to get user photos:', error);
    return [];
  }
};

// Delete photo function
export const deletePhoto = async (photoId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Photo deletion failed:', error);
    return false;
  }
};

// Get user posts function
export const getUserPosts = async (userId: string): Promise<Array<{
  id: string;
  photoUrl: string;
  caption: string;
  location: string;
  createdAt: Date;
  likes: number;
  shares: number;
  comments: number;
  commentsList: Array<{
    id: string;
    userId: string;
    username: string;
    text: string;
    createdAt: Date;
  }>;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get posts: ${response.statusText}`);
    }

    const posts = await response.json();
    
    // Convert string dates back to Date objects and add full URLs
    return posts.map((post: any) => {
      const fullPhotoUrl = `${API_BASE_URL}${post.photoUrl}`;
      console.log('Generated photo URL:', fullPhotoUrl); // Debug log
      
      return {
        id: post._id.toString(),
        photoUrl: fullPhotoUrl,
        caption: post.caption,
        location: post.location,
        createdAt: new Date(post.createdAt),
        likes: post.likes,
        shares: post.shares,
        comments: post.comments,
        commentsList: post.comments?.map((comment: any) => ({
          id: comment.id,
          userId: comment.userId,
          username: comment.username,
          text: comment.text,
          createdAt: new Date(comment.createdAt)
        })) || []
      };
    });
  } catch (error) {
    console.error('Failed to get user posts:', error);
    return [];
  }
};

// Add comment function
export const addComment = async (
  postId: string, 
  userId: string, 
  username: string, 
  text: string
): Promise<{
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
} | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, username, text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        id: result.comment.id,
        userId: result.comment.userId,
        username: result.comment.username,
        text: result.comment.text,
        createdAt: new Date(result.comment.createdAt)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to add comment:', error);
    return null;
  }
};

// Get comments for a post
export const getComments = async (postId: string): Promise<Array<{
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`);
    
    if (!response.ok) {
      throw new Error(`Failed to get comments: ${response.statusText}`);
    }

    const comments = await response.json();
    
    return comments.map((comment: any) => ({
      id: comment.id,
      userId: comment.userId,
      username: comment.username,
      text: comment.text,
      createdAt: new Date(comment.createdAt)
    }));
  } catch (error) {
    console.error('Failed to get comments:', error);
    return [];
  }
};

// Health check function
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    console.log('Checking server health at:', `${API_BASE_URL}/api/health`);
    const response = await fetch(`${API_BASE_URL}/api/health`);
    console.log('Server health response:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};
