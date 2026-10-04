"use client";
import { mergeCampaigns } from "@/lib/api";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  ArrowUpRight,
  MessageCircle,
  Bookmark,
  Camera as Instagram,
  Video as Youtube,
  Eye,
  Heart,
  Clock,
  Camera,
  ShieldCheck,
  Check,
  Star,
  ChevronLeft,
} from "lucide-react";
import { creators, campaigns } from "@/lib/api";
import { formatCount, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Dialog } from "./ui/dialog";
import { Empty } from "./marketplace";
import { toast } from "sonner";
const GrowthChart = dynamic(
  () => import("./charts").then((m) => m.GrowthChart),
  { ssr: false, loading: () => <div className="chart skeleton" /> },
);
const GenderChart = dynamic(
  () => import("./charts").then((m) => m.GenderChart),
  { ssr: false },
);
export function CreatorProfile({ username }: { username: string }) {
  const base = creators.find((c) => c.username === username);
  const store = useStore();
  const c =
    base && base.id === "cr-1"
      ? {
          ...base,
          name: store.profile.name || base.name,
          bio: store.profile.bio || base.bio,
          city: store.profile.city || base.city,
          niche: store.profile.niche || base.niche,
          turnaround: Number(store.profile.turnaround) || base.turnaround,
          price: Number(store.profile.rate) || base.price,
        }
      : base;
  const router = useRouter();
  const [platform, setPlatform] = useState("Instagram");
  const [content, setContent] = useState<number | null>(null);
  const [invite, setInvite] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("ca-1");
  if (!c)
    return (
      <Empty
        title="Creator not found"
        text="There are plenty of creative voices to meet."
        href="/a/discover"
        label="Discover creators"
      />
    );
  const brand = store.role === "Brand-Agency";
  const social = c.platforms.find((p) => p.name === platform)!;
  const message = () => {
    if (!brand) {
      toast.info(
        "Select Brand-Agency in the role switcher to contact creators.",
      );
      return;
    }
    const id = store.startChat(c.id);
    router.push(`/messages?thread=${id}`);
  };
  return (
    <div className="container page-wrap">
      <Link href="/a/discover" className="back-link">
        <ChevronLeft size={16} />
        Meet more creators
      </Link>
      <div className="profile-cover">
        <Image
          src={c.cover}
          alt={`${c.name}'s creative moodboard`}
          fill
          sizes="100vw"
        />
        <span>THE CREATOR MEDIA KIT</span>
      </div>
      <div className="profile-header">
        <Image
          className="profile-avatar"
          src={c.avatar}
          width={120}
          height={120}
          alt={c.name}
        />
        <div>
          <h1>
            {c.name}
            {c.verified && <BadgeCheck size={28} className="brand-text" />}
          </h1>
          <p>@{c.username}</p>
          <span>
            <MapPin size={15} />
            {c.city} • {c.languages.join(", ")}
          </span>
          <div className="chips">
            {c.niches.map((n) => (
              <span key={n}>{n}</span>
            ))}
            <span>Open to collabs</span>
          </div>
        </div>
        <div className="profile-actions">
          <button className="button" onClick={message}>
            <MessageCircle size={17} />
            Message creator
          </button>
          <button
            className="button secondary"
            onClick={() =>
              brand
                ? setInvite(true)
                : toast.info(
                    "Switch to Brand-Agency to send a campaign invite.",
                  )
            }
          >
            Invite to campaign
            <ArrowUpRight size={16} />
          </button>
          <button
            className="text-button"
            onClick={() => store.toggleShortlist(c.id)}
          >
            <Bookmark size={16} />
            {store.shortlist.includes(c.id)
              ? "In your shortlist"
              : "Save to shortlist"}
          </button>
        </div>
      </div>
      <div className="profile-layout">
        <div>
          <div className="panel">
            <h2>A little about me.</h2>
            <p>{c.bio}</p>
            <div className="platform-tabs">
              {c.platforms.map((p) => (
                <button
                  className={platform === p.name ? "selected" : ""}
                  key={p.name}
                  onClick={() => setPlatform(p.name)}
                >
                  {p.name === "Instagram" ? (
                    <Instagram size={18} />
                  ) : (
                    <Youtube size={18} />
                  )}{" "}
                  {p.name}
                </button>
              ))}
            </div>
            <div className="profile-stat-row">
              <div>
                <strong>{formatCount(social.followers)}</strong>
                <small>Followers</small>
              </div>
              <div>
                <strong>{formatCount(c.views)}</strong>
                <small>Average views</small>
              </div>
              <div>
                <strong>{c.engagement}%</strong>
                <small>Engagement rate</small>
              </div>
            </div>
            <h3>Growing a real community.</h3>
            <span className="muted">
              Follower growth over the last 90 days / sample social data
            </span>
            <GrowthChart data={c.growth} />
          </div>
          <section className="profile-section">
            <h2>The content that connected.</h2>
            <p className="muted">A few stories my community loved.</p>
            <div className="viral-grid">
              {c.content.map((item, i) => (
                <button
                  className="viral-card"
                  key={item.id}
                  onClick={() => setContent(i)}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                  <div>
                    <span>{item.type}</span>
                    <strong>{item.title}</strong>
                    <span>
                      <Eye size={14} />
                      {formatCount(item.views)}
                      <Heart size={14} />
                      {formatCount(item.likes)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <section className="profile-section">
            <h2>Meet my community.</h2>
            <p className="muted">
              {c.india}% India-based audience / sample insights
            </p>
            <div className="audience-grid">
              <div className="panel">
                <h3>Top cities</h3>
                {c.audience.map((a, i) => (
                  <div className="audience-bar" key={`${a.city}-${i}`}>
                    <span>
                      {a.city}
                      <strong>{a.value}%</strong>
                    </span>
                    <div>
                      <i style={{ width: `${a.value * 2.5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <h3>Age groups</h3>
                {c.ages.map((a) => (
                  <div className="audience-bar" key={a.age}>
                    <span>
                      {a.age}
                      <strong>{a.value}%</strong>
                    </span>
                    <div>
                      <i style={{ width: `${a.value * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <h3>Audience mix</h3>
                <GenderChart data={c.gender} />
              </div>
            </div>
          </section>
          <section className="panel">
            <h2>Brands I’ve created with.</h2>
            {c.collaborations.map((b) => (
              <div className="collab-history" key={b.brand}>
                <span className="monogram">{b.brand[0]}</span>
                <div>
                  <h3>{b.brand}</h3>
                  <p>{b.result}</p>
                </div>
                <BadgeCheck size={21} className="brand-text" />
              </div>
            ))}
          </section>
          <section className="panel profile-section">
            <h2>A few kind words.</h2>
            {c.testimonials.map((t) => (
              <div key={t.name}>
                <span className="stars">★★★★★</span>
                <p>“{t.text}”</p>
                <strong>{t.name}</strong>
                <small className="block muted">Sample brand testimonial</small>
              </div>
            ))}
          </section>
        </div>
        <aside>
          <div className="panel rate-panel">
            <span className="eyebrow">LET’S MAKE SOMETHING GREAT</span>
            <h2>My rate card</h2>
            {brand ? (
              <>
                {c.rates.map((r) => (
                  <div className="rate-row" key={r.type}>
                    <span>{r.type}</span>
                    <strong>
                      {formatINR(
                        c.id === "cr-1" &&
                          r.type === "Reel" &&
                          store.profile.rate
                          ? Number(store.profile.rate)
                          : r.price,
                      )}
                    </strong>
                  </div>
                ))}
                <div className="info-box">
                  Package: 1 reel + 3 stories, from {formatINR(c.price)}
                </div>
              </>
            ) : (
              <div className="info-box">
                <ShieldCheck size={22} />
                <span>
                  Rate cards are visible to logged-in brands and agencies.
                  Switch to Brand-Agency to explore this demo.
                </span>
              </div>
            )}
            <button className="button full" onClick={message}>
              Talk about a collab
              <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="panel work-details">
            <h3>How I work</h3>
            <p>
              <Clock size={17} />
              {c.turnaround}-day turnaround
            </p>
            <p>
              <Check size={17} />
              {c.revisions} revisions included
            </p>
            <p>
              <Camera size={17} />
              Home, studio & outdoor shoots
            </p>
            <h4>Open to</h4>
            <div className="chips">
              {c.collabTypes.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <h4>My setup</h4>
            {c.equipment.map((e) => (
              <p key={e}>
                <Check size={14} />
                {e}
              </p>
            ))}
            <h4>Achievements</h4>
            {c.achievements.map((a) => (
              <p key={a}>
                <Star size={14} />
                {a}
              </p>
            ))}
            <h4>Categories I don’t promote</h4>
            <span className="muted">{c.restrictions.join(", ")}</span>
          </div>
        </aside>
      </div>
      <Dialog
        open={content !== null}
        onOpenChange={(o) => !o && setContent(null)}
        title={content !== null ? c.content[content].title : "Content preview"}
        description="Portfolio image preview. Video playback will be available when creator content is connected."
      >
        {content !== null && (
          <>
            <Image
              className="lightbox-image"
              src={c.content[content].image}
              width={800}
              height={600}
              alt={c.content[content].title}
            />
            <p>
              {formatCount(c.content[content].views)} views /{" "}
              {formatCount(c.content[content].likes)} likes
            </p>
          </>
        )}
      </Dialog>
      <Dialog
        open={invite}
        onOpenChange={setInvite}
        title={`Invite ${c.name.split(" ")[0]} to collaborate.`}
      >
        <div className="form-stack">
          <label className="field">
            <span>Pick your campaign</span>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
            >
              {[
                ...store.campaigns,
                ...campaigns.filter((c) => c.posterId === "po-1"),
              ].map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button"
            onClick={() => {
              const chat = store.startChat(c.id, "po-1", selectedCampaign);
              store.send(chat, {
                id: crypto.randomUUID(),
                body: `We would love to invite you to our campaign: ${mergeCampaigns(store.campaigns).find((x) => x.id === selectedCampaign)?.title}. Let’s discuss your creative ideas!`,
                sender: "brand",
                time: new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              });
              setInvite(false);
              toast.success("Campaign invite sent.");
              router.push(`/messages?thread=${chat}`);
            }}
          >
            Send invite
            <ArrowUpRight size={17} />
          </button>
        </div>
      </Dialog>
    </div>
  );
}
