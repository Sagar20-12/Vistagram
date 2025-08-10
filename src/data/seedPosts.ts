import tokyo from "@/assets/poi_tokyo_shibuya.jpg";
import paris from "@/assets/poi_paris_eiffel.jpg";
import ny from "@/assets/poi_ny_brooklyn_bridge.jpg";
import santorini from "@/assets/poi_santorini.jpg";
import dubai from "@/assets/poi_dubai_burj.jpg";
import kyoto from "@/assets/poi_kyoto_torii.jpg";
import london from "@/assets/poi_london_tower_bridge.jpg";
import singapore from "@/assets/poi_singapore_marina.jpg";

export type Post = {
  id: string;
  username: string;
  author: string;
  location: string;
  image: string;
  caption: string;
  timestamp: string; // ISO string
  likes: number;
  shares: number;
  comments: number;
};

const daysAgo = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
};

export const seedPosts: Post[] = [
  {
    id: "p8",
    username: "@skyline.dreamer",
    author: "Skyline Dreamer",
    location: "Singapore",
    image: singapore,
    caption: "Blue hour around Marina Bay. The reflections never get old.",
    timestamp: daysAgo(2),
    likes: 128,
    shares: 14,
    comments: 23,
  },
  {
    id: "p7",
    username: "@london.local",
    author: "London Local",
    location: "London, UK",
    image: london,
    caption: "Tower Bridge glowing after the rain.",
    timestamp: daysAgo(4),
    likes: 176,
    shares: 21,
    comments: 31,
  },
  {
    id: "p6",
    username: "@kyoto.wander",
    author: "Kyoto Wanderer",
    location: "Kyoto, Japan",
    image: kyoto,
    caption: "Fushimi Inari's endless torii. Whisper-quiet at sunrise.",
    timestamp: daysAgo(6),
    likes: 242,
    shares: 33,
    comments: 45,
  },
  {
    id: "p5",
    username: "@desert.city",
    author: "Desert City",
    location: "Dubai, UAE",
    image: dubai,
    caption: "From ground to sky—Burj Khalifa still stuns.",
    timestamp: daysAgo(9),
    likes: 203,
    shares: 19,
    comments: 28,
  },
  {
    id: "p4",
    username: "@aegean.vibes",
    author: "Aegean Vibes",
    location: "Santorini, Greece",
    image: santorini,
    caption: "White walls, blue domes, endless sea—Santorini magic.",
    timestamp: daysAgo(12),
    likes: 321,
    shares: 44,
    comments: 67,
  },
  {
    id: "p3",
    username: "@city.lines",
    author: "City Lines",
    location: "New York, USA",
    image: ny,
    caption: "Brooklyn Bridge in pastels. Mornings in NYC hit different.",
    timestamp: daysAgo(15),
    likes: 287,
    shares: 37,
    comments: 52,
  },
  {
    id: "p2",
    username: "@paris.moments",
    author: "Paris Moments",
    location: "Paris, France",
    image: paris,
    caption: "Trocadéro sunset with La Dame de Fer.",
    timestamp: daysAgo(18),
    likes: 355,
    shares: 52,
    comments: 78,
  },
  {
    id: "p1",
    username: "@neon.rush",
    author: "Neon Rush",
    location: "Tokyo, Japan",
    image: tokyo,
    caption: "Shibuya at dusk—organized chaos and neon dreams.",
    timestamp: daysAgo(22),
    likes: 412,
    shares: 61,
    comments: 89,
  },
];
