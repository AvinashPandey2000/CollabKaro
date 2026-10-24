"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, Building2, ShieldCheck, Users } from "lucide-react";
import { creators } from "@/lib/api";
import { ApiError, auth, type Me } from "@/lib/backend";
import { useStore } from "@/lib/store";

type Side = "Creator" | "Brand-Agency";
const dashboard = (role: Me["role"]) =>
  role === "Brand-Agency"
    ? "/a/dashboard"
    : role === "Admin"
      ? "/admin"
      : "/c/dashboard";
const message = (err: unknown) =>
  err instanceof ApiError ? err.message : "Couldn't reach the server.";

/** Phone + OTP login, signup and role selection against the real API. */
export function BackendAuth({ kind }: { kind: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const session = useStore((s) => s.session);
  const signup = kind === "signup";
  const roleSelect = kind === "role-select";
  const reset = kind === "forgot-password";
  const [role, setRole] = useState<Side>("Creator");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [busy, setBusy] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const next = params.get("next");
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : null;

  const enter = async () => {
    useStore.getState().setSession("authed");
    await useStore.getState().sync();
  };
  const choose = async (side: Side) => {
    const me = await auth.chooseRole({
      role: side,
      name: name.trim() || undefined,
      company:
        side === "Brand-Agency" ? company.trim() || undefined : undefined,
    });
    await enter();
    router.push(me.role === "Brand-Agency" ? "/a/onboarding" : "/onboarding");
  };

  const sendCode = async () => {
    if (signup && !name.trim()) return toast.error("Please enter your name.");
    if (signup && !terms)
      return toast.error("Please accept the Terms and Privacy Policy.");
    setBusy(true);
    try {
      await auth.sendOtp(phone);
      setStep("code");
      toast.success("Code sent. It expires in 5 minutes.");
      setTimeout(() => refs.current[0]?.focus(), 50);
    } catch (err) {
      toast.error(message(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter the 6-digit code.");
    setBusy(true);
    try {
      const { user } = await auth.verifyOtp({
        phone,
        code,
        name: name.trim() || undefined,
        acceptTerms: signup ? terms : undefined,
      });
      if (user.role) {
        await enter();
        router.push(safeNext || dashboard(user.role));
      } else if (signup) await choose(role);
      else {
        await enter();
        router.push("/role-select");
      }
    } catch (err) {
      toast.error(message(err));
      setOtp(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  const roleCards = (
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
  );

  let body: React.ReactNode;
  if (reset)
    body = (
      <div className="form-stack">
        <div className="info-box">
          CollabKaro logs you in with a one-time code sent to your phone, so
          there’s no password to reset.
        </div>
        <Link href="/login" className="button full">
          Log in with OTP
        </Link>
      </div>
    );
  else if (roleSelect)
    body =
      session === "guest" ? (
        <div className="form-stack">
          <div className="info-box">Log in first, then pick your side.</div>
          <Link href="/login" className="button full">
            Log in
          </Link>
        </div>
      ) : (
        <div className="form-stack">
          {roleCards}
          {role === "Brand-Agency" && (
            <label className="field">
              <span>Brand or agency name</span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Kurta Kraft"
              />
            </label>
          )}
          <button
            className="button full"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await choose(role);
              } catch (err) {
                toast.error(message(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            Let’s get started
            <ArrowUpRight size={17} />
          </button>
        </div>
      );
  else if (step === "phone")
    body = (
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          void sendCode();
        }}
      >
        {signup && roleCards}
        {signup && (
          <label className="field">
            <span>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              autoComplete="name"
            />
          </label>
        )}
        {signup && role === "Brand-Agency" && (
          <label className="field">
            <span>Brand or agency name</span>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Kurta Kraft"
              autoComplete="organization"
            />
          </label>
        )}
        <label className="field">
          <span>Mobile number</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            required
          />
        </label>
        {signup && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            I agree to the <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>, and I’m 18 or older.
          </label>
        )}
        <button className="button full" disabled={busy}>
          Send code
          <ArrowUpRight size={17} />
        </button>
        <p className="auth-foot">
          {signup ? "Already part of the community?" : "New around here?"}{" "}
          <Link href={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Join the community"}
          </Link>
        </p>
      </form>
    );
  else
    body = (
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
                if (e.key === "Backspace" && !n) refs.current[i - 1]?.focus();
                if (e.key === "Enter") void verify();
              }}
            />
          ))}
        </div>
        <button className="button full" disabled={busy} onClick={verify}>
          Verify & continue
          <ArrowUpRight size={17} />
        </button>
        <button className="text-button" disabled={busy} onClick={sendCode}>
          Resend code
        </button>
        <button className="text-button" onClick={() => setStep("phone")}>
          Change number
        </button>
      </div>
    );

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
        {creators[0] && (
          <Image
            src={creators[0].avatar}
            alt="Meet your creator community"
            width={390}
            height={350}
          />
        )}
        <div>
          <ShieldCheck size={18} />
          Good collabs. Clear expectations.
        </div>
      </section>
      <section className="auth-form panel">
        <h2>
          {reset
            ? "No password needed."
            : roleSelect
              ? "How do you collab?"
              : step === "code"
                ? "One little verification."
                : signup
                  ? "Your next collab starts here."
                  : "Good to have you back."}
        </h2>
        <p>
          {step === "code"
            ? `Enter the 6-digit code we sent to ${phone}.`
            : roleSelect
              ? "Pick the side you’re on. You can’t switch later."
              : "We’ll text you a one-time code to log in."}
        </p>
        {body}
      </section>
    </div>
  );
}
