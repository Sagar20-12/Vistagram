import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Download,
  Trash2,
  Calendar,
  MapPin,
  RefreshCw,
  X,
  Copy,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';
import { getUserPhotos, deletePhoto, toggleLike, checkUserLike, getComments, addComment } from '@/lib/api';
import { toast } from 'sonner';
import CameraUploadDialog from './CameraUploadDialog';
import CommentSection from './CommentSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Photo {
  id: string;
  postId: string | null;
  url: string;
  caption: string;
  location: string;
  createdAt: Date;
  filename: string;
  likes: number;
}

export default function PhotoGallery({ onPhotoUploaded }: { onPhotoUploaded?: () => void } = {}) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [likingStates, setLikingStates] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadPhotos();
    }
  }, [user]);

  // Listen for photo upload events
  useEffect(() => {
    const handlePhotoUploaded = () => {
      loadPhotos();
    };

    // Add event listener for photo uploads
    window.addEventListener('photoUploaded', handlePhotoUploaded);
    
    return () => {
      window.removeEventListener('photoUploaded', handlePhotoUploaded);
    };
  }, []);

  const loadPhotos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      console.log('🔍 Loading photos for user:', user.uid);
      
      // Get photos from MongoDB
      const photoObjects = await getUserPhotos(user.uid);
      
      console.log('📸 Photos received from API:', photoObjects);
      console.log('📸 Number of photos:', photoObjects.length);
      
      if (photoObjects.length > 0) {
        console.log('📸 First photo details:', photoObjects[0]);
        console.log('📸 First photo URL:', photoObjects[0].url);
        
        // Test if the first photo URL is accessible
        if (photoObjects[0].url) {
          console.log('🌐 Testing first photo URL accessibility...');
          try {
            const testResponse = await fetch(photoObjects[0].url);
            console.log('🌐 Photo URL test response:', testResponse.status, testResponse.statusText);
            console.log('🌐 Photo URL test headers:', Object.fromEntries(testResponse.headers.entries()));
            
            if (!testResponse.ok) {
              console.error('❌ Photo URL returned error status:', testResponse.status);
            }
          } catch (urlError) {
            console.error('❌ Photo URL test failed:', urlError);
          }
        }
      }
      
      setPhotos(photoObjects);
      
      // Check like status for each photo
      await checkLikeStatuses(photoObjects);
    } catch (error) {
      console.error('❌ Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatuses = async (photoList: Photo[]) => {
    if (!user) return;
    
    const newLikedPhotos = new Set<string>();
    
    for (const photo of photoList) {
      if (!photo.postId) continue; // Skip photos without corresponding posts
      
      try {
        const isLiked = await checkUserLike(photo.postId, user.uid);
        if (isLiked) {
          newLikedPhotos.add(photo.id);
        }
      } catch (error) {
        console.error(`Failed to check like status for photo ${photo.id}:`, error);
      }
    }
    
    setLikedPhotos(newLikedPhotos);
  };

  const handleLike = async (photo: Photo) => {
    if (!user) {
      toast.error('Please sign in to like photos');
      return;
    }

    if (!photo.postId) {
      toast.error('Cannot like this photo - no corresponding post found');
      return;
    }

    if (likingStates.has(photo.id)) return; // Prevent double-clicking

    setLikingStates(prev => new Set(prev).add(photo.id));
    
    try {
      const result = await toggleLike(photo.postId, user.uid);
      
      // Update the liked state
      setLikedPhotos(prev => {
        const newSet = new Set(prev);
        if (result.liked) {
          newSet.add(photo.id);
        } else {
          newSet.delete(photo.id);
        }
        return newSet;
      });
      
      // Update the photo's like count
      setPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, likes: result.likes } : p
      ));
      
      if (result.liked) {
        toast.success('Photo liked!');
      } else {
        toast.success('Photo unliked');
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error(`Failed to ${likedPhotos.has(photo.id) ? 'unlike' : 'like'} photo`);
    } finally {
      setLikingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    try {
      const success = await deletePhoto(photo.id, user!.uid);
      if (success) {
        setPhotos(photos.filter(p => p.id !== photo.id));
        toast.success('Photo deleted successfully');
      } else {
        toast.error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleDownloadPhoto = async (photo: Photo) => {
    try {
      console.log('📥 Downloading photo from URL:', photo.url);
      const response = await fetch(photo.url);
      console.log('📥 Download response:', response.status, response.statusText);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Photo downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download photo');
    }
  };

  const handleShare = async (photo: Photo, platform: string) => {
    if (!photo.postId) {
      toast.error('Cannot share this photo - no corresponding post found');
      return;
    }

    const postUrl = `${window.location.origin}/post/${photo.postId}`;
    const shareText = `Check out this amazing photo: "${photo.caption}"`;
    
    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n${postUrl}`);
          toast.success('Link copied to clipboard!');
          break;
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
          window.open(twitterUrl, '_blank');
          break;
        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
          window.open(facebookUrl, '_blank');
          break;
        case 'instagram':
          toast.info('Instagram sharing requires the Instagram app. Please copy the link and share manually.');
          await navigator.clipboard.writeText(postUrl);
          break;
        default:
          break;
      }
      
      toast.success('Post shared successfully!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share post');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageError = (photo: Photo, event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('🖼️ Image failed to load:', photo.url);
    console.error('🖼️ Image error event:', event);
    console.error('🖼️ Photo details:', photo);
    
    // Mark this image as having an error
    setImageErrors(prev => new Set(prev).add(photo.id));
  };

  const handleImageLoad = (photo: Photo) => {
    console.log('✅ Image loaded successfully:', photo.url);
    
    // Remove from error set if it was previously marked as having an error
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(photo.id);
      return newSet;
    });
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Check if URL is valid
    try {
      new URL(url);
    } catch {
      console.error('❌ Invalid URL format:', url);
      return false;
    }
    
    // Check if it's a supported image format
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = supportedFormats.some(format => 
      url.toLowerCase().includes(format)
    );
    
    if (!hasValidExtension) {
      console.warn('⚠️ URL may not be an image:', url);
    }
    
    return true;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground">
              Please sign in to view your photo gallery
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start capturing and sharing your POI moments
            </p>
            <CameraUploadDialog triggerLabel="Upload Your First Photo" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Photo Gallery</h2>
        <div className="flex items-center gap-2">
          <CameraUploadDialog triggerLabel="Upload Photo" />
          <Button
            variant="outline"
            size="sm"
            onClick={loadPhotos}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="secondary">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Debug Info - Remove this in production */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">🐛 Debug Info:</h4>
          <p className="text-sm">User ID: {user?.uid}</p>
          <p className="text-sm">Photos loaded: {photos.length}</p>
          <p className="text-sm">Photos with postId: {photos.filter(p => p.postId).length}</p>
          <p className="text-sm">Photos without postId: {photos.filter(p => !p.postId).length}</p>
          <p className="text-sm">Images with errors: {imageErrors.size}</p>
          {photos.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">First photo URL:</p>
              <p className="text-xs font-mono break-all">{photos[0].url}</p>
              <p className="text-sm">URL Valid: {validateImageUrl(photos[0].url) ? '✅' : '❌'}</p>
              <p className="text-sm">PostId: {photos[0].postId || 'None'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative group">
              {!imageErrors.has(photo.id) && validateImageUrl(photo.url) ? (
                <img
                  src={photo.url}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-48 object-cover"
                  onClick={() => setSelectedPhoto(photo)}
                  onError={(e) => handleImageError(photo, e)}
                  onLoad={() => handleImageLoad(photo)}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm">Image not available</div>
                    <div className="text-xs mt-1 font-mono">{photo.id}</div>
                    {photo.url && (
                      <div className="text-xs mt-1 text-gray-400 break-all">
                        URL: {photo.url.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadPhoto(photo)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePhoto(photo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {photo.caption || 'Untitled Photo'}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {photo.location || 'No location'}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(photo.createdAt)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    ID: {photo.id}
                    {!photo.postId && (
                      <span className="ml-2 text-orange-500">⚠️ No post</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${likedPhotos.has(photo.id) ? 'text-red-500' : 'text-gray-500'} ${!photo.postId ? 'opacity-50' : ''}`}
                    onClick={() => handleLike(photo)} 
                    disabled={likingStates.has(photo.id) || !photo.postId}
                    title={!photo.postId ? 'Cannot like this photo' : ''}
                  >
                    <Heart className={`h-4 w-4 ${likedPhotos.has(photo.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <span className="text-xs text-muted-foreground">{photo.likes}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Post Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user?.displayName || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPhoto.location || 'No location'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
              {/* Left Side - Photo */}
              <div className="flex-1 flex items-center justify-center bg-gray-100 p-4 min-h-0">
                {!imageErrors.has(selectedPhoto.id) ? (
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.caption || 'Photo'}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onError={(e) => handleImageError(selectedPhoto, e)}
                    onLoad={() => handleImageLoad(selectedPhoto)}
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📸</span>
                    </div>
                    <p className="text-sm">Image not available</p>
                    <p className="text-xs mt-1 text-gray-300">ID: {selectedPhoto.id}</p>
                  </div>
                )}
              </div>

              {/* Right Side - Comments, Likes, Shares */}
              <div className="w-full lg:w-96 border-t lg:border-l lg:border-t-0 flex flex-col">
                {/* Post Info */}
                <div className="p-4 border-b">
                  <h4 className="font-semibold mb-2">{selectedPhoto.caption || 'Untitled Photo'}</h4>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(selectedPhoto.createdAt)}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 w-8 p-0 ${likedPhotos.has(selectedPhoto.id) ? 'text-red-500' : 'text-gray-500'} ${!selectedPhoto.postId ? 'opacity-50' : ''}`}
                        onClick={() => handleLike(selectedPhoto)} 
                        disabled={likingStates.has(selectedPhoto.id) || !selectedPhoto.postId}
                        title={!selectedPhoto.postId ? 'Cannot like this photo' : ''}
                      >
                        <Heart className={`h-4 w-4 ${likedPhotos.has(selectedPhoto.id) ? 'fill-current' : ''}`} />
                      </Button>
                      <span className="text-sm text-muted-foreground">{selectedPhoto.likes} likes</span>
                      
                      {/* Share Dropdown */}
                      {selectedPhoto.postId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleShare(selectedPhoto, 'copy')}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(selectedPhoto, 'twitter')}>
                              <Twitter className="h-4 w-4 mr-2" />
                              Share on Twitter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(selectedPhoto, 'facebook')}>
                              <Facebook className="h-4 w-4 mr-2" />
                              Share on Facebook
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(selectedPhoto, 'instagram')}>
                              <Instagram className="h-4 w-4 mr-2" />
                              Share on Instagram
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="flex-1 overflow-hidden">
                  {selectedPhoto.postId ? (
                    <CommentSection 
                      postId={selectedPhoto.postId}
                      alwaysShow={true}
                    />
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Comments not available for this photo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}