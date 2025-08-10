import CameraUploadDialog from "@/components/CameraUploadDialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { ContainerTextFlip } from "@/components/ContainerTextFlip";
import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision";

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
      <BackgroundBeamsWithCollision className="bg-white">
        <section
          ref={ref as any}
          onMouseMove={onMove}
          className="relative z-10"
          style={{
            background: `radial-gradient(600px circle at var(--px, 50%) var(--py, 50%), rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
          }}
        >
          <div className="container mx-auto py-24 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Vistagram — Capture & share POI{" "}
                <ContainerTextFlip 
                  words={["moments", "memories", "adventures", "experiences"]}
                  interval={4000}
                  className="!bg-blue-50 !shadow-sm !text-black dark:!text-white !rounded-lg !px-2"
                  textClassName="!text-4xl md:!text-6xl !font-extrabold"
                />
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Snap a photo, add a caption, and join a vibrant timeline of places and memories.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <CameraUploadDialog triggerLabel="Start capturing" />
                <a href="#timeline" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('timeline')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100"
                  >
                    View timeline
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </BackgroundBeamsWithCollision>
    </header>
  );
}
