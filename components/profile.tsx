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
  Eye,
  Heart,
  Clock,
  Camera,
  ShieldCheck,
  Check,
  Star,
  ChevronLeft,
  Play,
} from "lucide-react";
import { creators } from "@/lib/api";
import { formatCount, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Dialog } from "./ui/dialog";
import { SearchSelect } from "./ui/search-select";
import { Empty } from "./marketplace";
import { PlatformIcon } from "./cards";
import {
  completedCollabs,
  embedUrl,
  insights,
  isVideoFormat,
  platformLabels,
} from "@/lib/creator-insights";
import { platforms } from "@/lib/api";
import type { Creator } from "@/types";

// The same platform switcher appears in each section, kept in sync.
function PlatformTabs({
  c,
  value,
  onChange,
  compact = false,
}: {
  c: Creator;
  value: string;
  onChange: (p: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`platform-tabs ${compact ? "compact" : ""}`}
      role="tablist"
      aria-label="Platform"
    >
      {platforms.map((p) => {
        const on = c.platforms.find((x) => x.name === p);
        return (
          <button
            key={p}
            role="tab"
            aria-selected={value === p}
            className={value === p ? "selected" : ""}
            onClick={() => onChange(p)}
          >
            <PlatformIcon platform={p} size={16} /> {p}
            {!compact && on && <small>{formatCount(on.followers)}</small>}
          </button>
        );
      })}
    </div>
  );
}
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
    base && base.id === store.me.creatorId
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
  const [platform, setPlatform] = useState(c?.platform ?? "Instagram");
  const [content, setContent] = useState<string | null>(null);
  const [invite, setInvite] = useState(false);
  const ownCampaigns = mergeCampaigns(store.campaigns).filter(
    (x) => x.posterId === store.me.posterId,
  );
  const [pickedCampaign, setSelectedCampaign] = useState("");
  const selectedCampaign = pickedCampaign || ownCampaigns[0]?.id || "";
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
  const stats = insights(c, platform);
  const labels = platformLabels[platform] ?? platformLabels.Instagram;
  const own = c.id === store.me.creatorId;
  const allWork = [...(own ? store.portfolio : []), ...c.content];
  const work = allWork.filter((x) => (x.platform ?? c.platform) === platform);
  const preview = allWork.find((x) => x.id === content);
  const collabs = [
    ...completedCollabs(c.id, store.deals, mergeCampaigns(store.campaigns)),
    ...(own ? store.pastCollabs : []),
    ...c.collaborations,
  ];
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
            <PlatformTabs c={c} value={platform} onChange={setPlatform} />
            {stats ? (
              <>
                <div className="profile-stat-row">
                  <div>
                    <strong>{formatCount(stats.followers)}</strong>
                    <small>{labels.followers}</small>
                  </div>
                  <div>
                    <strong>{formatCount(stats.avgViews)}</strong>
                    <small>{labels.views}</small>
                  </div>
                  <div>
                    <strong>{stats.engagement}%</strong>
                    <small>Engagement rate</small>
                  </div>
                </div>
                <h3>Growing a real community.</h3>
                <span className="muted">
                  {platform} {labels.followers.toLowerCase()} over the last 90
                  days / sample social data
                </span>
                <GrowthChart data={stats.growth} />
              </>
            ) : (
              <p className="muted platform-missing">
                {c.name.split(" ")[0]} isn’t on {platform} yet.
              </p>
            )}
          </div>
          <section className="profile-section">
            <div className="section-row">
              <div>
                <h2>The content that connected.</h2>
                <p className="muted">
                  {platform} {labels.content} my community loved.
                </p>
              </div>
              <PlatformTabs
                c={c}
                value={platform}
                onChange={setPlatform}
                compact
              />
            </div>
            {work.length ? (
              <div className="viral-grid">
                {work.map((item) => (
                  <button
                    className="viral-card"
                    key={item.id}
                    onClick={() => setContent(item.id)}
                    aria-label={`Preview ${item.title}`}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                    />
                    {isVideoFormat(item.format ?? item.type) && (
                      <span className="viral-play" aria-hidden>
                        <Play size={18} fill="currentColor" />
                      </span>
                    )}
                    {item.duration && (
                      <span className="viral-duration">{item.duration}</span>
                    )}
                    <div>
                      <span>
                        <PlatformIcon
                          platform={item.platform ?? c.platform}
                          size={12}
                        />{" "}
                        {item.format ?? item.type}
                      </span>
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
            ) : (
              <p className="muted platform-missing">
                No {platform} work added yet.
              </p>
            )}
          </section>
          <section className="profile-section">
            <div className="section-row">
              <div>
                <h2>Meet my community.</h2>
                <p className="muted">
                  {stats
                    ? `${stats.india}% India-based audience on ${platform} / sample insights`
                    : `No ${platform} audience yet.`}
                </p>
              </div>
              <PlatformTabs
                c={c}
                value={platform}
                onChange={setPlatform}
                compact
              />
            </div>
            {stats && (
              <div className="audience-grid">
                <div className="panel">
                  <h3>Top cities</h3>
                  {stats.audience.map((a, i) => (
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
                  {stats.ages.map((a) => (
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
                  <GenderChart key={platform} data={stats.gender} />
                </div>
              </div>
            )}
          </section>
          <section className="panel profile-section">
            <h2>Brands I’ve worked with.</h2>
            <p className="muted">What we made together, and how it went.</p>
            {collabs.length ? (
              <div className="collab-list">
                {collabs.map((b, i) => (
                  <article className="collab-card" key={`${b.brand}-${i}`}>
                    <div className="collab-card-head">
                      <span className="monogram">{b.brand[0]}</span>
                      <div>
                        <h3>{b.brand}</h3>
                        <small>
                          {[b.platform, b.made, b.year]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      </div>
                      {b.viaCollabKaro ? (
                        <span className="badge lime">
                          <BadgeCheck size={13} /> Completed on CollabKaro
                        </span>
                      ) : (
                        <span className="badge soft">Shared by creator</span>
                      )}
                    </div>
                    <p>{b.result}</p>
                    {b.results && b.results.length > 0 && (
                      <div className="collab-results">
                        {b.results.map((r) => (
                          <div key={r.label}>
                            <strong>{r.value}</strong>
                            <small>{r.label}</small>
                          </div>
                        ))}
                      </div>
                    )}
                    {b.quote && (
                      <blockquote>
                        “{b.quote.text}”
                        <footer>
                          {b.quote.name}
                          {!b.viaCollabKaro && " · sample brand note"}
                        </footer>
                      </blockquote>
                    )}
                    {b.link && (
                      <a
                        className="text-button"
                        href={b.link}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        See the post
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">No brand collabs added yet.</p>
            )}
            <small className="block muted">
              Results are reported by the creator unless marked “Completed on
              CollabKaro”. Sample data in this demo.
            </small>
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
                        c.id === store.me.creatorId &&
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
        open={!!preview}
        onOpenChange={(o) => !o && setContent(null)}
        className="wide"
        title={preview?.title ?? "Content preview"}
        description={
          preview
            ? `${preview.platform ?? c.platform} ${preview.format ?? preview.type}${preview.duration ? ` · ${preview.duration}` : ""}`
            : ""
        }
      >
        {preview && (
          <>
            {embedUrl(preview.url) ? (
              <div
                className={`embed-frame ${preview.platform === "Instagram" ? "tall" : ""}`}
              >
                <iframe
                  src={embedUrl(preview.url)}
                  title={preview.title}
                  allow="encrypted-media; picture-in-picture; fullscreen"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <Image
                className="lightbox-image"
                src={preview.image}
                width={800}
                height={600}
                alt={preview.title}
              />
            )}
            <p>
              {formatCount(preview.views)} views / {formatCount(preview.likes)}{" "}
              likes
            </p>
            {preview.url ? (
              <a
                className="text-button"
                href={preview.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open on {preview.platform ?? "the platform"}
                <ArrowUpRight size={14} />
              </a>
            ) : (
              <p className="muted">
                Sample portfolio item. When a creator adds a link to the real
                post, it plays right here.
              </p>
            )}
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
            <SearchSelect
              label="Pick your campaign"
              value={selectedCampaign}
              onChange={setSelectedCampaign}
              options={ownCampaigns.map((c) => ({
                value: c.id,
                label: c.title,
              }))}
            />
          </label>
          <button
            className="button"
            onClick={() => {
              const chat = store.startChat(
                c.id,
                store.me.posterId,
                selectedCampaign,
              );
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
