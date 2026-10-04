"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  ArrowUpRight,
  MapPin,
  BadgeCheck,
  Camera as Instagram,
  Video as Youtube,
  Clock,
  Users,
  Star,
} from "lucide-react";
import type { Campaign, Creator, Poster } from "@/types";
import { posters } from "@/lib/api";
import { formatINR, formatCount, timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
export function CampaignCard({
  campaign: c,
  compact = false,
}: {
  campaign: Campaign;
  compact?: boolean;
}) {
  const p = posters.find((p) => p.id === c.posterId) || posters[0];
  const { saved, toggleSave } = useStore();
  return (
    <article className={`campaign-card ${compact ? "compact" : ""}`}>
      <div className="card-cover">
        <Link href={`/campaigns/${c.slug}`}>
          <Image
            src={c.image}
            alt={`${c.niche} campaign inspiration`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Link>
        <span className="badge cover-badge">
          {c.featured
            ? "Featured"
            : c.urgent
              ? "Hiring now"
              : c.type === "Barter"
                ? "Barter collab"
                : "Open for creators"}
        </span>
        <button
          className={`save-button ${saved.includes(c.id) ? "saved" : ""}`}
          aria-label={
            saved.includes(c.id) ? "Unsave campaign" : "Save campaign"
          }
          onClick={() => toggleSave(c.id)}
        >
          <Bookmark
            size={18}
            fill={saved.includes(c.id) ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="card-body">
        <Link className="poster-label" href={`/agency/${p.slug}`}>
          <span className="monogram" style={{ background: p.color }}>
            {p.name.slice(0, 1)}
          </span>
          {p.name}
          {p.verified && <BadgeCheck size={15} className="brand-text" />}
          <span className={`badge ${c.type === "Barter" ? "coral" : "soft"}`}>
            {c.type}
          </span>
        </Link>
        <Link href={`/campaigns/${c.slug}`}>
          <h3>{c.title}</h3>
        </Link>
        <div className="card-meta">
          <span>
            {c.platform === "Instagram" ? (
              <Instagram size={14} />
            ) : (
              <Youtube size={14} />
            )}{" "}
            {c.platform}
          </span>
          <span>
            <MapPin size={14} />
            {c.city}
          </span>
        </div>
        <div className="chips">
          <span>{c.niche}</span>
          <span>{formatCount(c.followers)}+ followers</span>
          <span>{c.language}</span>
        </div>
        <div className="card-bottom">
          <div>
            <strong>
              {c.type === "Barter"
                ? `Worth ${formatINR(c.max)}`
                : `${formatINR(c.min)} - ${formatINR(c.max)}`}
            </strong>
            <small>
              {c.type === "Barter" ? "Product value" : "per creator"}
            </small>
          </div>
          <Link
            className="circle-link"
            aria-label={`View ${c.title}`}
            href={`/campaigns/${c.slug}`}
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="card-foot">
          <span>
            <Clock size={12} />
            {timeAgo(c.posted)}
          </span>
          <span>{c.needed} creator spots</span>
        </div>
      </div>
    </article>
  );
}
export function CreatorCard({ creator: c }: { creator: Creator }) {
  const { shortlist, toggleShortlist } = useStore();
  return (
    <article className="creator-card">
      <div className="creator-photo">
        <Link href={`/creator/${c.username}`}>
          <Image
            src={c.avatar}
            alt={c.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        <button
          className={`save-button ${shortlist.includes(c.id) ? "saved" : ""}`}
          aria-label={`Shortlist ${c.name}`}
          onClick={() => toggleShortlist(c.id)}
        >
          <Bookmark
            size={18}
            fill={shortlist.includes(c.id) ? "currentColor" : "none"}
          />
        </button>
        <span className="creator-category">{c.niche} creator</span>
      </div>
      <div className="creator-body">
        <Link href={`/creator/${c.username}`}>
          <h3>
            {c.name}
            {c.verified && <BadgeCheck size={17} className="brand-text" />}
          </h3>
        </Link>
        <span className="muted creator-city">
          <MapPin size={13} />
          {c.city} <span>•</span> {c.platform}
        </span>
        <div className="creator-stats">
          <div>
            <strong>{formatCount(c.followers)}</strong>
            <small>Followers</small>
          </div>
          <div>
            <strong>{c.engagement}%</strong>
            <small>Engagement</small>
          </div>
          <Link href={`/creator/${c.username}`} aria-label={`View ${c.name}`}>
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function PosterStats({ poster: p }: { poster: Poster }) {
  return (
    <div className="poster-stats">
      <div>
        <BriefIcon />
        <strong>{p.posted}</strong>
        <span>Campaigns posted</span>
      </div>
      <div>
        <Users size={18} />
        <strong>{p.hired}</strong>
        <span>Creators hired</span>
      </div>
      <div>
        <Clock size={18} />
        <strong>{p.response} hours</strong>
        <span>Avg. response</span>
      </div>
      <div>
        <Star size={18} />
        <strong>{p.rating.toFixed(1)} / 5</strong>
        <span>{p.reviews} creator reviews</span>
      </div>
    </div>
  );
}
function BriefIcon() {
  return <BadgeCheck size={18} />;
}
