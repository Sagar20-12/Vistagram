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
  RefreshCw
} from 'lucide-react';
import { getUserPhotos, deletePhoto } from '@/lib/api';
import { toast } from 'sonner';
import CameraUploadDialog from './CameraUploadDialog';

interface Photo {
  id: string;
  url: string;
  caption: string;
  location: string;
  createdAt: Date;
  filename: string;
}

export default function PhotoGallery({ onPhotoUploaded }: { onPhotoUploaded?: () => void } = {}) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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
      
      // Get photos from MongoDB
      const photoObjects = await getUserPhotos(user.uid);
      setPhotos(photoObjects);
    } catch (error) {
      console.error('Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
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
      const response = await fetch(photo.url);
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative group">
              <img
                src={photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-48 object-cover"
                onClick={() => setSelectedPhoto(photo)}
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                    {photo.location}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(photo.createdAt)}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Heart className="h-4 w-4" />
                  </Button>
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

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </Button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Photo'}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h3 className="font-semibold">{selectedPhoto.caption || 'Untitled Photo'}</h3>
              <p className="text-sm opacity-80">{selectedPhoto.location}</p>
                              <p className="text-xs opacity-60">{formatDate(selectedPhoto.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
