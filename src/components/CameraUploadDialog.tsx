import { useState, useRef, ChangeEvent, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./LoginModal";
import { uploadPhoto } from "@/lib/api";
import { Loader2, Upload, X } from "lucide-react";

export default function CameraUploadDialog({
  triggerLabel = "Start Capturing",
}: {
  triggerLabel?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const captionRef = useRef<HTMLTextAreaElement | null>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !user) {
      toast.error('Please select a photo and ensure you are signed in');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload photo to MongoDB
      const uploadResult = await uploadPhoto(selectedFile, user.uid, caption);
      
      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      // Here you would typically save the post data to your database
      // For now, we'll just show a success message
      toast.success('Photo uploaded successfully!', {
        description: `Your photo is now available at: ${uploadResult.url}`
      });

      // Trigger refresh event for PhotoGallery and Posts
      window.dispatchEvent(new CustomEvent('photoUploaded'));
      window.dispatchEvent(new CustomEvent('postUploaded'));

      // Reset form
      setOpen(false);
      setSelectedFile(null);
      setPreview(null);
      setCaption("");
      
      // Clean up preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="hero" 
            size="lg"
            className="transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600"
          >
            {triggerLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Please sign in to capture and share POI moments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <LoginModal />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="hero" 
          size="lg"
          className="transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Capture a POI</DialogTitle>
                  <DialogDescription>
                    Take a photo and add a caption. Photos will be uploaded to Supabase storage.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        capture
                        onChange={onFile}
                        aria-label="Capture or upload a POI photo"
                        disabled={isUploading}
                      />
                      {preview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {preview && (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Selected POI preview"
                          className="rounded-md border w-full max-h-64 object-cover"
                        />
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p>Uploading...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="caption" className="text-sm font-medium">
                      Caption
                    </label>
                    <Textarea
                      id="caption"
                      ref={captionRef}
                      placeholder="Write a caption for your photo..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      disabled={isUploading}
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!selectedFile || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
    </Dialog>
  );
}
