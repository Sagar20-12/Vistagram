import VistaPostCardDraggable from "@/components/VistaPostCardDraggable";
import { seedPosts } from "@/data/seedPosts";

export default function VistaTimeline() {
  const posts = [...seedPosts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section 
      id="timeline" 
      className="relative bg-white overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px),
          linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 0 0'
      }}
    >
      {/* Background overlay for hover effect */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 0'
        }}
      />
      
      {/* Content container */}
      <div className="container mx-auto py-14 relative z-10">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Recent POI Posts</h2>
          <p className="text-muted-foreground mt-1">AI-seeded sample timeline</p>
        </header>
        <div className="flex flex-wrap justify-center gap-8">
          {posts.slice(0, 4).map((p) => (
            <VistaPostCardDraggable key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
