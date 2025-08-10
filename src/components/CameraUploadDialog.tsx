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

export default function CameraUploadDialog({
  triggerLabel = "Start Capturing",
}: {
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const captionRef = useRef<HTMLTextAreaElement | null>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.info(
      "To enable uploads and persistence, connect this project to Supabase via the green button (top right)",
      { duration: 5000 }
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Capture a POI</DialogTitle>
          <DialogDescription>
            Take a photo and add a caption. Persistence requires Supabase connection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Input
              type="file"
              accept="image/*"
              capture
              onChange={onFile}
              aria-label="Capture or upload a POI photo"
            />
            {preview && (
              <img
                src={preview}
                alt="Selected POI preview"
                className="rounded-md border"
              />
            )}
          </div>
          <Textarea ref={captionRef} placeholder="Write a caption..." />
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
