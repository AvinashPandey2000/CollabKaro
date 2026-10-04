"use client";
import { mergeCampaigns } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  ArrowUpRight,
  Plus,
  Briefcase,
  Users,
  MessageCircle,
  Bookmark,
  TrendingUp,
  Check,
  GripVertical,
  Star,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { campaigns, creators, posters } from "@/lib/api";
import { useStore } from "@/lib/store";
import { formatINR, formatCount } from "@/lib/format";
import { CampaignCard, CreatorCard } from "./cards";
import { Empty } from "./marketplace";
import { SectionHeader } from "./home";
import { Dialog } from "./ui/dialog";
import type { Application, Status } from "@/types";
const EarningsChart = dynamic(
  () => import("./charts").then((m) => m.EarningsChart),
  { ssr: false, loading: () => <div className="chart skeleton" /> },
);
export function Dashboard({ brand = false }: { brand?: boolean }) {
  const s = useStore();
  const mine = s.applications.filter(
    (a) => a.creatorId === "cr-1" && a.status !== "Withdrawn",
  );
  const all = mergeCampaigns(s.campaigns);
  const own = all.filter((c) => c.posterId === "po-1");
  return (
    <>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">
            {brand ? "YOUR BRAND WORKSPACE" : "YOUR CREATOR CORNER"}
          </span>
          <h1>
            {brand
              ? "Big ideas start here."
              : `Hey ${s.profile.name?.split(" ")[0] || "Aanya"}, let’s collab.`}
          </h1>
          <p>
            {brand
              ? "A little clarity for your next great campaign."
              : "Your creativity has places to go. Let’s find the next one."}
          </p>
        </div>
        <Link
          className="button"
          href={brand ? "/a/campaigns/new" : "/campaigns"}
        >
          {brand ? <Plus size={17} /> : <Search size={17} />}{" "}
          {brand ? "Post a campaign" : "Find a collab"}
        </Link>
      </div>
      <div className="dashboard-stats">
        {(brand
          ? [
              [
                own.filter((c) => c.status === "Live").length,
                "Live campaigns",
                Briefcase,
              ],
              [
                s.applications.filter(
                  (a) =>
                    own.some((c) => c.id === a.campaignId) &&
                    a.status === "Applied",
                ).length,
                "New applicants",
                Users,
              ],
              [s.conversations.length, "Conversations", MessageCircle],
              [s.shortlist.length, "Shortlisted creators", Bookmark],
            ]
          : [
              [mine.length, "Applications sent", Briefcase],
              [
                mine.filter((a) => a.status === "Shortlisted").length,
                "Shortlisted",
                Star,
              ],
              [
                mine.filter((a) => a.status === "Hired").length,
                "Active collabs",
                Check,
              ],
              [s.saved.length, "Saved campaigns", Bookmark],
            ]
        ).map(([n, label, Icon]) => {
          const I = Icon as typeof Briefcase;
          return (
            <div className="panel" key={label as string}>
              <span>
                <I size={19} />
                {label as string}
              </span>
              <strong>{n as number}</strong>
              <small>
                {brand ? "Your brand activity" : "Your creative journey"}
              </small>
            </div>
          );
        })}
      </div>
      <div className="dashboard-middle">
        <div className="panel">
          <div className="section-header">
            <h3>{brand ? "Campaign momentum" : "Your earnings, growing."}</h3>
            <span className="badge soft">SAMPLE DATA</span>
          </div>
          <strong className="earnings-total">
            {brand ? "26 creators engaged" : "₹56,000"}
            <span>
              <TrendingUp size={15} />
              +33% this month
            </span>
          </strong>
          <EarningsChart />
        </div>
        <div className="panel profile-strength">
          <div className="strength-ring">
            <strong>{brand ? "3/5" : `${creators[0].strength}%`}</strong>
            <small>{brand ? "Campaigns used" : "Profile strength"}</small>
          </div>
          <h3>
            {brand
              ? `${s.plan} plan, room to grow.`
              : "A strong profile opens doors."}
          </h3>
          <p>
            {brand
              ? "You have two more campaign slots on your current sample plan."
              : "Add your best work and help brands see what makes you, you."}
          </p>
          <Link
            className="text-button"
            href={brand ? "/pricing" : "/c/profile"}
          >
            {brand ? "Explore plans" : "Complete your profile"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <section className="workspace-section">
        <SectionHeader
          title={
            brand
              ? "Your campaigns at a glance."
              : "A few collabs with your name on them."
          }
          href={brand ? "/a/campaigns" : "/campaigns"}
          link="View all"
        />
        <div className="campaign-grid">
          {(brand ? own : campaigns).slice(0, 3).map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>
      <div className="dashboard-middle">
        <div className="panel">
          <SectionHeader
            title={brand ? "Latest activity" : "Your application updates"}
            href={brand ? "/a/campaigns" : "/c/applications"}
            link="View all"
          />
          {s.applications.slice(0, 3).map((a) => {
            const c = all.find((c) => c.id === a.campaignId);
            return (
              <div className="activity-row" key={a.id}>
                <span className="activity-icon">
                  <Briefcase size={18} />
                </span>
                <div>
                  <strong>{c?.brand}</strong>
                  <small>{c?.title}</small>
                </div>
                <span className={`badge status-${a.status.toLowerCase()}`}>
                  {a.status}
                </span>
              </div>
            );
          })}
        </div>
        <div className="panel">
          <SectionHeader
            title="Good conversations."
            href="/messages"
            link="Open inbox"
          />
          {s.conversations.slice(0, 3).map((c) => {
            const p = posters.find((p) => p.id === c.posterId)!;
            return (
              <Link
                className="activity-row"
                key={c.id}
                href={`/messages?thread=${c.id}`}
              >
                <span className="monogram" style={{ background: p.color }}>
                  {p.name[0]}
                </span>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {c.messages.at(-1)?.body || "Start a conversation."}
                  </small>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
export function Applications() {
  const s = useStore();
  const [tab, setTab] = useState("All");
  const [withdraw, setWithdraw] = useState<string | null>(null);
  const all = mergeCampaigns(s.campaigns);
  const own = s.applications.filter((a) => a.creatorId === "cr-1");
  const list = own.filter((a) => tab === "All" || a.status === tab);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">EVERY PITCH IS A NEW POSSIBILITY</span>
        <h1>Your collab journey.</h1>
        <p>From your first hello to your next “you’re hired”.</p>
      </div>
      <div className="tabs">
        {[
          "All",
          "Applied",
          "Viewed",
          "Shortlisted",
          "Hired",
          "Rejected",
          "Withdrawn",
        ].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
            <span>
              {own.filter((a) => t === "All" || a.status === t).length}
            </span>
          </button>
        ))}
      </div>
      {list.length ? (
        list.map((a) => {
          const c = all.find((c) => c.id === a.campaignId)!;
          return (
            <div className="application-item panel" key={a.id}>
              <div className="row between">
                <div>
                  <span className="muted">{c.brand}</span>
                  <Link href={`/campaigns/${c.slug}`}>
                    <h3>{c.title}</h3>
                  </Link>
                  <span className="muted">
                    Applied {new Date(a.date).toLocaleDateString("en-IN")} /
                    Quote: {formatINR(a.quote)}
                  </span>
                </div>
                <span className={`badge status-${a.status.toLowerCase()}`}>
                  {a.status}
                </span>
              </div>
              <div className="status-timeline">
                {["Applied", "Viewed", "Shortlisted", "Hired"].map((t, i) => (
                  <div
                    className={
                      ["Applied", "Viewed", "Shortlisted", "Hired"].indexOf(
                        a.status,
                      ) >= i
                        ? "complete"
                        : ""
                    }
                    key={t}
                  >
                    <span>
                      <Check size={13} />
                    </span>
                    {t}
                  </div>
                ))}
              </div>
              <p className="application-pitch">{a.pitch}</p>
              <div className="row">
                {a.status === "Hired" && (
                  <Link className="button small" href={`/c/work/${c.id}`}>
                    Open workspace
                    <ArrowUpRight size={15} />
                  </Link>
                )}
                {["Shortlisted", "Hired"].includes(a.status) && (
                  <Link href="/messages" className="button secondary small">
                    Message brand
                  </Link>
                )}
                {!["Withdrawn", "Rejected", "Hired"].includes(a.status) && (
                  <button
                    className="text-button muted"
                    onClick={() => setWithdraw(a.id)}
                  >
                    Withdraw application
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <Empty
          title="Abhi tak koi application nahi."
          text="Your next collab starts with a good pitch."
          href="/campaigns"
          label="Find a campaign"
        />
      )}
      <Dialog
        open={withdraw !== null}
        onOpenChange={(o) => !o && setWithdraw(null)}
        title="Withdraw this application?"
        description="You can apply again later if the campaign is still open."
      >
        <div className="row modal-actions">
          <button
            className="button secondary"
            onClick={() => setWithdraw(null)}
          >
            Keep application
          </button>
          <button
            className="button"
            onClick={() => {
              s.setStatus(withdraw!, "Withdrawn");
              setWithdraw(null);
              toast.success("Application withdrawn.");
            }}
          >
            Withdraw
          </button>
        </div>
      </Dialog>
    </>
  );
}
export function MyCampaigns() {
  const s = useStore();
  const [filter, setFilter] = useState("All");
  const own = mergeCampaigns(s.campaigns).filter((c) => c.posterId === "po-1");
  return (
    <>
      <div className="workspace-heading">
        <div>
          <h1>Your campaigns.</h1>
          <p>Bring your briefs to life, one great collab at a time.</p>
        </div>
        <Link href="/a/campaigns/new" className="button">
          <Plus size={17} />
          Post a campaign
        </Link>
      </div>
      <div className="tabs">
        {["All", "Live", "Draft", "Paused", "Closed"].map((t) => (
          <button
            key={t}
            className={filter === t ? "selected" : ""}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="campaign-management">
        {own
          .filter((c) => filter === "All" || c.status === filter)
          .map((c) => (
            <div className="panel management-row" key={c.id}>
              <Image src={c.image} width={92} height={75} alt={c.niche} />
              <div>
                <Link href={`/campaigns/${c.slug}`}>
                  <h3>{c.title}</h3>
                </Link>
                <span className="muted">
                  {c.niche} / {formatINR(c.min)} - {formatINR(c.max)}
                </span>
              </div>
              <span className="badge soft">{c.status}</span>
              <Link
                className="text-button"
                href={`/a/campaigns/new?edit=${c.id}`}
              >
                Edit
              </Link>
              <Link
                className="button secondary small"
                href={`/a/campaigns/${c.id}/applicants`}
              >
                View applicants
                <Users size={15} />
              </Link>
              <select
                aria-label={`Status for ${c.title}`}
                value={c.status}
                onChange={(e) => {
                  if (!s.campaigns.some((x) => x.id === c.id))
                    s.post({ ...c, status: e.target.value as typeof c.status });
                  else
                    s.campaignStatus(c.id, e.target.value as typeof c.status);
                  toast.success("Campaign status updated.");
                }}
              >
                <option>Live</option>
                <option>Draft</option>
                <option>Paused</option>
                <option>Closed</option>
              </select>
            </div>
          ))}
      </div>
    </>
  );
}
const columns: Status[] = ["Applied", "Shortlisted", "Hired", "Rejected"];
function Applicant({
  a,
  onOpen,
  onSelect,
  selected,
}: {
  a: Application;
  onOpen: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: a.id,
  });
  const c = creators.find((c) => c.id === a.creatorId)!;
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
      className="applicant-card"
    >
      <div className="row between">
        <input
          aria-label={`Select ${c.name}`}
          type="checkbox"
          checked={selected}
          onChange={onSelect}
        />
        <button
          className="drag-handle icon-button"
          aria-label={`Move ${c.name}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical size={18} />
        </button>
      </div>
      <button className="applicant-person" onClick={onOpen}>
        <Image src={c.avatar} width={42} height={42} alt={c.name} />
        <span>
          <strong>{c.name}</strong>
          <small>
            {c.niche} • {c.city}
          </small>
        </span>
      </button>
      <div className="row applicant-metrics">
        <span>{formatCount(c.followers)} followers</span>
        <span>{c.engagement}% ER</span>
      </div>
      <p>{a.pitch}</p>
      <strong>{formatINR(a.quote)}</strong>
      <small>Quoted price</small>
    </div>
  );
}
function Column({
  status,
  children,
  count,
}: {
  status: Status;
  children: React.ReactNode;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "drag-over" : ""}`}
    >
      <h3>
        {status === "Applied" ? "New" : status}
        <span>{count}</span>
      </h3>
      {children}
    </section>
  );
}
export function Pipeline({ id }: { id: string }) {
  const s = useStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [selected, setSelected] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const c = mergeCampaigns(s.campaigns).find((c) => c.id === id);
  const applicants = s.applications.filter(
    (a) =>
      a.campaignId === id &&
      a.status !== "Withdrawn" &&
      (!search ||
        creators
          .find((c) => c.id === a.creatorId)
          ?.name.toLowerCase()
          .includes(search.toLowerCase())),
  );
  const a = s.applications.find((a) => a.id === drawer);
  const person = a ? creators.find((c) => c.id === a.creatorId) : null;
  const drop = (e: DragEndEvent) => {
    if (e.over && columns.includes(e.over.id as Status)) {
      s.setStatus(String(e.active.id), e.over.id as Status);
      toast.success(`Moved to ${e.over.id === "Applied" ? "New" : e.over.id}`);
    }
  };
  return (
    <>
      <Link href="/a/campaigns" className="back-link">
        ← All campaigns
      </Link>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">THE RIGHT PEOPLE FOR YOUR BRIEF</span>
          <h1>Meet your next collaborators.</h1>
          <p>{c?.title}</p>
        </div>
        <span className="badge soft">{applicants.length} applicants</span>
      </div>
      <div className="pipeline-toolbar">
        <div className="browse-search">
          <Search size={18} />
          <input
            aria-label="Filter applicants"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find an applicant…"
          />
        </div>
        <span className="muted">Drag cards or use the status menu.</span>
        {selected.length > 0 && (
          <select
            aria-label="Bulk applicant action"
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              selected.forEach((id) =>
                s.setStatus(id, e.target.value as Status),
              );
              setSelected([]);
              toast.success("Selected applications updated.");
            }}
          >
            <option value="">Move {selected.length} selected</option>
            {columns.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
      </div>
      <DndContext sensors={sensors} onDragEnd={drop}>
        <div className="kanban">
          {columns.map((status) => {
            const list = applicants.filter((a) =>
              status === "Applied"
                ? ["Applied", "Viewed"].includes(a.status)
                : a.status === status,
            );
            return (
              <Column key={status} status={status} count={list.length}>
                {list.map((a) => (
                  <div key={a.id}>
                    <Applicant
                      a={a}
                      selected={selected.includes(a.id)}
                      onSelect={() =>
                        setSelected((v) =>
                          v.includes(a.id)
                            ? v.filter((x) => x !== a.id)
                            : [...v, a.id],
                        )
                      }
                      onOpen={() => setDrawer(a.id)}
                    />
                    <select
                      className="applicant-status"
                      disabled={!ready}
                      aria-label={`Application status for ${creators.find((c) => c.id === a.creatorId)?.name}`}
                      value={a.status}
                      onChange={(e) =>
                        s.setStatus(a.id, e.target.value as Status)
                      }
                    >
                      {[
                        "Applied",
                        "Viewed",
                        "Shortlisted",
                        "Hired",
                        "Rejected",
                      ].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {!list.length && (
                  <div className="kanban-empty">
                    Your next creative match could land here.
                  </div>
                )}
              </Column>
            );
          })}
        </div>
      </DndContext>
      <Dialog
        open={drawer !== null}
        onOpenChange={(o) => !o && setDrawer(null)}
        title={person?.name || "Applicant profile"}
      >
        {person && a && (
          <>
            <div className="row">
              <Image
                src={person.avatar}
                width={72}
                height={72}
                alt={person.name}
                className="round"
              />
              <div>
                <p>
                  {person.niche} / {person.city}
                </p>
                <strong>
                  {formatCount(person.followers)} followers /{" "}
                  {person.engagement}% ER
                </strong>
              </div>
            </div>
            <h3>Their pitch</h3>
            <p>{a.pitch}</p>
            <h3>{formatINR(a.quote)} quoted</h3>
            <div className="row">
              <Link
                className="button secondary"
                href={`/creator/${person.username}`}
              >
                Full profile
                <ExternalLink size={16} />
              </Link>
              <button
                className="button"
                onClick={() =>
                  router.push(`/messages?thread=${s.startChat(person.id)}`)
                }
              >
                Message
                <ArrowUpRight size={16} />
              </button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
export function Shortlists() {
  const s = useStore();
  return (
    <>
      <div className="page-heading">
        <h1>Your creative shortlist.</h1>
        <p>Good people to come back to, for your next great idea.</p>
      </div>
      {s.shortlist.length ? (
        <div className="creator-grid">
          {creators
            .filter((c) => s.shortlist.includes(c.id))
            .map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
        </div>
      ) : (
        <Empty
          title="Your dream team starts here."
          text="Save creators while you browse, then find them here."
          href="/a/discover"
          label="Discover creators"
        />
      )}
    </>
  );
}
export function Work({ id }: { id?: string }) {
  const s = useStore();
  const [checks, setChecks] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const all = mergeCampaigns(s.campaigns);
  const active = s.applications.filter(
    (a) => a.creatorId === "cr-1" && a.status === "Hired",
  );
  const campaign = all.find((c) => c.id === id);
  if (!id)
    return (
      <>
        <div className="page-heading">
          <h1>Great work, in the making.</h1>
          <p>Your active collaborations, all in one place.</p>
        </div>
        {active.length ? (
          <div className="campaign-grid">
            {active.map((a) => {
              const c = all.find((c) => c.id === a.campaignId)!;
              return (
                <div key={a.id}>
                  <CampaignCard campaign={c} />
                  <Link className="button full" href={`/c/work/${c.id}`}>
                    Open workspace
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty
            title="Your next project is waiting."
            text="Once you're hired, your campaign workspace lives here."
            href="/campaigns"
            label="Find a campaign"
          />
        )}
      </>
    );
  if (!campaign)
    return (
      <Empty
        title="Workspace not found"
        text="Explore your active collaborations."
        href="/c/work"
        label="Active work"
      />
    );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">LET’S MAKE YOUR IDEAS REAL</span>
        <h1>{campaign.brand} × You</h1>
        <p>{campaign.title}</p>
      </div>
      <div className="dashboard-middle">
        <div className="panel">
          <h2>Your creative brief</h2>
          <p>{campaign.brief}</p>
          <h3>The deliverables</h3>
          {campaign.deliverables.map((d) => (
            <label className="check-field deliverable-check" key={d.type}>
              <input
                type="checkbox"
                checked={checks.includes(d.type)}
                onChange={() =>
                  setChecks((s) =>
                    s.includes(d.type)
                      ? s.filter((x) => x !== d.type)
                      : [...s, d.type],
                  )
                }
              />
              {d.quantity} × {d.type}
            </label>
          ))}
          <div className="info-box">
            Due 7 days after product delivery. {campaign.usage}
          </div>
        </div>
        <div className="panel">
          <h2>Ready for the world?</h2>
          <p>Submit a public post or preview link for brand review.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const parsed = new URL(url);
                if (!["https:", "http:"].includes(parsed.protocol))
                  throw new Error();
                setSubmitted(true);
                toast.success("Content submitted for review.");
                s.notify(
                  "Content submitted",
                  "Your creative work is ready for review.",
                  "/c/work/" + id,
                );
              } catch {
                toast.error("Enter a valid https:// content URL.");
              }
            }}
          >
            <label className="field">
              <span>Content link</span>
              <input
                type="url"
                required
                placeholder="https://instagram.com/reel/…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>
            <button className="button" type="submit">
              {submitted ? "Submit another link" : "Submit for review"}
              <ArrowUpRight size={17} />
            </button>
          </form>
          {submitted && (
            <div className="info-box">
              <Check size={18} />
              Submitted. Waiting for brand review.
            </div>
          )}
          <Link className="text-button" href="/messages">
            Discuss with brand
            <MessageCircle size={16} />
          </Link>
        </div>
      </div>
      {submitted && (
        <div className="panel workspace-section">
          <h2>How was your collab?</h2>
          <p>Sample review flow. Production reviews unlock after completion.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Demo review saved. Thanks for sharing!");
            }}
          >
            <label className="field">
              <span>Rating</span>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option value={n} key={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Your experience</span>
              <textarea
                required
                minLength={15}
                placeholder="Share what worked well…"
              />
            </label>
            <button className="button">Save demo review</button>
          </form>
        </div>
      )}
    </>
  );
}
