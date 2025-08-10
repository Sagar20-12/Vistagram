import VistaPostCardDraggable from "@/components/VistaPostCardDraggable";
import { seedPosts } from "@/data/seedPosts";

export default function VistaTimeline() {
  const posts = [...seedPosts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section id="timeline" className="bg-white">
      <div className="container mx-auto py-14">
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
