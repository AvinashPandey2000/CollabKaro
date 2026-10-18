"use client";
import { mergeCampaigns } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  BadgeCheck,
  ArrowUpRight,
  MapPin,
  Users,
  Bookmark,
  ShieldCheck,
  ChevronLeft,
  LayoutGrid,
  List,
  GitCompare,
  Send,
  Calendar,
} from "lucide-react";
import {
  campaigns,
  creators,
  posters,
  niches,
  cities,
  languages,
  platforms,
} from "@/lib/api";
import { useStore } from "@/lib/store";
import {
  formatINR,
  formatCount,
  campaignValue,
  servesCity,
} from "@/lib/format";
import { SearchSelect } from "./ui/search-select";
import { MultiSelect } from "./ui/multi-select";
import {
  CampaignCard,
  CreatorCard,
  PosterStats,
  PlatformIcon,
  BrandMark,
  campaignBrand,
  campaignPlatforms,
  DosDonts,
} from "./cards";
import { ORGANIC_USAGE, usageLine, usageNotes } from "@/lib/campaign-options";
import { Dialog } from "./ui/dialog";
import { SectionHeader } from "./home";
const applicationSchema = z.object({
  pitch: z
    .string()
    .min(
      40,
      "Write at least 40 characters so the brand can understand your idea.",
    )
    .max(1000),
  quote: z.number().min(1, "Enter a valid price.").max(10000000),
});
type ApplicationForm = z.infer<typeof applicationSchema>;
export function Campaigns({ savedOnly = false }: { savedOnly?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const [search, setSearch] = useState(params.get("q") || "");
  const [niche, setNiche] = useState(params.get("niche") || "");
  const [platform, setPlatform] = useState(params.get("platform") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [type, setType] = useState(params.get("type") || "");
  const [language, setLanguage] = useState(params.get("language") || "");
  const [budget, setBudget] = useState(Number(params.get("max") || 100000));
  const [eligible, setEligible] = useState(false);
  const [urgent, setUrgent] = useState(params.get("urgent") === "1");
  const [sort, setSort] = useState("newest");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(id);
  }, []);
  const all = mergeCampaigns(store.campaigns);
  const results = all
    .filter(
      (c) =>
        c.status === "Live" &&
        (!savedOnly || store.saved.includes(c.id)) &&
        (!search ||
          `${c.title} ${c.brand} ${c.niche}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!niche || c.niche === niche) &&
        (!platform ||
          campaignPlatforms(c).some((x) => platform.split(",").includes(x))) &&
        (!city || servesCity(c.city, city)) &&
        (!type || c.type === type) &&
        (!language || c.language === language) &&
        c.min <= budget &&
        (!eligible || c.followers <= creators[0].followers) &&
        (!urgent || c.urgent),
    )
    .sort((a, b) =>
      sort === "budget"
        ? b.max - a.max
        : sort === "deadline"
          ? a.deadline.localeCompare(b.deadline)
          : b.posted.localeCompare(a.posted),
    );
  useEffect(() => {
    if (savedOnly) return;
    const p = new URLSearchParams();
    for (const [key, value] of Object.entries({
      q: search,
      niche,
      platform,
      city,
      type,
      language,
      max: budget < 100000 ? String(budget) : "",
      urgent: urgent ? "1" : "",
    })) {
      if (value) p.set(key, value);
    }
    router.replace(`/campaigns${p.size ? "?" + p : ""}`, { scroll: false });
  }, [
    search,
    niche,
    platform,
    city,
    type,
    language,
    budget,
    urgent,
    router,
    savedOnly,
  ]);
  const reset = () => {
    setSearch("");
    setNiche("");
    setPlatform("");
    setCity("");
    setType("");
    setLanguage("");
    setBudget(100000);
    setEligible(false);
    setUrgent(false);
  };
  return (
    <div className={savedOnly ? "" : "container page-wrap"}>
      <div className="page-heading">
        <span className="eyebrow">
          {savedOnly
            ? "YOUR CREATIVE WISHLIST"
            : "OPPORTUNITIES, WITH YOUR NAME ON THEM"}
        </span>
        <h1>
          {savedOnly
            ? "Saved for your next chapter."
            : "Find your kind of collab."}
        </h1>
        <p>
          {savedOnly
            ? "The campaigns you want to come back to."
            : "Discover real briefs, clear budgets, and brands that get your vibe."}
        </p>
      </div>
      <div className="browse-search">
        <Search size={20} />
        <input
          aria-label="Search campaigns"
          placeholder="Search campaigns, brands, or niches…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="button secondary filter-mobile"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal size={17} />
          Filters
        </button>
      </div>
      <div className="browse-layout">
        <aside className={`filters ${open ? "filters-open" : ""}`}>
          <div className="filter-heading">
            <h3>
              <SlidersHorizontal size={17} />
              Filters
            </h3>
            <button className="text-button" onClick={reset}>
              Reset
            </button>
            <button
              className="icon-button filter-mobile"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
          </div>
          {[
            ["Niche", niche, setNiche, niches],
            ["Platform", platform, setPlatform, platforms],
            ["Collab type", type, setType, ["Paid", "Barter", "Affiliate"]],
            ["City", city, setCity, cities],
            ["Language", language, setLanguage, languages],
          ].map(([label, value, set, options]) => (
            <label key={label as string} className="field">
              <span>{label as string}</span>
              {label === "Platform" ? (
                <MultiSelect
                  label="Platform"
                  value={value as string}
                  onChange={set as (v: string) => void}
                  placeholder="All platforms"
                  options={options as string[]}
                />
              ) : (options as string[]).length > 6 ? (
                <SearchSelect
                  label={label as string}
                  value={value as string}
                  onChange={set as (v: string) => void}
                  placeholder={`All ${plural(String(label))}`}
                  options={options as string[]}
                />
              ) : (
                <select
                  value={value as string}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                >
                  <option value="">All {plural(String(label))}</option>
                  {(options as string[]).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              )}
            </label>
          ))}
          <label className="field">
            <span>
              Maximum starting budget <strong>{formatINR(budget)}</strong>
            </span>
            <input
              type="range"
              min={5000}
              max={100000}
              step={2500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={eligible}
              onChange={(e) => setEligible(e.target.checked)}
            />
            Only campaigns I qualify for
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            Hiring now
          </label>
          <button
            className="button filter-mobile"
            onClick={() => setOpen(false)}
          >
            Show {results.length} campaigns
          </button>
          <div className="filter-tip">
            <ShieldCheck size={22} />
            <strong>Do a little background check.</strong>
            <p>View a brand’s track record before your next collab.</p>
          </div>
        </aside>
        <section className="browse-results">
          <div className="results-heading">
            <span>
              <strong>{results.length}</strong> campaigns to explore
            </span>
            <label>
              Sort by{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="budget">Highest budget</option>
                <option value="deadline">Deadline</option>
              </select>
            </label>
          </div>
          <div className="active-filters">
            {[
              [niche, () => setNiche("")],
              [platform, () => setPlatform("")],
              [city, () => setCity("")],
              [type, () => setType("")],
              [language, () => setLanguage("")],
            ]
              .filter(([s]) => s)
              .map(([s, fn]) => (
                <button
                  key={s as string}
                  className="badge soft"
                  onClick={fn as () => void}
                >
                  {(s as string).replaceAll(",", ", ")}
                  <X size={12} />
                </button>
              ))}
          </div>
          {loading ? (
            <div className="campaign-grid two">
              {[1, 2, 3, 4].map((n) => (
                <div className="skeleton-card" key={n} />
              ))}
            </div>
          ) : results.length ? (
            <div className="campaign-grid two">
              {results.map((c) => (
                <CampaignCard campaign={c} key={c.id} />
              ))}
            </div>
          ) : (
            <Empty
              title={
                savedOnly
                  ? "Your saved collabs will live here."
                  : "Abhi koi match nahi mila."
              }
              text={
                savedOnly
                  ? "Tap the bookmark on a campaign to save it for later."
                  : "Try a different niche or loosen your filters."
              }
              href="/campaigns"
              label={savedOnly ? "Explore campaigns" : "Browse all campaigns"}
              action={savedOnly ? undefined : reset}
            />
          )}
        </section>
      </div>
    </div>
  );
}
export function CampaignDetail({ slug }: { slug: string }) {
  const store = useStore();
  const router = useRouter();
  const campaign = mergeCampaigns(store.campaigns).find((c) => c.slug === slug);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { pitch: "", quote: campaign?.min || 5000 },
  });
  if (!campaign)
    return (
      <Empty
        title="Campaign not found"
        text="This campaign may have moved."
        href="/campaigns"
        label="Explore campaigns"
      />
    );
  const c = campaign;
  const { p, name: brandName, verified: brandVerified } = campaignBrand(c);
  const applied = store.applications.some(
    (a) =>
      a.campaignId === c.id &&
      a.creatorId === "cr-1" &&
      a.status !== "Withdrawn",
  );
  const canApply = store.role === "Creator";
  const submit = (v: ApplicationForm) => {
    const ok = store.apply({
      id: crypto.randomUUID(),
      campaignId: c.id,
      creatorId: "cr-1",
      pitch: v.pitch,
      quote: v.quote,
      status: "Applied",
      date: new Date().toISOString(),
      showcase: selected,
    });
    if (ok) {
      setOpen(false);
      setSuccess(true);
      toast.success("Application sent. Your next collab is one step closer!");
      setTimeout(() => setSuccess(false), 2000);
    } else toast.error("You already applied to this campaign.");
  };
  return (
    <div className="container page-wrap">
      <Link className="back-link" href="/campaigns">
        <ChevronLeft size={16} />
        Back to campaigns
      </Link>
      <div className="detail-layout">
        <div>
          <div className="detail-cover">
            <Image
              src={c.image}
              alt={`${c.niche} campaign moodboard`}
              fill
              sizes="(max-width:768px) 100vw, 65vw"
            />
          </div>
          <div className="detail-main">
            <div className="chips">
              <span className="badge soft">{c.type} collaboration</span>
              {c.featured && <span className="badge lime">Featured</span>}
              <span>{c.niche}</span>
            </div>
            <h1>{c.title}</h1>
            <Link href={`/agency/${p.slug}`} className="poster-label">
              <BrandMark campaign={c} />
              {brandName}
              {brandVerified && <BadgeCheck size={17} className="brand-text" />}
            </Link>
            <div className="detail-metadata">
              <span>
                <MapPin size={17} />
                {c.city}
              </span>
              {campaignPlatforms(c).map((p) => (
                <span key={p}>
                  <PlatformIcon platform={p} size={17} />
                  {p}
                </span>
              ))}
              <span>
                <Users size={17} />
                {c.needed} creators
              </span>
              <span>
                <Calendar size={17} />
                Closes{" "}
                {new Date(c.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <h2>The creative brief</h2>
            <p>{c.brief}</p>
            <DosDonts dos={c.dos} donts={c.donts} />
            <h2>What you’ll create</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Deliverable</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {c.deliverables.map((d, i) => (
                  <tr key={`${d.type}-${i}`}>
                    <td>{d.type}</td>
                    <td>{d.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2>Your creative fit</h2>
            <div className="eligibility">
              {[
                [
                  `${formatCount(c.followers)}+ followers`,
                  creators[0].followers >= c.followers,
                ],
                ...(c.minEngagement
                  ? [
                      [
                        `${c.minEngagement}%+ engagement`,
                        creators[0].engagement >= c.minEngagement,
                      ],
                    ]
                  : []),
                [`${c.niche} content`, creators[0].niche === c.niche],
                [`${c.city} location`, servesCity(c.city, creators[0].city)],
                [
                  `${c.language} content`,
                  creators[0].languages.includes(c.language),
                ],
              ].map(([text, qualifies]) => (
                <div key={text as string}>
                  {store.role === "Creator" ? (
                    qualifies ? (
                      <Check size={17} className="success-text" />
                    ) : (
                      <X size={17} className="coral-text" />
                    )
                  ) : (
                    <Check size={17} />
                  )}
                  <span>{text as string}</span>
                  {store.role === "Creator" && (
                    <small>
                      {qualifies ? "You qualify" : "Check with brand"}
                    </small>
                  )}
                </div>
              ))}
            </div>
            <h2>Timeline & usage rights</h2>
            <p>
              The campaign closes to applications on{" "}
              {new Date(c.deadline).toLocaleDateString("en-IN")}. Platform
              default: content is due 7 days after product delivery or brief
              confirmation, and the brand reviews content within 3 business
              days, unless you both agree otherwise in chat.
            </p>
            {c.usageRights ? (
              <ul className="usage-review">
                <li>{ORGANIC_USAGE}</li>
                {c.usageRights.map((u) => (
                  <li key={u.kind}>{usageLine(u)}</li>
                ))}
                {usageNotes(c) && <li>{usageNotes(c)}</li>}
              </ul>
            ) : (
              <p>{c.usage}</p>
            )}
            <div className="info-box">
              <ShieldCheck size={21} />
              <span>
                Keep your deal on the platform. Contact details stay hidden
                until you’re hired.
              </span>
            </div>
          </div>
        </div>
        <aside className="detail-aside">
          <div className="panel budget-panel">
            <span className="eyebrow">YOUR CREATIVITY HAS VALUE</span>
            <h2>{campaignValue(c).amount}</h2>
            <p>
              {c.type === "Paid"
                ? "Budget per creator"
                : `${campaignValue(c).label} per creator`}
            </p>
            <button
              className="button full"
              disabled={applied || c.status !== "Live"}
              onClick={() => {
                if (canApply) setOpen(true);
                else if (store.role === "Guest")
                  router.push(`/login?next=/campaigns/${c.slug}`);
                else
                  toast.info(
                    "Switch to Creator using the demo role selector to apply.",
                  );
              }}
            >
              {applied ? (
                <>
                  <Check size={18} />
                  Applied
                </>
              ) : (
                <>
                  Apply to this campaign
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
            <button
              className="button secondary full"
              onClick={() => store.toggleSave(c.id)}
            >
              <Bookmark size={17} />
              {store.saved.includes(c.id)
                ? "Saved for later"
                : "Save for later"}
            </button>
            <small>{c.applicants} creators have applied</small>
          </div>
          <div className="panel poster-panel">
            <span className="eyebrow">MEET THE CAMPAIGN POSTER</span>
            <Link href={`/agency/${p.slug}`}>
              <h3>
                {p.name}{" "}
                {p.verified && <BadgeCheck size={17} className="brand-text" />}
              </h3>
            </Link>
            <span className="muted">
              {p.type} • {p.city}
            </span>
            <PosterStats poster={p} />
            <div className="pays-on-time">
              <ShieldCheck size={19} />
              <strong>{p.onTime}%</strong> pays on time
            </div>
            <small className="muted">Illustrative demo metric</small>
            <Link className="text-button" href={`/agency/${p.slug}`}>
              See their track record
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
      <section className="section">
        <SectionHeader title="More your kind of opportunities." />
        <div className="campaign-grid">
          {campaigns
            .filter((x) => x.id !== c.id)
            .slice(0, 3)
            .map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
        </div>
      </section>
      <div className="sticky-apply">
        <strong>{campaignValue(c).amount}</strong>
        <button
          className="button"
          disabled={applied}
          onClick={() => (canApply ? setOpen(true) : router.push("/login"))}
        >
          {applied ? "Applied" : "Apply now"}
        </button>
      </div>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Make your first impression count."
        description={`Your pitch for ${brandName}. Show them why you’re the right creative fit.`}
      >
        <form onSubmit={form.handleSubmit(submit)} className="form-stack">
          <label className="field">
            <span>Your creative pitch</span>
            <textarea
              rows={5}
              placeholder="Tell the brand your idea, how it fits your audience, and what makes your content different…"
              {...form.register("pitch")}
            />
            <small>{form.watch("pitch").length}/1000 characters</small>
            {form.formState.errors.pitch && (
              <span className="error">
                {form.formState.errors.pitch.message}
              </span>
            )}
          </label>
          <label className="field">
            <span>Your quote (₹)</span>
            <input
              type="number"
              {...form.register("quote", { valueAsNumber: true })}
            />
            {form.formState.errors.quote && (
              <span className="error">
                {form.formState.errors.quote.message}
              </span>
            )}
          </label>
          <label className="field">
            <span>Choose work to showcase</span>
            <div className="showcase-picker">
              {creators[0].content.slice(0, 3).map((item) => (
                <button
                  type="button"
                  className={selected.includes(item.id) ? "selected" : ""}
                  key={item.id}
                  onClick={() =>
                    setSelected((s) =>
                      s.includes(item.id)
                        ? s.filter((i) => i !== item.id)
                        : [...s, item.id],
                    )
                  }
                >
                  <Image
                    src={item.image}
                    width={120}
                    height={85}
                    alt={item.title}
                  />
                  {selected.includes(item.id) && <Check size={18} />}
                </button>
              ))}
            </div>
          </label>
          <button
            type="submit"
            className="button full"
            disabled={form.formState.isSubmitting}
          >
            <Send size={16} />
            Send application
          </button>
        </form>
      </Dialog>
      {success && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${i * 4}%`,
                background: i % 2 ? "#6C3BFF" : "#C8F560",
                animationDelay: `${(i % 5) * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
export function Discover() {
  const params = useSearchParams();
  const store = useStore();
  const [q, setQ] = useState("");
  const [niche, setNiche] = useState(params.get("niche") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [platform, setPlatform] = useState(params.get("platform") || "");
  const [language, setLanguage] = useState("");
  const [verified, setVerified] = useState(false);
  const [minFollowers, setMinFollowers] = useState(0);
  const [minER, setMinER] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [collab, setCollab] = useState("");
  const [grid, setGrid] = useState(true);
  const [compared, setCompared] = useState<string[]>([]);
  const [compare, setCompare] = useState(false);
  const [filters, setFilters] = useState(false);
  const results = creators.filter(
    (c) =>
      (!q || c.name.toLowerCase().includes(q.toLowerCase())) &&
      (!niche || c.niche === niche) &&
      (!city || c.city === city) &&
      (!platform || platform.split(",").includes(c.platform)) &&
      (!language || c.languages.includes(language)) &&
      (!verified || c.verified) &&
      c.followers >= minFollowers &&
      c.engagement >= minER &&
      c.price <= maxPrice &&
      (!collab || c.collabTypes.includes(collab)),
  );
  const reset = () => {
    setQ("");
    setNiche("");
    setCity("");
    setPlatform("");
    setLanguage("");
    setVerified(false);
    setMinFollowers(0);
    setMinER(0);
    setMaxPrice(100000);
    setCollab("");
  };
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR NEXT CREATIVE PARTNER</span>
        <h1>Find a voice that fits.</h1>
        <p>
          Authentic creators. Engaged communities. A whole lot of possibility.
        </p>
      </div>
      <div className="browse-search">
        <Search size={19} />
        <input
          aria-label="Search creators"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search creators by name…"
        />
        <button
          className="icon-button filter-mobile"
          aria-label="Show creator filters"
          onClick={() => setFilters(true)}
        >
          <SlidersHorizontal />
        </button>
      </div>
      <div className="browse-layout discover-layout">
        <aside className={`filters ${filters ? "filters-open" : ""}`}>
          <div className="filter-heading">
            <h3>Refine your search</h3>
            <button className="text-button" onClick={reset}>
              Reset
            </button>
            <button
              className="icon-button filter-mobile"
              aria-label="Close filters"
              onClick={() => setFilters(false)}
            >
              <X />
            </button>
          </div>
          {[
            ["Niche", niche, setNiche, niches],
            ["City", city, setCity, cities],
            ["Platform", platform, setPlatform, platforms],
            ["Language", language, setLanguage, languages],
            [
              "Collab type",
              collab,
              setCollab,
              ["Paid", "Barter", "Affiliate", "UGC", "Event", "Ambassador"],
            ],
          ].map(([label, value, set, options]) => (
            <label className="field" key={label as string}>
              <span>{label as string}</span>
              {label === "Platform" ? (
                <MultiSelect
                  label="Platform"
                  value={value as string}
                  onChange={set as (v: string) => void}
                  placeholder="All platforms"
                  options={options as string[]}
                />
              ) : (options as string[]).length > 6 ? (
                <SearchSelect
                  label={label as string}
                  value={value as string}
                  onChange={set as (v: string) => void}
                  placeholder="All"
                  options={options as string[]}
                />
              ) : (
                <select
                  value={value as string}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                >
                  <option value="">All</option>
                  {(options as string[]).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              )}
            </label>
          ))}
          <label className="field">
            <span>Min. followers: {formatCount(minFollowers)}</span>
            <input
              type="range"
              value={minFollowers}
              min={0}
              max={2000000}
              step={5000}
              onChange={(e) => setMinFollowers(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Min. engagement: {minER}%</span>
            <input
              type="range"
              value={minER}
              min={0}
              max={10}
              step={0.5}
              onChange={(e) => setMinER(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Max. rate: {formatINR(maxPrice)}</span>
            <input
              type="range"
              value={maxPrice}
              min={5000}
              max={100000}
              step={5000}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
            />
            Verified creators only
          </label>
          <button
            className="button filter-mobile"
            onClick={() => setFilters(false)}
          >
            Show creators
          </button>
        </aside>
        <div>
          <div className="results-heading">
            <strong>{results.length} creators match your vibe</strong>
            <div className="row">
              <button
                className={`icon-button ${grid ? "active" : ""}`}
                aria-label="Grid view"
                onClick={() => setGrid(true)}
              >
                <LayoutGrid size={19} />
              </button>
              <button
                className={`icon-button ${!grid ? "active" : ""}`}
                aria-label="List view"
                onClick={() => setGrid(false)}
              >
                <List size={19} />
              </button>
            </div>
          </div>
          {results.length ? (
            <div
              className={grid ? "creator-grid discover-grid" : "creator-list"}
            >
              {results.map((c) => (
                <div key={c.id}>
                  <CreatorCard creator={c} />
                  <label className="compare-check">
                    <input
                      type="checkbox"
                      checked={compared.includes(c.id)}
                      onChange={() => {
                        if (compared.includes(c.id))
                          setCompared((s) => s.filter((x) => x !== c.id));
                        else if (compared.length < 3)
                          setCompared((s) => [...s, c.id]);
                        else toast.info("Compare up to 3 creators at a time.");
                      }}
                    />
                    Compare creator
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No matching voices just yet."
              text="Try broadening your filters."
              label="Clear filters"
              action={reset}
            />
          )}
        </div>
      </div>
      {compared.length > 0 && (
        <div className="compare-bar">
          <span>{compared.length}/3 creators selected</span>
          <button className="button" onClick={() => setCompare(true)}>
            <GitCompare size={17} />
            Compare
          </button>
          <button
            className="icon-button"
            aria-label="Clear comparison"
            onClick={() => setCompared([])}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <Dialog
        open={compare}
        onOpenChange={setCompare}
        title="Your creative shortlist, side by side."
      >
        <div className="comparison">
          {compared.map((id) => {
            const c = creators.find((x) => x.id === id)!;
            return (
              <div key={id}>
                <Image src={c.avatar} width={90} height={90} alt={c.name} />
                <h3>{c.name}</h3>
                <p>
                  {c.niche} / {c.city}
                </p>
                <strong>{formatCount(c.followers)}</strong>
                <small>Followers</small>
                <strong>{c.engagement}%</strong>
                <small>Engagement</small>
                <strong>{formatINR(c.price)}</strong>
                <small>Starting rate</small>
                <button
                  className="button secondary"
                  onClick={() => store.toggleShortlist(id)}
                >
                  {store.shortlist.includes(id) ? "Shortlisted" : "Shortlist"}
                </button>
              </div>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
const plural = (label: string) => label.toLowerCase().replace(/y$/, "ie") + "s";
export function Empty({
  title,
  text,
  href,
  label,
  action,
}: {
  title: string;
  text: string;
  href?: string;
  label?: string;
  action?: () => void;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Search size={30} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      {label &&
        (action ? (
          <button className="button" onClick={action}>
            {label}
          </button>
        ) : (
          <Link className="button" href={href || "/"}>
            {label}
            <ArrowUpRight size={17} />
          </Link>
        ))}
    </div>
  );
}
export function PosterProfile({ slug }: { slug: string }) {
  const p = posters.find((p) => p.slug === slug);
  if (!p)
    return (
      <Empty
        title="Agency not found"
        text="Explore campaign partners instead."
        href="/campaigns"
        label="Browse campaigns"
      />
    );
  const own = campaigns.filter((c) => c.posterId === p.id);
  return (
    <div className="container page-wrap">
      <Link className="back-link" href="/campaigns">
        <ChevronLeft size={16} />
        Back to campaigns
      </Link>
      <div className="agency-profile-banner">
        <span className="monogram xlarge" style={{ background: p.color }}>
          {p.name[0]}
        </span>
        <div>
          <span className="badge soft">{p.type}</span>
          <h1>
            {p.name}{" "}
            {p.verified && <BadgeCheck size={30} className="brand-text" />}
          </h1>
          <span>
            <MapPin size={16} />
            {p.city} • Member since {p.since}
          </span>
        </div>
        {p.verified ? (
          <span className="badge lime">
            <ShieldCheck size={15} />
            Verified partner
          </span>
        ) : (
          <span className="badge">Verification pending</span>
        )}
      </div>
      <PosterStats poster={p} />
      <div className="agency-info-grid">
        <div className="panel">
          <h2>Good work starts with good people.</h2>
          <p>{p.about}</p>
          <div className="chips">
            {p.industries.map((i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
          <span className="muted">Website: {p.website} (sample company)</span>
        </div>
        <div className="panel trust-panel">
          <ShieldCheck size={32} />
          <h2>{p.onTime}% pays on time</h2>
          <p>A track record creators can feel good about.</p>
          <small>Illustrative demo metrics</small>
        </div>
      </div>
      <section className="section">
        <SectionHeader
          title="Open for your next collaboration."
          subtitle={`${own.length} active campaigns from ${p.name}`}
        />
        <div className="campaign-grid">
          {own.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>
      <div className="agency-info-grid">
        <div className="panel">
          <h2>Campaign activity</h2>
          <div className="activity-chart">
            {[18, 27, 22, 34, 28, 42].map((v, i) => (
              <div key={i}>
                <span style={{ height: v * 3 }} />
                <small>{["May", "Jun", "Jul", "Aug", "Sep", "Oct"][i]}</small>
              </div>
            ))}
          </div>
          <p className="muted">Sample campaigns posted over time</p>
        </div>
        <div className="panel">
          <h2>Creators say it best.</h2>
          <div className="review-rating">
            <strong>{p.rating.toFixed(1)}</strong>
            <span>
              <span className="stars">★★★★★</span>
              <br />
              {p.reviews} sample reviews
            </span>
          </div>
          {[5, 4, 3, 2, 1].map((n, i) => (
            <div className="rating-row" key={n}>
              <span>{n} stars</span>
              <div>
                <i style={{ width: `${[76, 17, 5, 2, 0][i]}%` }} />
              </div>
            </div>
          ))}
          <p>
            “Professional, friendly, and clear about expectations. Would love to
            work together again.”
          </p>
          <small>Meera Joshi / Sample creator review</small>
        </div>
      </div>
      <div className="row section">
        <Link href="/contact" className="text-button">
          Report this profile
        </Link>
      </div>
    </div>
  );
}
