import type {
  Creator,
  Poster,
  Campaign,
  Application,
  Conversation,
  Notice,
} from "@/types";
export const niches = [
  "Fashion",
  "Beauty",
  "Tech",
  "Food",
  "Travel",
  "Fitness",
  "Finance",
  "Gaming",
  "Comedy",
  "Education",
  "Parenting",
  // Cars, bikes and EVs. Kept at index 11 so seeded records don't shift.
  "Automobile",
  // Other common Indian creator categories, appended so seed data is unchanged.
  "Lifestyle",
  "Personal Blogging",
  "Vlogging",
  "Entertainment",
  "Music & Dance",
  "Art & DIY",
  "Health & Wellness",
  "Home & Decor",
  "Pets",
  "Sports",
  "Photography",
  "Business & Startups",
  "Motivation",
  "Spirituality",
  "Sustainability",
];
export const cities = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Indore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Chandigarh",
  "Surat",
  // Appended so seeded records (cities[i % 12]) don't shift.
  "Ahmedabad",
  "Gurugram",
  "Noida",
  "Kochi",
  "Thiruvananthapuram",
  "Coimbatore",
  "Madurai",
  "Mysuru",
  "Visakhapatnam",
  "Vijayawada",
  "Nagpur",
  "Nashik",
  "Bhopal",
  "Vadodara",
  "Rajkot",
  "Udaipur",
  "Jodhpur",
  "Ludhiana",
  "Amritsar",
  "Dehradun",
  "Kanpur",
  "Varanasi",
  "Patna",
  "Ranchi",
  "Raipur",
  "Bhubaneswar",
  "Guwahati",
  "Goa",
];
export const languages = [
  "Hindi",
  "English",
  "Hinglish",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Gujarati",
  "Punjabi",
];
// Supported platforms for now: Instagram, YouTube and LinkedIn only.
export const platforms = ["Instagram", "YouTube", "LinkedIn"];
// Real photographs taken in India. Source and licence details: docs/photo-sources.md.
const womenPhotos = [
  "photo-1763817959544-9d42878f160d",
  "photo-1615965764382-446dba679790",
  "photo-1669659033487-203d254e35a4",
  "photo-1666160525588-95294b909229",
];
const menPhotos = [
  "photo-1747373354116-671ba01db71b",
  "photo-1712425718137-491250cfde88",
];
const menIndexes = new Set([
  1, 3, 6, 8, 10, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33,
]);
export const photo = (id: string, w = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
export const covers = [
  "photo-1445205170230-053b83016050",
  "photo-1596462502278-27bfdc403348",
  "photo-1498049794561-7780e7231661",
  "photo-1504674900247-0877df9cc836",
  "photo-1464822759023-fed622ff2c3b",
  "photo-1517836357463-d25dfeac3438",
];
const names = [
  "Aanya Sharma",
  "Rohan Mehta",
  "Ishita Kapoor",
  "Arjun Nair",
  "Meera Joshi",
  "Kavya Rao",
  "Vivaan Shah",
  "Ananya Verma",
  "Dev Patel",
  "Sana Khan",
  "Aditya Iyer",
  "Priya Bansal",
  "Nisha Reddy",
  "Kabir Sethi",
  "Tara Mukherjee",
  "Yash Malhotra",
  "Avni Gupta",
  "Rehan Ali",
  "Diya Desai",
  "Veer Singh",
  "Riya Menon",
  "Aarav Kulkarni",
  "Zoya Ansari",
  "Dhruv Jain",
  "Myra Choudhary",
  "Neel Basu",
  "Suhana Sinha",
  "Ishaan Bhat",
  "Navya Saxena",
  "Varun Das",
  "Kiara Bose",
  "Om Trivedi",
  "Anika Sen",
  "Kunal Ahuja",
  "Sia Pillai",
  "Aditi Mishra",
];
let womenPhotoIndex = 0;
let menPhotoIndex = 0;
const portraits = names.map((_, i) =>
  menIndexes.has(i)
    ? menPhotos[menPhotoIndex++ % menPhotos.length]
    : womenPhotos[womenPhotoIndex++ % womenPhotos.length],
);
// Headline follower count; it is also the count on the creator's main platform
// so cards, the homepage and the profile page always agree.
const creatorFollowers = (i: number) =>
  i === 0 ? 124800 : i === 1 ? 86300 : i === 2 ? 210600 : 5300 + i * i * 1780;
const platformFollowers = (i: number, name: string, fallback: number) =>
  platforms[i % 3] === name ? creatorFollowers(i) : fallback;
// Sample per-platform insights. Audiences differ by platform (YouTube skews
// to Tier-2 cities and older viewers, LinkedIn to metro professionals).
const platformAudience = (k: number, home: string, i: number) => {
  const picks = [
    [home, "Delhi", "Bengaluru", "Pune", "Mumbai"],
    [home, "Lucknow", "Jaipur", "Delhi", "Patna"],
    ["Bengaluru", "Mumbai", "Hyderabad", "Delhi", "Pune"],
  ][k];
  const unique = [...new Set(picks)].slice(0, 4);
  const shift = i % 5;
  return {
    audience: [
      ...unique.map((city, j) => ({
        city,
        value: [32, 24, 19, 14][j] + (j === 0 ? shift : j === 3 ? -shift : 0),
      })),
      { city: "Other", value: 11 },
    ],
    ages: [
      [42, 36, 16, 6],
      [30, 38, 22, 10],
      [12, 48, 28, 12],
    ][k].map((value, j) => ({
      age: ["18-24", "25-34", "35-44", "45+"][j],
      value,
    })),
    gender: [
      [61 - shift, 35 + shift, 4],
      [44, 53, 3],
      [38 + shift, 60 - shift, 2],
    ][k].map((value, j) => ({ name: ["Women", "Men", "Other"][j], value })),
    india: [89, 84, 78][k],
  };
};
const growthTo = (followers: number, seed: number) =>
  Array.from({ length: 90 }, (_, j) => ({
    day: `Day ${j + 1}`,
    followers: Math.round(
      followers * (0.86 + (0.14 * j) / 89) +
        Math.sin(j + seed) * followers * 0.004,
    ),
  }));
const platformStats = (
  i: number,
  name: string,
  handle: string,
  followers: number,
  engagement: number,
  views: number,
) => {
  const k = platforms.indexOf(name);
  const main = platforms[i % 3] === name;
  return {
    name,
    handle,
    followers,
    engagement: main
      ? engagement
      : Math.max(1.2, Math.round((engagement + [0.4, -0.8, 0.6][k]) * 10) / 10),
    avgViews: main ? views : Math.round(followers * [0.32, 0.55, 0.9][k]),
    growth: growthTo(followers, i + k),
    ...platformAudience(k, cities[i % 12], i),
  };
};
const contentPlan = [
  {
    platform: "Instagram",
    format: "Reel",
    duration: "0:42",
    title: "A day in my creative life",
  },
  {
    platform: "Instagram",
    format: "Carousel",
    title: "My everyday essentials",
  },
  {
    platform: "YouTube",
    format: "Long video",
    duration: "8:24",
    title: "The honest weekend vlog",
  },
  {
    platform: "YouTube",
    format: "Short",
    duration: "0:55",
    title: "Something new to try",
  },
  {
    platform: "LinkedIn",
    format: "Video post",
    duration: "1:30",
    title: "Behind the scenes of a brand shoot",
  },
  {
    platform: "LinkedIn",
    format: "Document carousel",
    title: "What I learned from 50 collabs",
  },
];
const pastBrands = [
  "Kurta Kraft",
  "BoltFit",
  "Glow Theory",
  "Masala Box",
  "PixelPop",
];
export const creators: Creator[] = names.map((name, i) => ({
  id: `cr-${i + 1}`,
  username: name.toLowerCase().replaceAll(" ", "."),
  name,
  avatar: photo(portraits[i], 500),
  cover: photo(covers[i % covers.length]),
  city: cities[i % 12],
  languages: [...new Set([languages[i % 11], "English"])],
  niche: niches[i % 12],
  niches: [niches[i % 12], i % 2 ? "Lifestyle" : "UGC"],
  bio: `Creating stories that feel real. ${niches[i % 12]} creator based in ${cities[i % 12]}, helping Indian brands connect with their next community. Let's make something worth watching.`,
  verified: i % 4 !== 3,
  followers: creatorFollowers(i),
  engagement: Math.round((3.4 + (i % 7) * 0.63) * 10) / 10,
  views: 32000 + i * 9100,
  price: 8500 + i * 1700,
  platform: platforms[i % 3],
  platforms: [
    [
      "Instagram",
      `@${name.split(" ")[0].toLowerCase()}creates`,
      124800 + i * 5900,
    ],
    ["YouTube", `@${name.split(" ")[0].toLowerCase()}studio`, 42000 + i * 1900],
    [
      "LinkedIn",
      `in/${name.split(" ")[0].toLowerCase()}writes`,
      2400 + i * 380,
    ],
  ].map(([p, handle, fallback]) =>
    platformStats(
      i,
      p as string,
      handle as string,
      platformFollowers(i, p as string, fallback as number),
      Math.round((3.4 + (i % 7) * 0.63) * 10) / 10,
      32000 + i * 9100,
    ),
  ),
  growth: Array.from({ length: 90 }, (_, j) => ({
    day: `Day ${j + 1}`,
    followers: 80000 + i * 5000 + j * 470 + Math.sin(j) * 800,
  })),
  content: contentPlan.map((item, j) => ({
    id: `content-${i}-${j}`,
    image: photo(covers[(i + j) % 6], 600),
    title: item.title,
    views: 64000 + j * 84300 - (item.platform === "LinkedIn" ? 60000 : 0),
    likes: 1200 + j * 430,
    type: item.format,
    format: item.format,
    duration: item.duration,
    platform: item.platform,
    date: "2026-09-22",
  })),
  audience: [
    { city: cities[i % 12], value: 32 },
    { city: "Delhi", value: 24 },
    { city: "Bengaluru", value: 19 },
    { city: "Pune", value: 14 },
    { city: "Other", value: 11 },
  ],
  ages: [
    { age: "18-24", value: 42 },
    { age: "25-34", value: 36 },
    { age: "35-44", value: 16 },
    { age: "45+", value: 6 },
  ],
  gender: [
    { name: "Women", value: 61 },
    { name: "Men", value: 35 },
    { name: "Other", value: 4 },
  ],
  india: 89,
  collaborations: [
    {
      brand: pastBrands[i % 5],
      platform: "Instagram",
      made: "3 Reels + 4 Stories",
      year: "2026",
      result: "2.4L views across 3 reels",
      results: [
        { label: "Views", value: "2.4L" },
        { label: "Saves", value: "3.1K" },
        { label: "Engagement", value: "5.2%" },
      ],
      quote: {
        text: "Thoughtful content, clear communication, and every deadline met.",
        name: `Ritika, ${pastBrands[i % 5]}`,
      },
    },
    {
      brand: pastBrands[(i + 1) % 5],
      platform: "YouTube",
      made: "1 integrated video (90 sec)",
      year: "2025",
      result: "8,400 product link clicks",
      results: [
        { label: "Video views", value: "96K" },
        { label: "Link clicks", value: "8,400" },
      ],
    },
  ],
  testimonials: [
    {
      name: "Ritika, Kurta Kraft",
      text: "Thoughtful content, clear communication, and every deadline met.",
      rating: 5,
    },
  ],
  rates: [
    "Reel",
    "Post",
    "Story",
    "Carousel",
    "YouTube video",
    "Short",
    "Live",
    "UGC",
    "Link in bio",
  ].map((type, j) => ({ type, price: 2000 + j * 1500 + i * 700 })),
  collabTypes: ["Paid", "Barter", "Affiliate", "UGC", "Event", "Ambassador"],
  turnaround: 5,
  revisions: 2,
  equipment: ["Sony ZV-E10", "Wireless microphone", "Studio lights"],
  shootTypes: ["Home", "Studio", "Outdoor"],
  restrictions: ["Gambling", "Alcohol"],
  achievements: [
    "Creator community spotlight 2026",
    "100K community milestone",
  ],
  strength: 84,
  response: 4,
}));
const brands = [
  "Kurta Kraft",
  "Glow Theory",
  "PixelPop",
  "Masala Box",
  "Roam Local",
  "BoltFit",
  "PaisaPal",
  "PlayHaus",
  "Chai Point Co.",
  "LearnLoop",
  "LittleNest",
  "MotoLane",
  "Social Sutra",
  "Storyfolk",
];
export const posters: Poster[] = brands.map((name, i) => ({
  id: `po-${i + 1}`,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  name,
  type: i < 7 ? "Agency" : i < 11 ? "Large brand" : "Small business",
  city: cities[i % 12],
  about: `We bring thoughtful ${niches[i % 12].toLowerCase()} brands and authentic creators together. Our team believes in clear briefs, fair rates, and lasting creative partnerships.`,
  website: `https://${name.toLowerCase().replaceAll(" ", "")}.example`,
  industries: [niches[i % 12], "Lifestyle"],
  verified: i % 5 !== 4,
  posted: 38 + i * 7,
  active: 3 + (i % 5),
  hired: 126 + i * 19,
  response: 3 + (i % 8),
  onTime: 94 + (i % 6),
  rating: 4.6 + (i % 4) * 0.1,
  reviews: 28 + i * 4,
  since: "2024",
  color: ["#eadffc", "#ffdcca", "#e0edcb", "#ffe8b7", "#d6e8fc", "#e7e1f5"][
    i % 6
  ],
}));
export const campaigns: Campaign[] = Array.from({ length: 40 }, (_, i) => {
  const niche = niches[i % 12];
  const platform =
    niche === "Finance" || niche === "Education"
      ? "LinkedIn"
      : i % 4 === 1
        ? "YouTube"
        : "Instagram";
  const title = [
    "Your style. Our festive collection.",
    "Make everyday skincare a little glowier.",
    "Tech that deserves a spot in your feed.",
    "A taste of home, a story of your own.",
    "Find your next offbeat adventure.",
    "Bring your fitness journey to life.",
    "Make money conversations simpler.",
    "Level up your gaming content.",
    "Tell your chai-time story.",
    "Make learning a little more fun.",
    "Little moments, big family stories.",
    "Take your community for a ride.",
  ][i % 12];
  return {
    id: `ca-${i + 1}`,
    slug: `${["festive-fashion-edit", "everyday-glow", "tech-unboxed", "taste-of-home", "offbeat-india", "move-with-bolt", "money-made-simple", "game-on", "chai-time-stories", "learn-together", "little-moments", "open-road"][i % 12]}${i < 12 ? "" : `-${i + 1}`}`,
    title,
    posterId: `po-${(i % 14) + 1}`,
    brand: brands[i % 14],
    image: photo(covers[i % 6], 900),
    niche,
    platform,
    type: i % 7 === 3 ? "Barter" : i % 9 === 6 ? "Affiliate" : "Paid",
    min: 5000 + (i % 8) * 2500,
    max: 15000 + (i % 8) * 5000,
    city: i % 3 ? "All India" : cities[i % 12],
    language: languages[i % 11],
    followers: i % 3 === 0 ? 5000 : 10000,
    brief: `We're looking for ${niche.toLowerCase()} creators with a distinctive voice to tell an authentic story for ${brands[i % 14]}. Show how our products fit into your everyday life. Keep it honest, original, and true to your audience. Creative freedom is encouraged; scripted endorsements aren't our style.`,
    deliverables:
      platform === "LinkedIn"
        ? [
            { type: "LinkedIn post", quantity: 1 },
            { type: "LinkedIn carousel", quantity: 1 },
          ]
        : platform === "YouTube"
          ? [
              { type: "YouTube integrated video (60-90 sec)", quantity: 1 },
              { type: "YouTube Short", quantity: 1 },
            ]
          : [
              { type: "Instagram Reel (30-60 sec)", quantity: 1 },
              { type: "Instagram Stories", quantity: 3 },
            ],
    needed: 8 + (i % 9),
    applicants: 17 + i * 3,
    deadline: "2026-11-20",
    posted: `2026-10-${String(4 - (i % 4)).padStart(2, "0")}`,
    usage: "30 days organic usage. Paid ads require a separate agreement.",
    featured: i % 4 === 0,
    urgent: i % 6 === 1,
    status: "Live",
  };
});
export const applications: Application[] = [
  {
    id: "ap-1",
    campaignId: "ca-2",
    creatorId: "cr-1",
    pitch:
      "I would love to share my everyday skincare routine with your product, through an honest, natural reel.",
    quote: 15000,
    status: "Shortlisted",
    date: "2026-10-02",
    showcase: ["content-0-0"],
  },
  {
    id: "ap-2",
    campaignId: "ca-1",
    creatorId: "cr-2",
    pitch:
      "My audience loves festive fashion. I can style three versatile looks and share the story behind each.",
    quote: 18000,
    status: "Applied",
    date: "2026-10-03",
    showcase: [],
  },
  {
    id: "ap-3",
    campaignId: "ca-1",
    creatorId: "cr-3",
    pitch:
      "I create engaging fashion content that turns everyday outfits into stories.",
    quote: 22000,
    status: "Viewed",
    date: "2026-10-02",
    showcase: [],
  },
  {
    id: "ap-4",
    campaignId: "ca-6",
    creatorId: "cr-1",
    pitch: "An authentic fitness routine for my community.",
    quote: 16000,
    status: "Hired",
    date: "2026-09-27",
    showcase: [],
  },
];
export const conversations: Conversation[] = [
  {
    id: "co-1",
    creatorId: "cr-1",
    posterId: "po-2",
    campaignId: "ca-2",
    messages: [
      {
        id: "m1",
        body: "Hi Aanya! We loved your recent content. Your application looks like a great fit for our everyday glow campaign.",
        sender: "brand",
        time: "10:32",
      },
      {
        id: "m2",
        body: "Thank you! I already have a few ideas for an honest morning routine reel. Would love to hear more about the brief.",
        sender: "creator",
        time: "10:34",
      },
      {
        id: "m3",
        body: "Sounds perfect! We are looking for one reel and three stories. Are you available next week?",
        sender: "brand",
        time: "10:35",
      },
    ],
  },
  {
    id: "co-2",
    creatorId: "cr-1",
    posterId: "po-6",
    campaignId: "ca-6",
    messages: [
      {
        id: "m4",
        body: "You’re hired! Excited to create something together. The brief is ready in your workspace.",
        sender: "brand",
        time: "09:12",
      },
    ],
  },
];
export const notifications: Notice[] = [
  {
    id: "n1",
    title: "You made the shortlist!",
    body: "Glow Theory shortlisted your application.",
    href: "/c/applications",
    read: false,
    audience: "Creator",
  },
  {
    id: "n2",
    title: "Your next collab is here",
    body: "BoltFit hired you. Open your workspace to get started.",
    href: "/c/work/ca-6",
    read: false,
    audience: "Creator",
  },
  {
    id: "n3",
    title: "New message from Glow Theory",
    body: "Your creative ideas are getting noticed.",
    href: "/messages",
    read: false,
    audience: "Creator",
  },
];
