"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  Paperclip,
  Search,
  ShieldCheck,
  CheckCheck,
  ArrowLeft,
  Bell,
  Check,
  Plus,
  Trash2,
  Flag,
  Download,
  CalendarPlus,
} from "lucide-react";
import { useStore, seesNotice } from "@/lib/store";
import { creators, posters, campaigns } from "@/lib/api";
import { maskContact } from "@/lib/format";
import { backendEnabled } from "@/lib/backend";
import { Empty } from "./marketplace";
import { Dialog } from "./ui/dialog";
import {
  CallCard,
  CallDialog,
  VoiceNote,
  VoiceRecorder,
  callWhen,
} from "./chat-extras";
import type { CallInvite, Message } from "@/types";
export function Messages() {
  const params = useSearchParams();
  const s = useStore();
  const [picked, setActive] = useState(params.get("thread") || "");
  // Threads may arrive after first render (backend mode), so derive the default.
  const active = picked || s.conversations[0]?.id || "";
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [attachment, setAttachment] = useState("");
  const [report, setReport] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [recording, setRecording] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [reschedule, setReschedule] = useState<Message | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brand = s.role === "Brand-Agency";
  const thread = s.conversations.find((c) => c.id === active);
  const person = creators.find((c) => c.id === thread?.creatorId);
  const poster = posters.find((p) => p.id === thread?.posterId);
  const hired = s.applications.some(
    (a) =>
      a.campaignId === thread?.campaignId &&
      a.creatorId === thread?.creatorId &&
      a.status === "Hired",
  );
  const partner = brand ? person?.name : poster?.name;
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [active, thread?.messages.length, typing]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const now = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  // Posts a message from the viewer, then a simulated reply from the partner.
  const post = (
    message: Omit<Message, "id" | "sender" | "time">,
    reply = "Thanks for sharing! Let’s discuss the creative direction and the next steps.",
    onReply?: () => void,
  ) => {
    if (!thread || blocked) return;
    const threadId = active;
    s.send(threadId, {
      ...message,
      id: crypto.randomUUID(),
      sender: brand ? "brand" : "creator",
      time: now(),
    });
    // With a backend the real partner replies; only the demo simulates one.
    if (backendEnabled) return;
    setTyping(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onReply?.();
      s.send(threadId, {
        id: crypto.randomUUID(),
        body: reply,
        sender: brand ? "creator" : "brand",
        time: now(),
      });
      setTyping(false);
    }, 1500);
  };
  const send = () => {
    if ((!text.trim() && !attachment) || !thread || blocked) return;
    const body = maskContact(text.trim(), hired);
    post({
      body: body || "Shared an attachment",
      attachment: attachment || undefined,
    });
    if (body !== text.trim())
      toast.info("Contact details are hidden until hire.");
    setText("");
    setAttachment("");
  };
  const sendCall = (call: CallInvite, replacing?: Message) => {
    if (replacing?.call)
      s.updateMessage(active, replacing.id, {
        call: { ...replacing.call, status: "declined" },
      });
    const id = crypto.randomUUID();
    const threadId = active;
    // The simulated partner accepts, so the full flow can be tried in the demo.
    s.send(threadId, {
      id,
      body: `Call invite: ${call.topic}, ${callWhen(call)}`,
      sender: brand ? "brand" : "creator",
      time: now(),
      call,
    });
    toast.success("Call invite sent.");
    if (backendEnabled) return;
    setTyping(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      s.updateMessage(threadId, id, { call: { ...call, status: "accepted" } });
      s.send(threadId, {
        id: crypto.randomUUID(),
        body: "Works for me. See you then!",
        sender: brand ? "creator" : "brand",
        time: now(),
      });
      setTyping(false);
    }, 1500);
  };
  return (
    <>
      <div className="page-heading">
        <h1>Good things start with a conversation.</h1>
        <p>Your creative connections, all in one inbox.</p>
      </div>
      <div className={`inbox panel ${mobile ? "mobile-thread" : ""}`}>
        <aside className="inbox-list">
          <div className="inbox-search">
            <Search size={17} />
            <input
              aria-label="Search conversations"
              placeholder="Search conversations"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {s.conversations
            .filter((t) => {
              const name = brand
                ? creators.find((c) => c.id === t.creatorId)?.name
                : posters.find((p) => p.id === t.posterId)?.name;
              return name?.toLowerCase().includes(q.toLowerCase());
            })
            .map((t) => {
              const c = creators.find((c) => c.id === t.creatorId)!;
              const p = posters.find((p) => p.id === t.posterId)!;
              return (
                <button
                  className={`thread-item ${active === t.id ? "selected" : ""}`}
                  key={t.id}
                  onClick={() => {
                    setActive(t.id);
                    setMobile(true);
                    setBlocked(false);
                  }}
                >
                  {brand ? (
                    <Image src={c.avatar} width={43} height={43} alt={c.name} />
                  ) : (
                    <span className="monogram" style={{ background: p.color }}>
                      {p.name[0]}
                    </span>
                  )}
                  <div>
                    <strong>{brand ? c.name : p.name}</strong>
                    <span>{t.messages.at(-1)?.body || "Say hello."}</span>
                  </div>
                  <small>{t.messages.at(-1)?.time}</small>
                </button>
              );
            })}
        </aside>
        <section className="chat-thread">
          {thread ? (
            <>
              <div className="chat-heading">
                <button
                  className="icon-button filter-mobile"
                  aria-label="Back to inbox"
                  onClick={() => setMobile(false)}
                >
                  <ArrowLeft size={18} />
                </button>
                {brand ? (
                  <Image
                    className="round"
                    src={person!.avatar}
                    width={40}
                    height={40}
                    alt={partner!}
                  />
                ) : (
                  <span
                    className="monogram"
                    style={{ background: poster?.color }}
                  >
                    {poster?.name[0]}
                  </span>
                )}
                <div>
                  <Link
                    href={
                      brand
                        ? `/creator/${person?.username}`
                        : `/agency/${poster?.slug}`
                    }
                  >
                    <strong>{partner}</strong>
                  </Link>
                  <small>
                    {hired ? "Hired collaboration" : "Campaign conversation"}
                  </small>
                </div>
                <div className="chat-heading-actions">
                  <button
                    className="icon-button"
                    aria-label="Schedule a call"
                    title="Schedule a call"
                    disabled={blocked}
                    onClick={() => setCallOpen(true)}
                  >
                    <CalendarPlus size={18} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Report or block conversation"
                    onClick={() => setReport(true)}
                  >
                    <Flag size={18} />
                  </button>
                </div>
              </div>
              <div className="chat-safety">
                <ShieldCheck size={15} />
                {hired
                  ? "You’re hired. Contact details can now be shared."
                  : "Contact details stay private until you’re hired."}
              </div>
              <div className="chat-messages">
                <span className="chat-day">Today / Demo conversation</span>
                {thread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`message ${m.sender === (brand ? "brand" : "creator") ? "mine" : ""}`}
                  >
                    {m.call ? (
                      <CallCard
                        call={m.call}
                        mine={m.sender === (brand ? "brand" : "creator")}
                        partner={partner || "your collaborator"}
                        onStatus={(status) => {
                          s.updateMessage(active, m.id, {
                            call: { ...m.call!, status },
                          });
                          toast.success(
                            {
                              accepted: "Call confirmed.",
                              declined: "Invite declined.",
                              cancelled: "Call cancelled.",
                              proposed: "",
                            }[status],
                          );
                        }}
                        onReschedule={() => setReschedule(m)}
                      />
                    ) : m.voice ? (
                      <VoiceNote url={m.voice.url} seconds={m.voice.seconds} />
                    ) : (
                      <p>{maskContact(m.body, hired)}</p>
                    )}
                    {m.attachment && (
                      <span className="message-attachment">
                        <Paperclip size={16} />
                        {m.attachment} (demo)
                      </span>
                    )}
                    <span>
                      {m.time}
                      {m.sender === (brand ? "brand" : "creator") && (
                        <CheckCheck size={14} />
                      )}
                    </span>
                  </div>
                ))}
                {typing && (
                  <div className="typing-indicator">
                    {partner} is typing<span>•••</span>
                  </div>
                )}
                <div ref={end} />
              </div>
              {brand && (
                <div className="quick-replies">
                  {[
                    "Love your content!",
                    "Can you share your creative idea?",
                    "Let’s confirm the deliverables.",
                  ].map((t) => (
                    <button key={t} onClick={() => setText(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
              {attachment && (
                <span className="attachment-preview">
                  {attachment}
                  <button onClick={() => setAttachment("")}>Remove</button>
                </span>
              )}
              <form
                className="chat-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                {!recording && (
                  <>
                    <label className="icon-button" aria-label="Attach a file">
                      <Paperclip size={21} />
                      <input
                        className="visually-hidden"
                        type="file"
                        onChange={(e) =>
                          setAttachment(e.target.files?.[0]?.name || "")
                        }
                      />
                    </label>
                    <input
                      aria-label="Message"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={blocked}
                      placeholder={
                        blocked
                          ? "Conversation blocked in this session"
                          : "Your next great idea starts here…"
                      }
                    />
                  </>
                )}
                <VoiceRecorder
                  disabled={blocked}
                  onRecordingChange={setRecording}
                  onSend={(voice) =>
                    post(
                      {
                        body: `Voice note (${Math.floor(voice.seconds / 60)}:${String(voice.seconds % 60).padStart(2, "0")})`,
                        voice,
                      },
                      "Thanks for the voice note! Let me get back to you on that.",
                    )
                  }
                />
                {!recording && (
                  <button
                    className="button icon-button"
                    aria-label="Send message"
                    disabled={blocked || (!text.trim() && !attachment)}
                  >
                    <Send size={19} />
                  </button>
                )}
              </form>
            </>
          ) : (
            <Empty
              title="Say your first hello."
              text="Start a conversation from a creator profile."
              href="/a/discover"
              label="Discover creators"
            />
          )}
        </section>
      </div>
      {callOpen && (
        <CallDialog
          open
          onOpenChange={setCallOpen}
          partner={partner || "your collaborator"}
          phoneAllowed={hired}
          onSchedule={(call) => sendCall(call)}
        />
      )}
      {reschedule?.call && (
        <CallDialog
          open
          onOpenChange={(o) => !o && setReschedule(null)}
          partner={partner || "your collaborator"}
          phoneAllowed={hired}
          initial={reschedule.call}
          onSchedule={(call) => sendCall(call, reschedule)}
        />
      )}
      <Dialog
        open={report}
        onOpenChange={setReport}
        title="Keep your collabs comfortable."
      >
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            setReport(false);
            toast.success(
              "Report saved in demo mode. No moderation team was contacted.",
            );
          }}
        >
          <label className="field">
            <span>Reason for reporting</span>
            <select required>
              <option>Spam or unsolicited content</option>
              <option>Inappropriate messages</option>
              <option>Suspicious payment request</option>
              <option>Other</option>
            </select>
          </label>
          <label className="field">
            <span>Additional details</span>
            <textarea required minLength={10} />
          </label>
          <button className="button">Save demo report</button>
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              setBlocked(true);
              setReport(false);
              toast.success("Conversation blocked for this session.");
            }}
          >
            Block conversation
          </button>
        </form>
      </Dialog>
    </>
  );
}
export function Notifications() {
  const s = useStore();
  return (
    <>
      <div className="workspace-heading">
        <div>
          <h1>Your world of collabs, updated.</h1>
          <p>New possibilities, good conversations, and a little progress.</p>
        </div>
        <button className="button secondary" onClick={() => s.markRead()}>
          <Check size={16} />
          Mark all as read
        </button>
      </div>
      {s.notifications.filter((n) => seesNotice(n, s.role)).length === 0 && (
        <Empty
          title="Nothing new yet."
          text="Updates about your collabs will show up here."
        />
      )}
      {s.notifications
        .filter((n) => seesNotice(n, s.role))
        .map((n) => (
          <Link
            className={`panel notice ${!n.read ? "unread" : ""}`}
            href={n.href}
            key={n.id}
          >
            <span className="notice-icon">
              <Bell size={20} />
            </span>
            <div>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </div>
            {!n.read && <span className="badge soft">New</span>}
          </Link>
        ))}
    </>
  );
}
export function Settings({ brand = false }: { brand?: boolean }) {
  const s = useStore();
  const [team, setTeam] = useState([
    { name: "Ritika Sethi", email: "ritika@example.com", role: "Owner" },
    { name: "Dev Mehta", email: "dev@example.com", role: "Manager" },
  ]);
  const [email, setEmail] = useState("");
  const [display, setDisplay] = useState(s.profile.name || "Aanya Sharma");
  const [company, setCompany] = useState(s.profile.company || "Kurta Kraft");
  return (
    <>
      <div className="page-heading">
        <h1>
          {brand ? "Your team. Your workspace." : "Make yourself at home."}
        </h1>
        <p>A few preferences for better collabs.</p>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <h2>{brand ? "Company details" : "Your account"}</h2>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              s.updateProfile({ name: display, company });
              toast.success("Demo preferences saved.");
            }}
          >
            <label className="field">
              <span>Name</span>
              <input
                required
                minLength={2}
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
              />
            </label>
            {brand && (
              <label className="field">
                <span>Company name</span>
                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </label>
            )}
            <label className="check-field">
              <input type="checkbox" defaultChecked />
              In-app campaign updates
            </label>
            <label className="check-field">
              <input type="checkbox" />
              Email notifications (future integration)
            </label>
            <button className="button">Save preferences</button>
          </form>
        </section>
        <section className="panel">
          <span className="eyebrow">YOUR DEMO PLAN</span>
          <h2>{s.plan}</h2>
          <p>Room for your next big idea. Explore plans that grow with you.</p>
          <Link className="button secondary" href="/pricing">
            Compare plans
          </Link>
          <h3 className="spaced">Sample billing history</h3>
          <div className="billing-row">
            <span>October 2026 / Growth</span>
            <strong>₹1,499</strong>
          </div>
          <button
            className="text-button"
            onClick={() => {
              const blob = new Blob(
                [
                  "CollabKaro DEMO invoice\nNot a tax invoice.\nGrowth plan: INR 1499\nNo payment processed.",
                ],
                { type: "text/plain" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "collabkaro-demo-invoice.txt";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={16} />
            Download sample invoice
          </button>
        </section>
        {brand && (
          <section className="panel team-panel">
            <h2>Better together.</h2>
            <p>Team management preview. Invitations do not send emails.</p>
            {team.map((t) => (
              <div className="team-row" key={t.email}>
                <span className="monogram">{t.name[0]}</span>
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.email}</small>
                </div>
                <span className="badge soft">{t.role}</span>
                {t.role !== "Owner" && (
                  <button
                    className="icon-button"
                    aria-label={`Remove ${t.name}`}
                    onClick={() =>
                      setTeam((s) => s.filter((x) => x.email !== t.email))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                if (team.some((t) => t.email === email)) {
                  toast.error("This person is already in your sample team.");
                  return;
                }
                setTeam((s) => [
                  ...s,
                  { name: email.split("@")[0], email, role: "Viewer" },
                ]);
                setEmail("");
                toast.success(
                  "Added to sample team. No invitation email sent.",
                );
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                aria-label="Teammate email"
              />
              <button className="button">
                <Plus size={17} />
                Add teammate
              </button>
            </form>
          </section>
        )}
      </div>
    </>
  );
}
export function Admin() {
  const [approved, setApproved] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [reports, setReports] = useState([
    "Suspicious contact request",
    "Misleading campaign budget",
  ]);
  const s = useStore();
  if (s.role !== "Admin")
    return (
      <Empty
        title="The admin demo has its own workspace."
        text="Select Admin in the demo role switcher to review verification and moderation."
        label="Open admin demo"
        action={() => s.setRole("Admin")}
      />
    );
  return (
    <>
      <div className="page-heading">
        <h1>A trustworthy community starts here.</h1>
        <p>Local admin preview for verification and moderation.</p>
      </div>
      <div className="dashboard-stats">
        {[
          ["Creators", 36],
          ["Campaigns", 40],
          ["Verification requests", 3],
          ["Open reports", reports.length],
        ].map(([label, n]) => (
          <div className="panel" key={label}>
            <span>{label}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      <div className="settings-grid">
        <div className="panel">
          <h2>Verification queue</h2>
          {posters
            .filter((p) => !p.verified)
            .map((p) => (
              <div className="team-row" key={p.id}>
                <span className="monogram" style={{ background: p.color }}>
                  {p.name[0]}
                </span>
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.type}</small>
                </div>
                <button
                  className="button secondary small"
                  disabled={approved.includes(p.id)}
                  onClick={() => {
                    setApproved((s) => [...s, p.id]);
                    toast.success("Verified in this admin preview.");
                  }}
                >
                  {approved.includes(p.id) ? "Approved" : "Approve"}
                </button>
              </div>
            ))}
        </div>
        <div className="panel">
          <h2>Reports queue</h2>
          {reports.map((r) => (
            <div className="team-row" key={r}>
              <Flag size={20} />
              <span>{r}</span>
              <button
                className="text-button"
                onClick={() => setReports((s) => s.filter((x) => x !== r))}
              >
                Resolve
              </button>
            </div>
          ))}
          {!reports.length && <p>All caught up. No open sample reports.</p>}
        </div>
        <div className="panel team-panel">
          <h2>Campaign moderation</h2>
          {campaigns.slice(0, 5).map((c) => (
            <div className="team-row" key={c.id}>
              <div>
                <strong>{c.title}</strong>
                <small>{c.brand}</small>
              </div>
              <button
                className="button secondary small"
                onClick={() =>
                  setHidden((s) =>
                    s.includes(c.id)
                      ? s.filter((x) => x !== c.id)
                      : [...s, c.id],
                  )
                }
              >
                {hidden.includes(c.id)
                  ? "Restore in preview"
                  : "Hide in preview"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
