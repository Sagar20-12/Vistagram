import CameraUploadDialog from "@/components/CameraUploadDialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function VistaHero() {
  const ref = useRef<HTMLElement | null>(null);

  const onMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const r = ref.current;
    if (!r) return;
    const rect = r.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    r.style.setProperty("--px", `${x}%`);
    r.style.setProperty("--py", `${y}%`);
  };

  return (
    <header className="relative overflow-hidden">
      <section
        ref={ref as any}
        onMouseMove={onMove}
        className="bg-hero animate-gradient-slow pointer-gradient"
      >
        <div className="container mx-auto py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Vistagram — Capture & share POI moments
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Snap a photo, add a caption, and join a vibrant timeline of places and memories.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CameraUploadDialog triggerLabel="Start capturing" />
              <a href="#timeline">
                <Button variant="secondary" size="lg">View timeline</Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}
