"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  MapPin,
  Camera as Instagram,
  BadgeCheck,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Check,
  Plus,
  TrendingUp,
  ChevronDown,
  Briefcase,
  Heart,
  Users,
} from "lucide-react";
import {
  campaigns,
  creators,
  posters,
  niches,
  cities,
  platforms,
  photo,
} from "@/lib/api";
import { CampaignCard, CreatorCard } from "./cards";
import { CommunityStats } from "./community-stats";
export function Home() {
  const [side, setSide] = useState("creator");
  const [word, setWord] = useState(0);
  const [platform, setPlatform] = useState("");
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setWord((w) => (w + 1) % 3), 3500);
    return () => clearInterval(id);
  }, [reduce]);
  const search = () => {
    const p = new URLSearchParams();
    if (platform) p.set("platform", platform);
    if (niche) p.set("niche", niche);
    if (city) p.set("city", city);
    router.push(`${side === "creator" ? "/campaigns" : "/a/discover"}?${p}`);
  };
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow">
              <span className="eyebrow-spark">
                <Sparkles size={14} />
              </span>{" "}
              BIG IDEAS. REAL COLLABS. MADE IN INDIA.
            </div>
            <div className="segmented hero-toggle">
              <button
                className={side === "creator" ? "selected" : ""}
                onClick={() => setSide("creator")}
              >
                <UserIcon />
                I’m a Creator
              </button>
              <button
                className={side === "brand" ? "selected" : ""}
                onClick={() => setSide("brand")}
              >
                <Briefcase size={15} />
                I’m a Brand
              </button>
            </div>
            <h1>
              {side === "creator" ? (
                <>
                  Your creativity.
                  <br />
                  Your next{" "}
                  <span className="hero-highlight">
                    big collab.
                    <span className="scribble" />
                  </span>
                </>
              ) : (
                <>
                  Great brands.
                  <br />
                  Meet your next
                  <br />
                  <span className="hero-highlight">
                    great creator.
                    <span className="scribble" />
                  </span>
                </>
              )}
            </h1>
            <p className="hero-description">
              {side === "creator"
                ? "Find brands that get your vibe. Apply to exciting campaigns, create what you love, and get paid for it."
                : "Find authentic voices for your brand. Discover creators, post your brief, and make great work happen."}
              <br />
              <strong>Collab karo. Grow karo.</strong>
            </p>
            <div className="hero-ctas">
              <Link
                className="button"
                href={side === "creator" ? "/campaigns" : "/a/campaigns/new"}
              >
                {side === "creator"
                  ? "Find my next collab"
                  : "Post your first campaign"}
                <ArrowUpRight size={19} />
              </Link>
              <Link
                className="button secondary"
                href={side === "creator" ? "/creators" : "/brands"}
              >
                {side === "creator" ? "How it works" : "Explore creators"}
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                {creators.slice(0, 4).map((c) => (
                  <Image
                    key={c.id}
                    src={c.avatar}
                    alt=""
                    width={34}
                    height={34}
                  />
                ))}
              </div>
              <div>
                <span className="stars">★★★★★</span>
                <span>Your next opportunity starts here.</span>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="hero-visual"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="hero-grid-bg" />
          <div className="orbit-label">
            <Sparkles size={16} /> {["Creators", "Brands", "Agencies"][word]}{" "}
            meet possibility
          </div>
          <div className="hero-photo-main">
            <Image
              src={photo("photo-1524504388940-b1c1722653e1", 900)}
              alt="Creator ready for her next brand collaboration"
              fill
              priority
              sizes="(max-width: 768px) 85vw, 38vw"
            />
            <div className="hero-photo-caption">
              <span className="badge lime">CREATE. CONNECT. GROW.</span>
              <strong>
                Made for your
                <br />
                kind of creative.
              </strong>
            </div>
          </div>
          <Link href="/creator/aanya.sharma" className="hero-profile-float">
            <Image
              src={creators[0].avatar}
              width={42}
              height={42}
              alt="Aanya Sharma"
            />
            <div>
              <strong>
                Aanya Sharma <BadgeCheck size={13} />
              </strong>
              <small>Fashion & lifestyle creator</small>
              <div className="mini-stats">
                <b>
                  1.2L <span>followers</span>
                </b>
                <b>
                  5.8% <span>engagement</span>
                </b>
              </div>
            </div>
            <span className="engagement-ring">
              <TrendingUp size={20} />
            </span>
          </Link>
          <Link
            className="hero-campaign-float"
            href="/campaigns/festive-fashion-edit"
          >
            <div className="float-card-top">
              <span className="monogram" style={{ background: "#efe9ff" }}>
                K
              </span>
              <div>
                <strong>
                  Kurta Kraft <BadgeCheck size={12} />
                </strong>
                <small>New campaign just dropped</small>
              </div>
              <span className="badge coral">PAID</span>
            </div>
            <div className="float-title">
              The festive edit.
              <br />
              Styled by you.
            </div>
            <div>
              <span>₹15,000 - ₹25,000</span>
              <ArrowUpRight size={20} />
            </div>
          </Link>
          <div className="hero-message">
            <span className="message-check">
              <Check size={15} />
            </span>
            <div>
              <strong>You’re hired!</strong>
              <small>Let’s make something great.</small>
            </div>
            <Heart size={18} />
          </div>
          <div className="hero-doodle">
            <Sparkles size={36} />
          </div>
          <span className="hero-note">
            Less cold DMs.
            <br />
            More warm hellos.
          </span>
        </motion.div>
      </section>
      <section className="search-section container">
        <div className="search-panel">
          <div className="search-panel-title">
            <Search size={18} />
            <strong>Your next collab is a search away.</strong>
            <span>Find your people. Find your fit.</span>
          </div>
          <div className="hero-search">
            <label>
              <Instagram size={18} />
              <span>
                <small>PLATFORM</small>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="">All platforms</option>
                  {platforms.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </span>
              <ChevronDown size={15} />
            </label>
            <label>
              <Sparkles size={18} />
              <span>
                <small>YOUR NICHE</small>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                >
                  <option value="">All categories</option>
                  {niches.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </span>
              <ChevronDown size={15} />
            </label>
            <label>
              <MapPin size={18} />
              <span>
                <small>LOCATION</small>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">Anywhere in India</option>
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </span>
              <ChevronDown size={15} />
            </label>
            <button className="button" onClick={search}>
              <Search size={18} />
              Find {side === "creator" ? "campaigns" : "creators"}
            </button>
          </div>
          <div className="quick-filters">
            <span>Popular right now</span>
            {[
              ["Barter collabs", "type=Barter"],
              ["Under ₹10K", "max=10000"],
              ["Rising creators", "rising=1"],
              ["Tech", "niche=Tech"],
              ["Beauty", "niche=Beauty"],
              ["Hiring now", "urgent=1"],
            ].map(([name, query]) => (
              <Link
                key={name}
                href={`${name === "Rising creators" ? "/a/discover" : "/campaigns"}?${query}`}
              >
                {name}
                <ArrowUpRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="brand-strip container">
        <p>
          GOOD COMPANY FOR YOUR NEXT COLLAB{" "}
          <span>Sample partner community</span>
        </p>
        <div className="brand-marquee">
          <div>
            {[...posters.slice(0, 6), ...posters.slice(0, 6)].map((p, i) => (
              <Link
                key={i}
                href={`/agency/${p.slug}`}
                className={`partner partner-${i % 3}`}
              >
                {i % 3 === 0 && <span className="partner-symbol">✳</span>}
                {p.name}
                {i % 3 === 1 && <span className="partner-dot">®</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CommunityStats />
      <section className="section container">
        <SectionHeader
          label="FRESH OPPORTUNITIES"
          title="Your next big collab is calling."
          subtitle="Real briefs. Clear budgets. Brands ready to create with you."
          href="/campaigns"
          link="Explore all campaigns"
        />
        <div className="campaign-grid">
          {campaigns.slice(0, 3).map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
        <div className="campaign-reassurance">
          <ShieldCheck size={16} />
          <span>
            Clear expectations. Verified brands. Your creativity comes first.
          </span>
        </div>
      </section>
      <section className="how-section">
        <div className="container">
          <SectionHeader
            label="FROM HELLO TO LET’S GO"
            title="Good collabs. Zero guesswork."
            subtitle="A little less admin. A lot more creating."
          />
          <div className="how-layout">
            <div>
              <div className="segmented">
                <button
                  className={side === "creator" ? "selected" : ""}
                  onClick={() => setSide("creator")}
                >
                  For creators
                </button>
                <button
                  className={side === "brand" ? "selected" : ""}
                  onClick={() => setSide("brand")}
                >
                  For brands
                </button>
              </div>
              <div className="steps">
                {(side === "creator"
                  ? [
                      [
                        "Make it yours",
                        "Build your profile. Let your content and community do the talking.",
                      ],
                      [
                        "Find your kind of collab",
                        "Explore campaigns that match your niche, budget, and creative style.",
                      ],
                      [
                        "Pitch. Create. Get paid.",
                        "Send your idea, connect with the brand, and turn a good fit into great work.",
                      ],
                    ]
                  : [
                      [
                        "Share your vision",
                        "Post a clear brief, your budget, and the creators you’re looking for.",
                      ],
                      [
                        "Meet your creative match",
                        "Review applications or discover authentic voices for your brand.",
                      ],
                      [
                        "Make great work happen",
                        "Chat, hire, review the content, and grow together.",
                      ],
                    ]
                ).map(([name, text], i) => (
                  <motion.div
                    key={name}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="step"
                  >
                    <span>{i + 1}</span>
                    <div>
                      <h3>{name}</h3>
                      <p>{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="transparency-demo">
              <div className="demo-heading">
                <span
                  className="monogram large"
                  style={{ background: "#efe9ff" }}
                >
                  S
                </span>
                <div>
                  <h3>
                    Social Sutra <BadgeCheck size={19} />
                  </h3>
                  <span>Verified agency • Mumbai</span>
                </div>
                <span className="badge lime">TRUSTED</span>
              </div>
              <div className="transparency-stats">
                <div>
                  <strong>82</strong>
                  <span>Campaigns posted</span>
                </div>
                <div>
                  <strong>246</strong>
                  <span>Creators hired</span>
                </div>
                <div>
                  <strong>4 hrs</strong>
                  <span>Avg. response time</span>
                </div>
                <div>
                  <strong>98%</strong>
                  <span>Pays on time</span>
                </div>
              </div>
              <div className="agency-review">
                <div className="stars">
                  ★★★★★ <span>4.9 from 46 sample reviews</span>
                </div>
                <p>
                  “Clear briefs, quick replies, and payments that arrive when
                  they say they will.”
                </p>
                <span>Meera J. / Lifestyle creator</span>
              </div>
              <Link href="/agency/social-sutra" className="text-button">
                Know who you’re collabing with <ArrowRight size={16} />
              </Link>
              <span className="transparency-tag">
                <ShieldCheck size={16} /> TRANSPARENCY IS OUR THING.
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeader
          label="THE PEOPLE BEHIND THE CONTENT"
          title="Different voices. Endless possibilities."
          subtitle="Meet the creators making communities, not just content."
          href="/a/discover"
          link="Discover all creators"
        />
        <div className="creator-grid">
          {creators.slice(0, 4).map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      </section>
      <section className="section container">
        <div className="feature-bento">
          <div className="feature-main">
            <span className="eyebrow">BUILT FOR THE WAY YOU COLLAB</span>
            <h2>
              Big on creativity.
              <br />
              Even bigger on trust.
            </h2>
            <p>
              From your first barter deal to your biggest brand partnership.
              Everything you need, in one place.
            </p>
            <Link className="button" href="/signup">
              Find your people <ArrowUpRight size={17} />
            </Link>
            <div className="feature-sign">
              <ShieldCheck size={56} />
              <span>
                Good vibes.
                <br />
                Better safeguards.
              </span>
            </div>
          </div>
          <div className="feature-small">
            <MessageCircle size={26} />
            <h3>Your collab, one conversation away.</h3>
            <p>
              Pitch, discuss, and create together with built-in chat. No endless
              inbox hopping.
            </p>
            <Link href="/messages">
              Let’s talk <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="feature-small coral-tint">
            <MapPin size={26} />
            <h3>India’s creativity. All of it.</h3>
            <p>
              Regional voices, INR budgets, and paid, barter, or affiliate
              opportunities.
            </p>
            <div className="chips">
              <span>Hindi</span>
              <span>Tamil</span>
              <span>Marathi</span>
              <span>+8 more</span>
            </div>
          </div>
        </div>
      </section>
      <section className="community-section container">
        <div>
          <span className="eyebrow">SMALL STARTS. BIG STORIES.</span>
          <h2>
            Your kind of
            <br />
            success story.
          </h2>
          <p>
            Better matches make better work.
            <br />
            Here’s what that can look like.
          </p>
          <span className="badge soft">ILLUSTRATIVE CASE STUDIES</span>
        </div>
        <div className="case-study">
          <Image
            src={photo("photo-1504674900247-0877df9cc836", 700)}
            alt="Food creator campaign example"
            width={560}
            height={350}
          />
          <div>
            <span>MASALA BOX × REGIONAL FOOD CREATORS</span>
            <h3>
              A little local flavour.
              <br />A whole lot of love.
            </h3>
            <div className="case-metrics">
              <div>
                <strong>2.8L</strong>
                <small>Sample reach</small>
              </div>
              <div>
                <strong>6.2%</strong>
                <small>Sample engagement</small>
              </div>
              <div>
                <strong>12</strong>
                <small>Creators collaborating</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeader
          label="BETTER TOGETHER"
          title="Collabs that feel like a good fit."
        />
        <div className="testimonial-grid">
          {[
            [
              "Aanya Sharma",
              "Fashion creator",
              "“I can see the budget and the brand’s track record before applying. That makes all the difference.”",
            ],
            [
              "Ritika Sethi",
              "Brand lead, Kurta Kraft",
              "“We spend more time on creative ideas and less time trying to find the right people.”",
            ],
            [
              "Rohan Mehta",
              "Tech creator",
              "“A clear brief, a real conversation, and a fair price. That’s my kind of collab.”",
            ],
          ].map(([name, role, quote], i) => (
            <div className="testimonial" key={name}>
              <span className="stars">★★★★★</span>
              <p>{quote}</p>
              <div>
                <Image src={creators[i].avatar} width={40} height={40} alt="" />
                <span>
                  <strong>{name}</strong>
                  <small>{role} / Demo testimonial</small>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="faq-section container">
        <div>
          <span className="eyebrow">A LITTLE CLARITY</span>
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
          <p>
            Still curious about something?
            <br />
            <Link href="/contact">
              We’re a message away <ArrowUpRight size={15} />
            </Link>
          </p>
        </div>
        <div className="faq-list">
          {[
            [
              "Is CollabKaro free for creators?",
              "Yes. Creating a profile, browsing campaigns, and sending applications is free. Creator Pro adds profile tools and extra visibility.",
            ],
            [
              "Do I need a huge following to join?",
              "No. Nano and micro creators are welcome. Each campaign lists its own follower and niche requirements.",
            ],
            [
              "How do I know a brand is genuine?",
              "Check their verification badge, campaign history, creator reviews, average response time, and pays-on-time rating. All current data is illustrative for this demo.",
            ],
            [
              "Can I find barter and affiliate collaborations?",
              "Absolutely. Filter campaigns by Paid, Barter, or Affiliate to find the right match.",
            ],
            [
              "Are payments handled on CollabKaro?",
              "This frontend demo does not process payments. Live payment and escrow integration is planned for a later phase.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="final-cta container">
        <div>
          <span className="eyebrow">
            YOUR NEXT CHAPTER STARTS WITH A HELLO.
          </span>
          <h2>
            Less searching.
            <br />
            More <span>collab karo.</span>
          </h2>
          <p>
            For the creators with ideas. And the brands that believe in them.
          </p>
        </div>
        <div>
          <Link className="button" href="/signup">
            Let’s make it happen <ArrowUpRight size={19} />
          </Link>
          <span>Free to join. Full of possibilities.</span>
          <div className="cta-spark">
            <Sparkles size={60} />
          </div>
        </div>
      </section>
    </>
  );
}
function UserIcon() {
  return <Users size={15} />;
}
export function SectionHeader({
  label,
  title,
  subtitle,
  href,
  link,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-header">
      <div>
        {label && <span className="eyebrow">{label}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {href && (
        <Link className="text-button" href={href}>
          {link}
          <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
