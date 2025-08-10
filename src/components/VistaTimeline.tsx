import VistaPostCard from "@/components/VistaPostCard";
import { seedPosts } from "@/data/seedPosts";

export default function VistaTimeline() {
  const posts = [...seedPosts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section id="timeline" className="container mx-auto py-14">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Recent POI Posts</h2>
        <p className="text-muted-foreground mt-1">AI-seeded sample timeline</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <VistaPostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
