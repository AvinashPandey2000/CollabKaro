"use client";
import { mergeCampaigns } from "@/lib/api";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ArrowLeft,
  Check,
  Camera as Instagram,
  ShieldCheck,
  Upload,
  Eye,
  Users,
  Building2,
  Video as Youtube,
} from "lucide-react";
import {
  creators,
  campaigns,
  niches,
  cities,
  languages,
  platforms,
} from "@/lib/api";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import type { Campaign } from "@/types";
import { CampaignCard } from "./cards";
const authSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  name: z.string().optional(),
});
type AuthValues = z.infer<typeof authSchema>;
export function Auth({ kind }: { kind: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const s = useStore();
  const [role, setRole] = useState<"Creator" | "Brand-Agency">("Creator");
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "", name: "" },
  });
  const signup = kind === "signup";
  const reset = kind === "forgot-password";
  const isOtp = kind === "otp";
  const roleSelect = kind === "role-select";
  const next = params.get("next");
  const finish = () => {
    s.setRole(role);
    const safe = next?.startsWith("/") && !next.startsWith("//") ? next : null;
    router.push(
      safe ||
        (signup
          ? "/onboarding"
          : role === "Creator"
            ? "/c/dashboard"
            : "/a/dashboard"),
    );
  };
  return (
    <div className="auth-layout container">
      <section className="auth-story">
        <span className="eyebrow">YOUR CREATIVITY BELONGS HERE</span>
        <h1>
          Your next chapter.
          <br />
          Starts with
          <br />
          <span className="brand-text">a hello.</span>
        </h1>
        <p>
          Creators aur brands, ek jagah.
          <br />
          Find your people. Make great things.
        </p>
        <Image
          src={creators[0].avatar}
          alt="Meet your creator community"
          width={390}
          height={350}
        />
        <div>
          <ShieldCheck size={18} />
          Good collabs. Clear expectations.
        </div>
      </section>
      <section className="auth-form panel">
        <span className="badge soft">MOCK ACCOUNT ACCESS</span>
        <h2>
          {reset
            ? "Let’s get you back in."
            : isOtp
              ? "One little verification."
              : roleSelect
                ? "How do you collab?"
                : signup
                  ? "Your next collab starts here."
                  : "Good to have you back."}
        </h2>
        <p>
          {reset
            ? "Enter your email to simulate a reset request."
            : isOtp
              ? "Demo code: 123456. No real SMS is sent."
              : signup
                ? "Make a little room for big possibilities."
                : "Pick your demo role and jump back in."}
        </p>
        {!reset && !isOtp && (
          <div className="role-cards">
            <button
              type="button"
              className={role === "Creator" ? "selected" : ""}
              onClick={() => setRole("Creator")}
            >
              <Users size={21} />
              <strong>I’m a Creator</strong>
              <small>Find my next collab</small>
            </button>
            <button
              type="button"
              className={role === "Brand-Agency" ? "selected" : ""}
              onClick={() => setRole("Brand-Agency")}
            >
              <Building2 size={21} />
              <strong>I’m a Brand / Agency</strong>
              <small>Find creative partners</small>
            </button>
          </div>
        )}
        {roleSelect ? (
          <button
            className="button full"
            onClick={() => {
              s.setRole(role);
              router.push("/onboarding");
            }}
          >
            Let’s get started
            <ArrowUpRight size={17} />
          </button>
        ) : isOtp ? (
          <div className="form-stack">
            <div
              className="otp-inputs"
              onPaste={(e) => {
                e.preventDefault();
                const digits = e.clipboardData
                  .getData("text")
                  .replace(/\D/g, "")
                  .slice(0, 6)
                  .split("");
                setOtp(Array.from({ length: 6 }, (_, i) => digits[i] || ""));
                refs.current[Math.min(digits.length, 5)]?.focus();
              }}
            >
              {otp.map((n, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  aria-label={`OTP digit ${i + 1}`}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={n}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(-1);
                    setOtp((a) => a.map((x, j) => (j === i ? v : x)));
                    if (v) refs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !n)
                      refs.current[i - 1]?.focus();
                  }}
                />
              ))}
            </div>
            <button
              className="button full"
              onClick={() =>
                otp.join("") === "123456"
                  ? finish()
                  : toast.error("Use the demo code 123456.")
              }
            >
              Verify & continue
              <ArrowUpRight size={17} />
            </button>
            <button
              className="text-button"
              onClick={() => toast.info("Demo verification code: 123456")}
            >
              Resend code
            </button>
          </div>
        ) : reset ? (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Demo reset requested. No email has been sent.");
            }}
          >
            <label className="field">
              <span>Email address</span>
              <input type="email" required placeholder="you@example.com" />
            </label>
            <button className="button full">
              {sent ? "Request another reset" : "Send reset link"}
            </button>
            {sent && (
              <div className="info-box">
                In production, a reset link will arrive in your inbox. This demo
                does not send emails.
              </div>
            )}
            <Link href="/login" className="text-button">
              Back to login
            </Link>
          </form>
        ) : (
          <form
            className="form-stack"
            onSubmit={form.handleSubmit((v) => {
              if (signup && !v.name?.trim()) {
                form.setError("name", { message: "Please enter your name." });
                return;
              }
              if (v.name) s.updateProfile({ name: v.name });
              finish();
            })}
          >
            {signup && (
              <label className="field">
                <span>Your name</span>
                <input
                  {...form.register("name")}
                  placeholder="What should we call you?"
                />
                {form.formState.errors.name && (
                  <small className="error">
                    {form.formState.errors.name.message}
                  </small>
                )}
              </label>
            )}
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                {...form.register("email")}
                placeholder="you@example.com"
              />
              {form.formState.errors.email && (
                <small className="error">
                  {form.formState.errors.email.message}
                </small>
              )}
            </label>
            <label className="field">
              <span>Password</span>
              <div className="password-input">
                <input
                  type={show ? "text" : "password"}
                  {...form.register("password")}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  aria-label="Show password"
                  onClick={() => setShow(!show)}
                >
                  <Eye size={17} />
                </button>
              </div>
              {form.formState.errors.password && (
                <small className="error">
                  {form.formState.errors.password.message}
                </small>
              )}
            </label>
            {!signup && (
              <Link className="text-button align-right" href="/forgot-password">
                Forgot password?
              </Link>
            )}
            <button
              className="button full"
              disabled={form.formState.isSubmitting}
            >
              {signup ? "Create demo account" : "Log in to demo"}
              <ArrowUpRight size={17} />
            </button>
            <div className="auth-divider">
              <span>or keep it simple</span>
            </div>
            <Link className="button secondary full" href="/otp">
              Continue with demo OTP
            </Link>
            <p className="auth-foot">
              {signup ? "Already part of the community?" : "New around here?"}{" "}
              <Link href={signup ? "/login" : "/signup"}>
                {signup ? "Log in" : "Join the community"}
              </Link>
            </p>
            <small className="muted">
              By continuing, you agree to our <Link href="/terms">Terms</Link>{" "}
              and <Link href="/privacy">Privacy Policy</Link>. This is a local
              demo; no credentials are sent.
            </small>
          </form>
        )}
      </section>
    </div>
  );
}
export function Onboarding({ brand = false }: { brand?: boolean }) {
  const s = useStore();
  const router = useRouter();
  const isBrand = brand || s.role === "Brand-Agency";
  const [step, setStep] = useState(0);
  const [name, setName] = useState(s.profile.name || "");
  const [city, setCity] = useState("Mumbai");
  const [language, setLanguage] = useState("Hindi");
  const [selected, setSelected] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("Agency");
  const [file, setFile] = useState("");
  return (
    <div className="container onboarding-wrap">
      <span className="eyebrow">A LITTLE ABOUT YOU</span>
      <h1>
        {isBrand ? "Build your brand’s home." : "Make your profile, yours."}
      </h1>
      <p className="muted">A few details now. A world of possibilities next.</p>
      <div className="wizard-progress">
        {(isBrand
          ? ["Company info", "Account type", "Verification"]
          : ["The basics", "Your niches", "Your socials"]
        ).map((t, i) => (
          <div className={i <= step ? "complete" : ""} key={t}>
            <span>{i < step ? <Check size={15} /> : i + 1}</span>
            {t}
          </div>
        ))}
      </div>
      <form
        className="panel form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 0 && !name.trim()) {
            toast.error("Please enter your name.");
            return;
          }
          if (step === 1 && !isBrand && !selected.length) {
            toast.error("Pick at least one niche.");
            return;
          }
          if (step < 2) setStep(step + 1);
          else {
            s.updateProfile({
              name,
              city,
              language,
              niches: selected.join(", "),
              accountType: account,
              connected: String(connected),
            });
            s.setRole(isBrand ? "Brand-Agency" : "Creator");
            toast.success("Your demo profile is ready. Let’s collab!");
            router.push(isBrand ? "/a/dashboard" : "/c/dashboard");
          }
        }}
      >
        {step === 0 ? (
          <>
            <h2>
              {isBrand
                ? "Tell us about your company."
                : "Start with the basics."}
            </h2>
            <label className="field">
              <span>{isBrand ? "Company name" : "Full name"}</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBrand ? "Your brand or agency" : "Your name"}
              />
            </label>
            {isBrand && (
              <label className="field">
                <span>Company website (optional)</span>
                <input type="url" placeholder="https://yourbrand.com" />
              </label>
            )}
            <label className="field">
              <span>Based in</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>
                {isBrand ? "Communication language" : "Content language"}
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
          </>
        ) : step === 1 ? (
          <>
            <h2>
              {isBrand
                ? "What kind of team are you?"
                : "What do you love creating?"}
            </h2>
            <p>
              Choose{" "}
              {isBrand
                ? "the best fit for your business."
                : "up to 3 niches that feel like you."}
            </p>
            <div className="niche-picker">
              {(isBrand
                ? ["Agency", "Large brand", "Small business"]
                : niches
              ).map((n) => (
                <button
                  type="button"
                  className={
                    (isBrand ? account === n : selected.includes(n))
                      ? "selected"
                      : ""
                  }
                  key={n}
                  onClick={() =>
                    isBrand
                      ? setAccount(n)
                      : setSelected((s) =>
                          s.includes(n)
                            ? s.filter((x) => x !== n)
                            : s.length < 3
                              ? [...s, n]
                              : s,
                        )
                  }
                >
                  {n}
                  {(isBrand ? account === n : selected.includes(n)) && (
                    <Check size={15} />
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>
              {isBrand
                ? "Trust starts with verification."
                : "Let your community do the talking."}
            </h2>
            {isBrand ? (
              <>
                <label className="upload-zone">
                  <Upload size={28} />
                  <strong>{file || "Upload a company document"}</strong>
                  <span>
                    PDF or image. Demo only; files stay on your device.
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
                  />
                </label>
                <label className="field">
                  <span>GST number (optional)</span>
                  <input placeholder="Your company GSTIN" />
                </label>
              </>
            ) : (
              <>
                <button
                  className="button secondary full"
                  type="button"
                  onClick={() => {
                    setConnected(true);
                    toast.success("Instagram connected in demo mode.");
                  }}
                >
                  <Instagram size={21} />
                  {connected
                    ? "Instagram connected ✓"
                    : "Connect Instagram (demo)"}
                </button>
                <button
                  className="button secondary full"
                  type="button"
                  onClick={() =>
                    toast.success("YouTube connected in demo mode.")
                  }
                >
                  <Youtube size={21} />
                  Connect YouTube (demo)
                </button>
                <div className="info-box">
                  <ShieldCheck size={19} />
                  Social data is simulated. We never ask for your social
                  password.
                </div>
              </>
            )}
          </>
        )}
        <div className="row between">
          {step > 0 ? (
            <button
              type="button"
              className="button secondary"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <span />
          )}
          <button className="button">
            {step === 2 ? "Let’s collab" : "Continue"}
            <ArrowUpRight size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
const campaignSchema = z
  .object({
    title: z
      .string()
      .min(10, "Add a descriptive title (at least 10 characters)."),
    brand: z.string().min(2, "Enter your brand name."),
    brief: z
      .string()
      .min(60, "Give creators at least 60 characters of context."),
    niche: z.string().min(1),
    platform: z.string().min(1),
    type: z.enum(["Paid", "Barter", "Affiliate"]),
    min: z.number().min(0),
    max: z.number().min(1),
    needed: z.number().int().min(1).max(1000),
    followers: z.number().min(0),
    city: z.string(),
    language: z.string(),
    deadline: z
      .string()
      .min(1, "Pick a deadline.")
      .refine((v) => new Date(v) > new Date(), "Pick a future date."),
    rights: z.string().min(10, "Add a usage-rights description."),
    reels: z.number().int().min(1).max(20),
  })
  .refine((v) => v.max >= v.min, {
    message: "Maximum budget should be at least the minimum.",
    path: ["max"],
  });
type CampaignValues = z.infer<typeof campaignSchema>;
export function CreateCampaign() {
  const s = useStore();
  const params = useSearchParams();
  const existing = mergeCampaigns(s.campaigns).find(
    (c) => c.id === params.get("edit"),
  );
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<CampaignValues>({
    resolver: zodResolver(campaignSchema),
    values: existing
      ? {
          ...existing,
          rights: existing.usage,
          reels: existing.deliverables[0]?.quantity || 1,
        }
      : undefined,
    defaultValues: {
      title: existing?.title || "",
      brand: existing?.brand || "",
      brief: existing?.brief || "",
      niche: existing?.niche || "Fashion",
      platform: existing?.platform || "Instagram",
      type: existing?.type || "Paid",
      min: existing?.min ?? 5000,
      max: existing?.max ?? 15000,
      needed: existing?.needed ?? 8,
      followers: existing?.followers ?? 5000,
      city: existing?.city || "All India",
      language: existing?.language || "Hindi",
      deadline: existing?.deadline || "2026-11-20",
      rights:
        existing?.usage ||
        "30 days of organic usage. Paid ads by separate agreement.",
      reels: existing?.deliverables[0]?.quantity ?? 1,
    },
  });
  const v = form.watch();
  const fields: (keyof CampaignValues)[][] = [
    ["title", "brand", "brief", "niche"],
    ["platform", "reels", "rights"],
    ["type", "min", "max", "needed"],
    ["followers", "city", "language", "deadline"],
    [],
  ];
  const preview: Campaign = {
    ...campaigns[0],
    title: v.title || "Your next great campaign",
    brand: v.brand || "Your brand",
    niche: v.niche,
    platform: v.platform,
    type: v.type,
    min: v.min || 0,
    max: v.max || 0,
    needed: v.needed || 1,
    city: v.city,
    brief: v.brief,
  };
  const save = (values: CampaignValues, draft = false) => {
    const id = existing?.id || crypto.randomUUID();
    const c: Campaign = {
      ...preview,
      ...values,
      id,
      slug:
        existing?.slug ||
        `${values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 6)}`,
      posterId: "po-1",
      language: values.language,
      followers: values.followers,
      deadline: values.deadline,
      usage: values.rights,
      deliverables: [
        {
          type: `${values.platform} ${values.platform === "YouTube" ? "video" : "reel"}`,
          quantity: values.reels,
        },
      ],
      status: draft ? "Draft" : "Live",
      posted: new Date().toISOString(),
      applicants: existing?.applicants || 0,
      featured: false,
      urgent: false,
    };
    s.post(c);
    s.notify(
      draft ? "Draft saved" : "Campaign is live",
      values.title,
      "/a/campaigns",
    );
    toast.success(
      draft
        ? "Your draft is saved."
        : "Your campaign is live. Let’s find your people!",
    );
    router.push("/a/campaigns");
  };
  const field = (
    name: keyof CampaignValues,
    label: string,
    type = "text",
    options?: string[],
  ) => (
    <label className="field" key={name}>
      <span>{label}</span>
      {options ? (
        <select {...form.register(name)}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea rows={5} {...form.register(name)} />
      ) : (
        <input
          type={type}
          {...form.register(name, { valueAsNumber: type === "number" })}
        />
      )}
      {form.formState.errors[name] && (
        <small className="error">{form.formState.errors[name]?.message}</small>
      )}
    </label>
  );
  return (
    <>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">YOUR BRIEF. THEIR CREATIVE MAGIC.</span>
          <h1>
            {existing
              ? "A little clarity for your campaign."
              : "Let’s make a great campaign."}
          </h1>
          <p>Clear expectations lead to better collaborations.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            if (!v.title.trim()) {
              form.setError("title", { message: "Give your draft a title." });
              setStep(0);
              return;
            }
            save(
              { ...v, brief: v.brief || "Draft brief to be completed." },
              true,
            );
          }}
        >
          Save draft
        </button>
      </div>
      <div className="wizard-progress">
        {["Basics", "Deliverables", "Budget", "Eligibility", "Review"].map(
          (t, i) => (
            <div key={t} className={i <= step ? "complete" : ""}>
              <span>{i < step ? <Check size={14} /> : i + 1}</span>
              {t}
            </div>
          ),
        )}
      </div>
      <div className="create-layout">
        <form
          className="panel form-stack"
          onSubmit={form.handleSubmit((values) => save(values))}
        >
          <h2>
            {
              [
                "Tell your story.",
                "What will creators make?",
                "A fair budget for great work.",
                "Find the right fit.",
                "Ready to make it happen?",
              ][step]
            }
          </h2>
          {step === 0 ? (
            <>
              {field("title", "Campaign title")}
              {field("brand", "Brand name")}
              {field("brief", "The creative brief", "textarea")}
              {field("niche", "Niche", "text", niches)}
            </>
          ) : step === 1 ? (
            <>
              {field("platform", "Platform", "text", platforms)}
              {field("reels", "Number of reels / videos", "number")}
              {field("rights", "Content usage rights", "textarea")}
            </>
          ) : step === 2 ? (
            <>
              {field("type", "Collab type", "text", [
                "Paid",
                "Barter",
                "Affiliate",
              ])}
              <div className="form-grid">
                {field("min", "Minimum budget (₹)", "number")}
                {field("max", "Maximum budget (₹)", "number")}
              </div>
              {field("needed", "Creators needed", "number")}
            </>
          ) : step === 3 ? (
            <>
              {field("followers", "Minimum followers", "number")}
              {field("city", "Location", "text", ["All India", ...cities])}
              {field("language", "Content language", "text", languages)}
              {field("deadline", "Application deadline", "date")}
            </>
          ) : (
            <>
              <h3>{v.title}</h3>
              <p>{v.brief}</p>
              <div className="review-grid">
                <span>
                  {v.platform} / {v.niche}
                </span>
                <span>
                  {v.type} / {formatINR(v.min)} - {formatINR(v.max)}
                </span>
                <span>
                  {v.needed} creators / {v.city}
                </span>
                <span>Deadline: {v.deadline}</span>
              </div>
              <div className="info-box">
                <ShieldCheck size={20} />
                Publishing adds this campaign to the local demo marketplace.
              </div>
            </>
          )}
          <div className="row between">
            <button
              className="button secondary"
              type="button"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                className="button"
                key="continue"
                onClick={async (event) => {
                  event.preventDefault();
                  if (await form.trigger(fields[step])) setStep(step + 1);
                }}
              >
                Continue
                <ArrowUpRight size={17} />
              </button>
            ) : (
              <button
                key="publish"
                className="button"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                Publish campaign
                <ArrowUpRight size={17} />
              </button>
            )}
          </div>
        </form>
        <aside>
          <span className="eyebrow">YOUR LIVE PREVIEW</span>
          <CampaignCard campaign={preview} />
        </aside>
      </div>
    </>
  );
}
const profileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().min(20),
  city: z.string(),
  language: z.string(),
  niche: z.string(),
  rate: z.number().min(0),
  turnaround: z.number().min(1).max(90),
  website: z.union([z.literal(""), z.url()]),
  equipment: z.string(),
  restrictions: z.string(),
});
type ProfileValues = z.infer<typeof profileSchema>;
export function EditProfile() {
  const s = useStore();
  const c = creators[0];
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: s.profile.name || c.name,
      bio: s.profile.bio || c.bio,
      city: s.profile.city || c.city,
      language: s.profile.language || "Hindi",
      niche: s.profile.niche || c.niche,
      rate: Number(s.profile.rate) || c.price,
      turnaround: Number(s.profile.turnaround) || c.turnaround,
      website: s.profile.website || "",
      equipment: s.profile.equipment || c.equipment.join(", "),
      restrictions: s.profile.restrictions || c.restrictions.join(", "),
    },
  });
  const v = form.watch();
  return (
    <>
      <div className="page-heading">
        <h1>Show the world your kind of creative.</h1>
        <p>A little more you. A lot more opportunity.</p>
      </div>
      <div className="create-layout">
        <form
          className="panel form-stack"
          onSubmit={form.handleSubmit((v) => {
            s.updateProfile(
              Object.fromEntries(
                Object.entries(v).map(([k, v]) => [k, String(v)]),
              ),
            );
            toast.success("Your demo profile is updated.");
          })}
        >
          <h2>The basics</h2>
          {[
            ["name", "Full name"],
            ["bio", "About you"],
            ["website", "Portfolio website"],
            ["equipment", "Equipment"],
            ["restrictions", "Restricted categories"],
          ].map(([name, label]) => (
            <label className="field" key={name}>
              <span>{label}</span>
              {name === "bio" ? (
                <textarea
                  rows={4}
                  {...form.register(name as keyof ProfileValues)}
                />
              ) : (
                <input {...form.register(name as keyof ProfileValues)} />
              )}
              {form.formState.errors[name as keyof ProfileValues] && (
                <small className="error">
                  {form.formState.errors[name as keyof ProfileValues]?.message}
                </small>
              )}
            </label>
          ))}
          <div className="form-grid">
            {[
              ["city", "City", cities],
              ["niche", "Niche", niches],
              ["language", "Content language", languages],
            ].map(([name, label, options]) => (
              <label className="field" key={name as string}>
                <span>{label as string}</span>
                <select {...form.register(name as keyof ProfileValues)}>
                  {(options as string[]).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <h2>Your rate card & work</h2>
          <div className="form-grid">
            <label className="field">
              <span>Starting reel rate (₹)</span>
              <input
                type="number"
                {...form.register("rate", { valueAsNumber: true })}
              />
              {form.formState.errors.rate && (
                <small className="error">
                  {form.formState.errors.rate.message}
                </small>
              )}
            </label>
            <label className="field">
              <span>Turnaround (days)</span>
              <input
                type="number"
                {...form.register("turnaround", { valueAsNumber: true })}
              />
              {form.formState.errors.turnaround && (
                <small className="error">
                  {form.formState.errors.turnaround.message}
                </small>
              )}
            </label>
          </div>
          <h3>Featured content</h3>
          <div className="showcase-picker">
            {c.content.slice(0, 3).map((item) => (
              <label key={item.id}>
                <Image
                  src={item.image}
                  width={120}
                  height={90}
                  alt={item.title}
                />
                <input type="checkbox" defaultChecked /> Pin this content
              </label>
            ))}
          </div>
          <button className="button">
            Save profile
            <Check size={17} />
          </button>
        </form>
        <aside className="panel live-profile">
          <span className="eyebrow">LIVE PROFILE PREVIEW</span>
          <Image
            className="round"
            src={c.avatar}
            width={96}
            height={96}
            alt={v.name}
          />
          <h2>{v.name}</h2>
          <span>
            {v.niche} / {v.city}
          </span>
          <p>{v.bio}</p>
          <strong>{formatINR(v.rate || 0)} starting rate</strong>
          <p>{v.turnaround} days turnaround</p>
          <Link className="text-button" href={`/creator/${c.username}`}>
            See your media kit
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
    </>
  );
}
