// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper function to ensure proper URL construction
const ensureFullUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('://')) {
    return `http${url}`;
  }
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return `${API_BASE_URL}/${url}`;
};

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
        url: ensureFullUrl(result.url),
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
  postId: string | null;
  url: string;
  caption: string;
  location: string;
  createdAt: Date;
  filename: string;
  likes: number;
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
      url: ensureFullUrl(photo.url),
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

// Delete post function
export const deletePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    console.log('Attempting to delete post:', postId, 'for user:', userId);
    console.log('Delete URL:', `${API_BASE_URL}/api/posts/${postId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    console.log('Delete response status:', response.status);
    console.log('Delete response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete response error:', errorText);
      throw new Error(`Delete failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Delete response result:', result);
    return result.success;
  } catch (error) {
    console.error('Post deletion failed:', error);
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
      const fullPhotoUrl = ensureFullUrl(post.photoUrl);
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
    console.log('Adding comment:', { postId, userId, username, text });
    console.log('Comment URL:', `${API_BASE_URL}/api/posts/${postId}/comments`);
    
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, username, text }),
    });

    console.log('Comment response status:', response.status);
    console.log('Comment response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Comment response error:', errorText);
      throw new Error(`Failed to add comment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Comment response result:', result);
    
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
    throw error; // Re-throw to show the error in the UI
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

// Like/Unlike post function
export const toggleLike = async (postId: string, userId: string): Promise<{ success: boolean; liked: boolean; likes: number }> => {
  try {
    console.log('Toggling like for post:', postId, 'user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    console.log('Like response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Like response error:', errorText);
      throw new Error(`Failed to toggle like: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Like response result:', result);
    return result;
  } catch (error) {
    console.error('Toggle like failed:', error);
    throw error;
  }
};

// Check if user has liked a post
export const checkUserLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.liked;
  } catch (error) {
    console.error('Check user like failed:', error);
    return false;
  }
};

// Get user's liked posts
export const getUserLikedPosts = async (userId: string): Promise<Array<{
  id: string;
  photoUrl: string;
  caption: string;
  location: string;
  createdAt: Date;
  likes: number;
  shares: number;
  comments: number;
  author: string;
  commentsList: Array<{
    id: string;
    userId: string;
    username: string;
    text: string;
    createdAt: Date;
  }>;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/liked-posts`);
    
    if (!response.ok) {
      throw new Error(`Failed to get liked posts: ${response.statusText}`);
    }

    const posts = await response.json();
    
    return posts.map((post: any) => ({
      id: post._id.toString(),
      photoUrl: ensureFullUrl(post.photoUrl),
      caption: post.caption,
      location: post.location,
      createdAt: new Date(post.createdAt),
      likes: post.likes,
      shares: post.shares,
      comments: post.comments,
      author: post.author || 'Unknown User',
      commentsList: post.comments?.map((comment: any) => ({
        id: comment.id,
        userId: comment.userId,
        username: comment.username,
        text: comment.text,
        createdAt: new Date(comment.createdAt)
      })) || []
    }));
  } catch (error) {
    console.error('Failed to get user liked posts:', error);
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
