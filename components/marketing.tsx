"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Check,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Search,
  Download,
  Copy,
  Mail,
  MapPin,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { creators, campaigns } from "@/lib/api";
import { CampaignCard, CreatorCard } from "./cards";
import { SectionHeader } from "./home";
export function SideLanding({ brand = false }: { brand?: boolean }) {
  return (
    <div className="container page-wrap">
      <div className="side-hero">
        <span className="eyebrow">
          {brand
            ? "A GREAT BRAND DESERVES GREAT VOICES"
            : "YOUR CREATIVITY HAS PLACES TO GO"}
        </span>
        <h1>
          {brand ? (
            <>
              Your story.
              <br />
              The right people to tell it.
            </>
          ) : (
            <>
              Create what you love.
              <br />
              <span className="brand-text">Collab on your terms.</span>
            </>
          )}
        </h1>
        <p>
          {brand
            ? "Discover creators who connect with your community. From your first brief to your next big campaign, make great work happen together."
            : "From your first barter deal to your next big brand partnership. Find clear briefs, fair budgets, and brands that believe in your voice."}
        </p>
        <div className="row">
          <Link
            className="button"
            href={brand ? "/a/campaigns/new" : "/signup"}
          >
            {brand ? "Post a campaign" : "Join as a creator"}
            <ArrowUpRight size={17} />
          </Link>
          <Link
            className="button secondary"
            href={brand ? "/a/discover" : "/campaigns"}
          >
            {brand ? "Meet the creators" : "Explore campaigns"}
          </Link>
        </div>
      </div>
      <div className="benefit-grid">
        {(brand
          ? [
              [
                Search,
                "Find your creative match",
                "Filter by niche, engagement, city, and language. The right creator makes all the difference.",
              ],
              [
                MessageCircle,
                "Make the connection",
                "Invite creators, discuss ideas, and build a shared vision in one conversation.",
              ],
              [
                ShieldCheck,
                "Keep every collab clear",
                "Review proposals, manage your pipeline, and track deliverables in your workspace.",
              ],
            ]
          : [
              [
                Search,
                "Find a brief that feels like you",
                "Browse paid, barter, and affiliate campaigns with budgets upfront.",
              ],
              [
                ShieldCheck,
                "Know who you’re working with",
                "Explore verified agency profiles, reviews, and payment track records.",
              ],
              [
                MessageCircle,
                "Let your ideas do the talking",
                "Pitch your concept, chat with the brand, and create something worth sharing.",
              ],
            ]
        ).map(([Icon, title, text]) => {
          const I = Icon as typeof Search;
          return (
            <div key={title as string}>
              <I size={26} />
              <h2>{title as string}</h2>
              <p>{text as string}</p>
            </div>
          );
        })}
      </div>
      <section className="section">
        <SectionHeader
          title={
            brand
              ? "Meet your next creative partners."
              : "Your next collab is waiting."
          }
        />
        {brand ? (
          <div className="creator-grid">
            {creators.slice(0, 4).map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        ) : (
          <div className="campaign-grid">
            {campaigns.slice(0, 3).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </section>
      <div className="simple-cta">
        <h2>
          {brand
            ? "A plan for every kind of ambition."
            : "Start for free. Grow from there."}
        </h2>
        <p>
          {brand
            ? "Explore Free, Growth, and Pro plans in INR."
            : "Creating a profile and applying to campaigns is free. Creator Pro is there when you want a little extra."}
        </p>
        <Link className="button" href="/pricing">
          Find your plan
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
  );
}
export function Pricing() {
  const [yearly, setYearly] = useState(false);
  const s = useStore();
  const router = useRouter();
  const plans = [
    {
      name: "Free",
      price: 0,
      text: "For your first hello.",
      features: [
        "2 live campaigns",
        "Browse creator profiles",
        "10 new conversations / month",
        "Basic applicant pipeline",
      ],
    },
    {
      name: "Growth",
      price: 1499,
      text: "For your next big idea.",
      features: [
        "10 live campaigns",
        "Advanced creator filters",
        "100 conversations / month",
        "Shortlists & creator comparison",
        "Campaign insights",
      ],
    },
    {
      name: "Pro",
      price: 4999,
      text: "For making things happen at scale.",
      features: [
        "Unlimited campaigns",
        "Unlimited conversations",
        "Team workspace preview",
        "Priority support",
        "Advanced reporting",
      ],
    },
  ];
  return (
    <div className="container page-wrap">
      <div className="pricing-heading">
        <span className="eyebrow">GOOD COLLABS. ROOM TO GROW.</span>
        <h1>
          Your ambition.
          <br />A plan that fits.
        </h1>
        <p>
          Simple plans for brands and agencies. Creators always have a free way
          in.
        </p>
        <div className="segmented">
          <button
            className={!yearly ? "selected" : ""}
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>
          <button
            className={yearly ? "selected" : ""}
            onClick={() => setYearly(true)}
          >
            Yearly <span className="badge lime">SAVE 20%</span>
          </button>
        </div>
      </div>
      <div className="pricing-grid">
        {plans.map((p) => (
          <div
            className={`pricing-card ${p.name === "Growth" ? "featured-plan" : ""}`}
            key={p.name}
          >
            {p.name === "Growth" && (
              <span className="plan-label">A LITTLE MORE POSSIBILITY</span>
            )}
            <h2>{p.name}</h2>
            <p>{p.text}</p>
            <div className="plan-price">
              {formatINR(yearly ? Math.round(p.price * 0.8) : p.price)}
              <small>/ month</small>
            </div>
            {yearly && p.price > 0 && (
              <small className="muted">
                {formatINR(Math.round(p.price * 0.8) * 12)} billed annually
              </small>
            )}
            <button
              className={`button full ${p.name === "Growth" ? "" : "secondary"}`}
              onClick={() => {
                s.setPlan(p.name);
                toast.success(
                  `${p.name} selected for this demo. No payment taken.`,
                );
                s.setRole("Brand-Agency");
                router.push("/a/dashboard");
              }}
            >
              Choose {p.name}
              <ArrowUpRight size={16} />
            </button>
            <ul>
              {p.features.map((f) => (
                <li key={f}>
                  <Check size={16} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="creator-pro panel">
        <Sparkles size={32} />
        <div>
          <span className="eyebrow">
            A LITTLE EXTRA FOR YOUR CREATIVE JOURNEY
          </span>
          <h2>Creator Pro</h2>
          <p>Profile insights, portfolio tools, and added visibility.</p>
        </div>
        <strong>
          {formatINR(yearly ? 239 : 299)}
          <small>/ month</small>
        </strong>
        <button
          className="button secondary"
          onClick={() => {
            s.setPlan("Creator Pro");
            s.setRole("Creator");
            toast.success("Creator Pro activated for the local demo.");
            router.push("/c/dashboard");
          }}
        >
          Explore Creator Pro
          <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="pricing-note">
        <ShieldCheck size={19} />
        All prices are illustrative. No checkout or payment processing in this
        demo.
      </div>
      <section className="section">
        <h2>A clear comparison.</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>What’s included</th>
                {plans.map((p) => (
                  <th key={p.name}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Live campaigns", "2", "10", "Unlimited"],
                ["New conversations / month", "10", "100", "Unlimited"],
                ["Advanced filters", "—", "Included", "Included"],
                ["Creator comparison", "—", "Included", "Included"],
                ["Priority support", "—", "—", "Included"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell === "—" ? "Not included" : cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
const contactSchema = z.object({
  name: z.string().min(2, "Tell us your name."),
  email: z.email("Use a valid email."),
  topic: z.string(),
  message: z.string().min(20, "Please share at least 20 characters of detail."),
});
type ContactValues = z.infer<typeof contactSchema>;
export function Contact() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: "General question",
      message: "",
    },
  });
  const [sent, setSent] = useState(false);
  return (
    <div className="container page-wrap contact-layout">
      <div>
        <span className="eyebrow">A GOOD CONVERSATION STARTS HERE</span>
        <h1>
          Let’s talk
          <br />
          <span className="brand-text">collabs.</span>
        </h1>
        <p>
          Questions, ideas, or a little feedback.
          <br />
          We’re here for it.
        </p>
        <div className="contact-detail">
          <Mail size={22} />
          <span>
            hello@collabkaro.example
            <br />
            <small>Sample contact address</small>
          </span>
        </div>
        <div className="contact-detail">
          <MapPin size={22} />
          Made for India’s creative community.
        </div>
      </div>
      <form
        className="panel form-stack"
        onSubmit={form.handleSubmit(() => {
          setSent(true);
          toast.success("Your demo message is saved. No email was sent.");
        })}
      >
        <h2>{sent ? "Thanks for saying hello." : "What’s on your mind?"}</h2>
        {[
          ["name", "Your name"],
          ["email", "Email address"],
        ].map(([key, label]) => (
          <label className="field" key={key}>
            <span>{label}</span>
            <input
              type={key === "email" ? "email" : "text"}
              {...form.register(key as "name" | "email")}
            />
            {form.formState.errors[key as "name" | "email"] && (
              <small className="error">
                {form.formState.errors[key as "name" | "email"]?.message}
              </small>
            )}
          </label>
        ))}
        <label className="field">
          <span>What’s this about?</span>
          <select {...form.register("topic")}>
            <option>General question</option>
            <option>Campaign help</option>
            <option>Account verification</option>
            <option>Report an issue</option>
          </select>
        </label>
        <label className="field">
          <span>Your message</span>
          <textarea rows={5} {...form.register("message")} />
          {form.formState.errors.message && (
            <small className="error">
              {form.formState.errors.message.message}
            </small>
          )}
        </label>
        <button className="button">
          Save demo message
          <ArrowUpRight size={17} />
        </button>
        <small className="muted">
          This form runs locally. Messages are not delivered to a real inbox.
        </small>
      </form>
    </div>
  );
}
export function Tools({ kind }: { kind: string }) {
  const [followers, setFollowers] = useState(10000);
  const [likes, setLikes] = useState(650);
  const [comments, setComments] = useState(45);
  const [saves, setSaves] = useState(80);
  const [er, setEr] = useState(5);
  const [title, setTitle] = useState("Our festive collection");
  const [brief, setBrief] = useState(
    "Authentic stories that bring our collection into your everyday life.",
  );
  const [budget, setBudget] = useState(15000);
  const template = `CAMPAIGN BRIEF\n\nCampaign: ${title}\nCreative direction: ${brief}\nBudget per creator: ${formatINR(budget)}\nDeliverables: 1 reel + 3 stories\nTimeline: 7 days after product delivery\nUsage: 30 days organic usage only\nApproval: Brand feedback within 3 business days\nPayment: Confirm payment terms before starting\n`;
  const rate = Math.max(
    1500,
    Math.round((followers * 0.12 * (er / 5)) / 500) * 500,
  );
  const engagement =
    followers > 0
      ? (((likes + comments + saves) / followers) * 100).toFixed(2)
      : "0";
  const field = (label: string, value: number, set: (n: number) => void) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => set(Math.max(0, Number(e.target.value)))}
      />
    </label>
  );
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([template], { type: "text/plain" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "collabkaro-campaign-brief.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="container page-wrap tools-wrap">
      <span className="eyebrow">A LITTLE HELP, ON THE HOUSE</span>
      <h1>
        {kind === "engagement"
          ? "Know your community’s connection."
          : kind === "rate-estimator"
            ? "Put a little value on your creativity."
            : "A good brief makes great work."}
      </h1>
      <p className="muted">
        {kind === "engagement"
          ? "Calculate engagement from your average post interactions."
          : kind === "rate-estimator"
            ? "An illustrative starting point, not a guaranteed market rate."
            : "Start with clear expectations. Make the template yours."}
      </p>
      <div className="dashboard-middle">
        <div className="panel form-stack">
          {kind === "engagement" ? (
            <>
              {field("Followers", followers, setFollowers)}
              {field("Average likes", likes, setLikes)}
              {field("Average comments", comments, setComments)}
              {field("Average saves", saves, setSaves)}
            </>
          ) : kind === "rate-estimator" ? (
            <>
              {field("Followers", followers, setFollowers)}
              {field("Engagement rate (%)", er, setEr)}
              <div className="info-box">
                Rates also depend on production effort, content usage, audience
                quality, and exclusivity.
              </div>
            </>
          ) : (
            <>
              <label className="field">
                <span>Campaign title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Creative direction</span>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
              </label>
              {field("Budget per creator (₹)", budget, setBudget)}
              <button className="button" onClick={download}>
                <Download size={17} />
                Download brief
              </button>
            </>
          )}
        </div>
        <div className="panel tool-result">
          {kind === "engagement" ? (
            <>
              <Sparkles size={30} />
              <span>Your engagement rate</span>
              <strong>{engagement}%</strong>
              <p>(Likes + comments + saves) ÷ followers × 100</p>
              <Link className="text-button" href="/c/profile">
                Add it to your profile
                <ArrowUpRight size={16} />
              </Link>
            </>
          ) : kind === "rate-estimator" ? (
            <>
              <strong>
                {formatINR(rate)} - {formatINR(Math.round(rate * 1.7))}
              </strong>
              <span>Illustrative reel rate</span>
              <p>
                Use this as a conversation starter. Your creative work and usage
                rights deserve their own discussion.
              </p>
            </>
          ) : (
            <>
              <h3>Your brief preview</h3>
              <pre>{template}</pre>
              <button
                className="text-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(template);
                    toast.success("Brief copied.");
                  } catch {
                    toast.info("Use Download brief to save a copy.");
                  }
                }}
              >
                <Copy size={17} />
                Copy brief
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export function StaticPage({ kind }: { kind: string }) {
  if (kind === "about")
    return (
      <div className="container page-wrap prose-page">
        <span className="eyebrow">A SHARED SPACE FOR BIG POSSIBILITIES</span>
        <h1>
          For the people
          <br />
          behind the content.
        </h1>
        <p className="lead">
          CollabKaro brings India’s creators, agencies, and brands together,
          with a little more transparency and a lot more creative possibility.
        </p>
        <h2>Good creativity deserves a clear opportunity.</h2>
        <p>
          Creators deserve to know who’s hiring, what the brief needs, and what
          the budget looks like. Brands deserve a better way to find people who
          connect with their audience.
        </p>
        <p>
          We’re building a place where both sides can meet, talk, and create.
          From regional voices and nano creators to agencies running their next
          big campaign, everyone has a place here.
        </p>
        <h2>Trust comes before the collab.</h2>
        <p>
          Agency track records, creator portfolios, clear campaign briefs, and
          safer conversations help people make informed decisions.
        </p>
        <div className="info-box">
          This is the frontend prototype. Profiles, testimonials, campaigns, and
          performance metrics are fictional sample data.
        </div>
        <Link className="button" href="/signup">
          Find your people
          <ArrowUpRight size={17} />
        </Link>
      </div>
    );
  const privacy = kind === "privacy";
  return (
    <div className="container page-wrap prose-page">
      <span className="eyebrow">CLEAR EXPECTATIONS</span>
      <h1>
        {privacy
          ? "Your privacy matters."
          : "A little clarity for every collab."}
      </h1>
      <p className="muted">
        {privacy ? "Privacy notice" : "Terms of use"} / Prototype draft / 4
        October 2026
      </p>
      <div className="info-box">
        Draft content for this frontend demonstration. Final production policies
        require review before launch.
      </div>
      {(privacy
        ? [
            [
              "What this demo stores",
              "Your selected role, saved campaigns, applications, profile changes, and chat messages are stored in this browser’s localStorage. No real authentication credentials are transmitted.",
            ],
            [
              "Images and fonts",
              "Image requests may reach external image providers. Fonts are bundled by Next.js. This prototype has no analytics or advertising trackers.",
            ],
            [
              "Your choices",
              "Clear this site’s browser storage to remove locally saved demo activity. Uploaded file names are displayed locally; files are not sent to a server.",
            ],
            [
              "Production privacy",
              "A production release will need documented purposes, retention periods, account deletion, provider agreements, and a contact for privacy requests.",
            ],
          ]
        : [
            [
              "The demo experience",
              "CollabKaro is currently a frontend prototype with fictional campaigns, creators, and brands. No contract, payment, or real campaign is created by using this demo.",
            ],
            [
              "Creative ownership",
              "Campaign briefs should specify permitted use, revisions, exclusivity, and approval timelines. Creators retain ownership except where an agreed contract states otherwise.",
            ],
            [
              "Community expectations",
              "Treat other people respectfully. Misleading campaign details, spam, impersonation, and abusive content are not acceptable.",
            ],
            [
              "Payments and plans",
              "Prices and subscription limits are illustrative. Selecting a plan does not charge money. Payment processing and escrow are not active.",
            ],
          ]
      ).map(([title, text]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
      <Link className="text-button" href="/contact">
        Get in touch
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
export function Blog({ article = false }: { article?: boolean }) {
  return (
    <div className="container page-wrap prose-page">
      <span className="eyebrow">THE CREATOR JOURNAL</span>
      <h1>
        {article
          ? "A good pitch starts with your voice."
          : "A little insight for your next big collab."}
      </h1>
      {article ? (
        <>
          <p className="lead">
            Your proposal is a chance to show how you think, not just how many
            followers you have.
          </p>
          {[
            [
              "Start with the brand’s actual brief",
              "Show that you understand the goal. Refer to the audience, the product, or the creative direction instead of sending the same opening to everyone.",
            ],
            [
              "Pitch one specific idea",
              "Describe a story you can create. A morning routine, an outfit challenge, or an honest product walkthrough gives the brand something concrete to imagine.",
            ],
            [
              "Bring a little proof",
              "Choose two or three relevant pieces of work. Explain what connected with your audience, without making promises you can’t support.",
            ],
            [
              "Make the next step easy",
              "Include your quote, availability, deliverables, and any questions about usage rights. Clear expectations are the start of a good working relationship.",
            ],
          ].map(([h, p]) => (
            <section key={h}>
              <h2>{h}</h2>
              <p>{p}</p>
            </section>
          ))}
          <Link className="button" href="/campaigns">
            Put your pitch to work
            <ArrowUpRight size={17} />
          </Link>
        </>
      ) : (
        <>
          <p className="lead">
            Practical ideas for creators and brands making better work together.
          </p>
          <Link className="panel blog-card" href="/blog/a-better-creator-pitch">
            <span className="badge soft">CREATOR GUIDE / 4 MIN READ</span>
            <h2>A good pitch starts with your voice.</h2>
            <p>
              How to turn a brief into a proposal that feels clear, specific,
              and unmistakably you.
            </p>
            <span className="text-button">
              Read the story
              <ArrowUpRight size={16} />
            </span>
          </Link>
        </>
      )}
    </div>
  );
}
