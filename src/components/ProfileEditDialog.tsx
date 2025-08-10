import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit3, Save, X, User, MapPin, Globe, Lock, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  isPrivate: boolean;
  notifications: boolean;
}

interface ProfileEditDialogProps {
  currentProfile: ProfileData;
  onSave: (newProfile: ProfileData) => void;
  trigger?: React.ReactNode;
}

export default function ProfileEditDialog({ currentProfile, onSave, trigger }: ProfileEditDialogProps) {
  const [profile, setProfile] = useState<ProfileData>(currentProfile);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (profile.displayName.trim() === '') {
      toast.error('Display name cannot be empty');
      return;
    }

    if (profile.bio.length > 150) {
      toast.error('Bio must be 150 characters or less');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(profile);
      toast.success('Profile updated successfully!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(currentProfile); // Reset to original values
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setProfile(currentProfile); // Reset to original values when closing
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name *
                </Label>
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                  placeholder="Enter your display name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell others about yourself..."
                  className="mt-1 min-h-[80px] resize-none"
                  maxLength={150}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">
                    Keep it concise and engaging
                  </p>
                  <span className={`text-xs ${profile.bio.length > 140 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {profile.bio.length}/150
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  placeholder="Where are you based?"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website" className="text-sm font-medium">
                  Website
                </Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => setProfile({...profile, website: e.target.value})}
                  placeholder="https://your-website.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy & Notifications
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Private Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Only approved followers can see your posts
                  </p>
                </div>
                <Switch
                  checked={profile.isPrivate}
                  onCheckedChange={(checked) => setProfile({...profile, isPrivate: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for likes and comments
                  </p>
                </div>
                <Switch
                  checked={profile.notifications}
                  onCheckedChange={(checked) => setProfile({...profile, notifications: checked})}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || profile.displayName.trim() === ''}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
