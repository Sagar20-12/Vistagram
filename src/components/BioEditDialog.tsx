import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit3, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface BioEditDialogProps {
  currentBio: string;
  onSave: (newBio: string) => void;
  trigger?: React.ReactNode;
}

export default function BioEditDialog({ currentBio, onSave, trigger }: BioEditDialogProps) {
  const [bio, setBio] = useState(currentBio);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (bio.trim() === '') {
      toast.error('Bio cannot be empty');
      return;
    }

    if (bio.length > 150) {
      toast.error('Bio must be 150 characters or less');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(bio);
      toast.success('Bio updated successfully!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update bio');
      console.error('Bio update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBio(currentBio); // Reset to original value
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setBio(currentBio); // Reset to original value when closing
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Bio
          </DialogTitle>
          <DialogDescription>
            Tell others about yourself. What makes you unique?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your story, interests, or what you love about travel..."
              className="mt-2 min-h-[100px] resize-none"
              maxLength={150}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                Keep it concise and engaging
              </p>
              <span className={`text-xs ${bio.length > 140 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {bio.length}/150
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || bio.trim() === ''}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
