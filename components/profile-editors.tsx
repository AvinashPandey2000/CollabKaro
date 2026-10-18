"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { platforms, photo, covers } from "@/lib/api";
import { useStore } from "@/lib/store";
import { deliverableFormats } from "@/lib/campaign-options";
import { embedUrl, platformFromUrl } from "@/lib/creator-insights";
import { formatCount } from "@/lib/format";
import { ImageUpload } from "./ui/image-upload";
import { PlatformIcon } from "./cards";

const formatsFor = (p: string) =>
  (deliverableFormats[p] ?? []).map((f) => f.label);

// Creators add links to their real posts. YouTube and Instagram links play
// inside the media kit; LinkedIn opens on LinkedIn.
export function PortfolioEditor() {
  const s = useStore();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [format, setFormat] = useState(formatsFor("Instagram")[0]);
  const [duration, setDuration] = useState("");
  const [views, setViews] = useState("");
  const [image, setImage] = useState("");
  const add = () => {
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
      if (parsed.protocol !== "https:") throw new Error();
    } catch {
      return toast.error("Paste the full https:// link to your post.");
    }
    if (title.trim().length < 3) return toast.error("Give it a short title.");
    if (duration && !/^\d{1,2}:\d{2}$/.test(duration.trim()))
      return toast.error("Write the length like 0:45 or 8:24.");
    s.addPortfolio({
      id: crypto.randomUUID(),
      url: parsed.toString(),
      title: title.trim(),
      platform,
      format,
      type: format,
      duration: duration.trim() || undefined,
      views: Number(views) || 0,
      likes: 0,
      image: image || photo(covers[s.portfolio.length % covers.length], 600),
      date: new Date().toISOString().slice(0, 10),
    });
    setUrl("");
    setTitle("");
    setDuration("");
    setViews("");
    setImage("");
    toast.success("Added to your media kit.");
  };
  return (
    <div className="profile-editor">
      <h3>Your work</h3>
      <p className="builder-help">
        Add links to posts and videos you’re proud of, so brands can see your
        style on each platform.
      </p>
      {s.portfolio.length > 0 && (
        <ul className="editor-list">
          {s.portfolio.map((item) => (
            <li key={item.id}>
              <Image src={item.image} width={56} height={42} alt="" />
              <span>
                <strong>{item.title}</strong>
                <small>
                  <PlatformIcon platform={item.platform ?? ""} size={12} />{" "}
                  {item.platform} {item.format}
                  {item.duration && ` · ${item.duration}`}
                  {embedUrl(item.url) ? " · plays in your kit" : ""}
                </small>
              </span>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ${item.title}`}
                onClick={() => s.removePortfolio(item.id)}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="field">
        <span>Link to the post or video</span>
        <input
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=… or instagram.com/reel/…"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            const p = platformFromUrl(e.target.value);
            if (p && p !== platform) {
              setPlatform(p);
              setFormat(formatsFor(p)[0]);
            }
          }}
        />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Title</span>
          <input
            value={title}
            maxLength={70}
            placeholder="e.g. Festive lookbook reel"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Platform</span>
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setFormat(formatsFor(e.target.value)[0]);
            }}
          >
            {platforms.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Format</span>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {formatsFor(platform).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Length (optional)</span>
          <input
            value={duration}
            placeholder="0:45"
            onChange={(e) => setDuration(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Views (optional)</span>
          <input
            type="number"
            min={0}
            value={views}
            onChange={(e) => setViews(e.target.value)}
          />
          {Number(views) > 0 && (
            <small>{formatCount(Number(views))} views</small>
          )}
        </label>
      </div>
      <ImageUpload
        label="Thumbnail (optional)"
        hint="A frame from the video works well."
        recommended={{ width: 800, height: 600 }}
        value={image}
        onChange={setImage}
      />
      <button type="button" className="button secondary" onClick={add}>
        <Plus size={16} />
        Add to my media kit
      </button>
    </div>
  );
}

export function PastCollabEditor() {
  const s = useStore();
  const [brand, setBrand] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [made, setMade] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [result, setResult] = useState("");
  const [viewsN, setViewsN] = useState("");
  const [er, setEr] = useState("");
  const [clicks, setClicks] = useState("");
  const [link, setLink] = useState("");
  const add = () => {
    if (brand.trim().length < 2) return toast.error("Add the brand’s name.");
    if (made.trim().length < 3)
      return toast.error("Say what you made, e.g. 2 Reels + 3 Stories.");
    if (link && !/^https:\/\/\S+$/.test(link.trim()))
      return toast.error("Links should start with https://");
    const results = [
      viewsN && { label: "Views", value: formatCount(Number(viewsN)) },
      er && { label: "Engagement", value: `${er}%` },
      clicks && { label: "Link clicks", value: formatCount(Number(clicks)) },
    ].filter(Boolean) as { label: string; value: string }[];
    s.addPastCollab({
      brand: brand.trim(),
      platform,
      made: made.trim(),
      year,
      result: result.trim() || `${made.trim()} for ${brand.trim()}`,
      results,
      link: link.trim() || undefined,
    });
    setBrand("");
    setMade("");
    setResult("");
    setViewsN("");
    setEr("");
    setClicks("");
    setLink("");
    toast.success("Collab added to your media kit.");
  };
  return (
    <div className="profile-editor">
      <h3>Brands you’ve worked with</h3>
      <p className="builder-help">
        Share past collabs and how they went. They show as “Shared by creator”.
        Collabs you finish on CollabKaro are added and marked automatically.
      </p>
      {s.pastCollabs.length > 0 && (
        <ul className="editor-list">
          {s.pastCollabs.map((c, i) => (
            <li key={`${c.brand}-${i}`}>
              <span className="monogram">{c.brand[0]}</span>
              <span>
                <strong>{c.brand}</strong>
                <small>
                  {[c.platform, c.made, c.year].filter(Boolean).join(" · ")}
                </small>
              </span>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ${c.brand}`}
                onClick={() => s.removePastCollab(i)}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="form-grid">
        <label className="field">
          <span>Brand</span>
          <input
            value={brand}
            maxLength={60}
            onChange={(e) => setBrand(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Platform</span>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {platforms.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>What you made</span>
          <input
            value={made}
            maxLength={80}
            placeholder="e.g. 2 Reels + 3 Stories"
            onChange={(e) => setMade(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[0, 1, 2, 3, 4].map((n) => {
              const y = String(new Date().getFullYear() - n);
              return <option key={y}>{y}</option>;
            })}
          </select>
        </label>
      </div>
      <label className="field">
        <span>What you achieved together</span>
        <input
          value={result}
          maxLength={120}
          placeholder="e.g. The launch reel became their most-saved post"
          onChange={(e) => setResult(e.target.value)}
        />
      </label>
      <div className="form-grid three">
        <label className="field">
          <span>Views (optional)</span>
          <input
            type="number"
            min={0}
            value={viewsN}
            onChange={(e) => setViewsN(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Engagement % (optional)</span>
          <input
            type="number"
            min={0}
            step="0.1"
            value={er}
            onChange={(e) => setEr(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Link clicks (optional)</span>
          <input
            type="number"
            min={0}
            value={clicks}
            onChange={(e) => setClicks(e.target.value)}
          />
        </label>
      </div>
      <label className="field">
        <span>Link to the post (optional)</span>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </label>
      <button type="button" className="button secondary" onClick={add}>
        <Plus size={16} />
        Add collab
      </button>
    </div>
  );
}
