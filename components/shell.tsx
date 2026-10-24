"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import {
  Search,
  Moon,
  Sun,
  ArrowUpRight,
  Menu,
  X,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  Bookmark,
  MessageCircle,
  User,
  Users,
  Plus,
  Settings,
  Wallet,
  LogOut,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./logo";
import { Dialog } from "./ui/dialog";
import { useStore, seesNotice } from "@/lib/store";
import { campaigns, creators, posters } from "@/lib/api";
import { backendEnabled } from "@/lib/backend";
import type { Role } from "@/types";
const creatorNav = [
  ["Dashboard", "/c/dashboard", LayoutDashboard],
  ["Find campaigns", "/campaigns", Search],
  ["My applications", "/c/applications", Briefcase],
  ["Saved campaigns", "/c/saved", Bookmark],
  ["Active work", "/c/work", Check],
  ["Messages", "/messages", MessageCircle],
  ["Edit profile", "/c/profile", User],
] as const;
const brandNav = [
  ["Dashboard", "/a/dashboard", LayoutDashboard],
  ["My campaigns", "/a/campaigns", Briefcase],
  ["Discover creators", "/a/discover", Users],
  ["Shortlists", "/a/lists", Bookmark],
  ["Payments", "/a/payments", Wallet],
  ["Messages", "/messages", MessageCircle],
  ["Team & billing", "/a/settings", Settings],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, logout, notifications: allNotices } = useStore();
  const notifications = allNotices.filter((n) => seesNotice(n, role));
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);
  const [bell, setBell] = useState(false);
  useEffect(() => {
    setMounted(true);
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const app =
    pathname.startsWith("/c/") ||
    pathname.startsWith("/a/") ||
    ["/messages", "/notifications", "/settings", "/admin"].includes(pathname);
  const brand = pathname.startsWith("/a/") || role === "Brand-Agency";
  const nav = brand ? brandNav : creatorNav;
  const go = (url: string) => {
    setCommand(false);
    router.push(url);
  };
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <nav className="desktop-nav">
            <Link
              className={pathname === "/campaigns" ? "active" : ""}
              href="/campaigns"
            >
              Find campaigns
            </Link>
            <Link href="/a/discover">Discover creators</Link>
            <Link href="/creators">For creators</Link>
            <Link href="/brands">For brands</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <div className="header-actions">
            <button
              className="search-trigger icon-button"
              aria-label="Search website"
              onClick={() => setCommand(true)}
            >
              <Search size={19} />
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-button theme-button"
              aria-label="Toggle dark mode"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
            {mounted && role !== "Guest" ? (
              <>
                <div className="bell-wrap">
                  <button
                    className="icon-button"
                    aria-label="Notifications"
                    onClick={() => setBell(!bell)}
                  >
                    <Bell size={19} />
                    {notifications.some((n) => !n.read) && (
                      <span className="notification-dot" />
                    )}
                  </button>
                  {bell && (
                    <div className="bell-panel">
                      <h3>Notifications</h3>
                      {notifications.length === 0 && (
                        <small>Nothing new yet.</small>
                      )}
                      {notifications.slice(0, 3).map((n) => (
                        <Link
                          key={n.id}
                          href={n.href}
                          onClick={() => setBell(false)}
                        >
                          <strong>{n.title}</strong>
                          <small>{n.body}</small>
                        </Link>
                      ))}
                      <Link href="/notifications">
                        View all notifications →
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  className="button small"
                  href={
                    role === "Brand-Agency"
                      ? "/a/dashboard"
                      : role === "Admin"
                        ? "/admin"
                        : "/c/dashboard"
                  }
                >
                  Dashboard <ArrowUpRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <Link className="login-link" href="/login">
                  Log in
                </Link>
                <Link className="button small" href="/signup">
                  Get started <ArrowUpRight size={16} />
                </Link>
              </>
            )}
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="mobile-nav">
            <button
              className="text-button"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
            </button>
            {[
              ["Find campaigns", "/campaigns"],
              ["Discover creators", "/a/discover"],
              ["For creators", "/creators"],
              ["For brands", "/brands"],
              ["Pricing", "/pricing"],
              ["Login", "/login"],
            ].map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMenu(false)}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {!backendEnabled && (
        <div className="demo-bar">
          <span>
            <span className="live-dot" />
            Interactive demo{" "}
            <span className="demo-extra">with sample creators & campaigns</span>
          </span>
          <label>
            Viewing as:{" "}
            <select
              aria-label="Viewing role"
              value={mounted ? role : "Guest"}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option>Guest</option>
              <option>Creator</option>
              <option>Brand-Agency</option>
              <option>Admin</option>
            </select>
            <ChevronDown size={12} />
          </label>
        </div>
      )}
      {app ? (
        <div className="app-layout">
          <aside className="sidebar">
            <div className="sidebar-label">
              {brand ? "BRAND WORKSPACE" : "CREATOR WORKSPACE"}
            </div>
            {nav.map(([label, href, Icon]) => (
              <Link
                key={href}
                className={pathname === href ? "selected" : ""}
                href={href}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {brand && (
              <Link className="button" href="/a/campaigns/new">
                <Plus size={18} />
                Post a campaign
              </Link>
            )}
            <div className="sidebar-bottom">
              <ShieldCheck size={23} />
              <strong>Good collabs start with trust.</strong>
              <p>Verified profiles. Clear briefs. Safer conversations.</p>
              <button
                className="text-button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
              >
                <LogOut size={15} />
                {backendEnabled ? "Log out" : "Log out of demo"}
              </button>
            </div>
          </aside>
          <main className="app-main">{children}</main>
        </div>
      ) : (
        <main>{children}</main>
      )}
      {!app && <Footer />}
      {app && (
        <nav className="bottom-nav">
          {nav
            .filter((_, i) => [0, 1, 4, 5].includes(i))
            .slice(0, 4)
            .map(([label, href, Icon]) => (
              <Link href={href} key={href}>
                <Icon size={20} />
                <span>{label.split(" ")[0]}</span>
              </Link>
            ))}
        </nav>
      )}
      <Dialog
        open={command}
        onOpenChange={setCommand}
        title="Find your next collab"
        description="Search campaigns, creators, agencies, and pages."
      >
        <Command className="command">
          <Command.Input autoFocus placeholder="Search anything…" />
          <Command.List>
            <Command.Empty>
              No matches. Try a creator name or campaign.
            </Command.Empty>
            <Command.Group heading="Pages">
              {[
                ["Campaigns", "/campaigns"],
                ["Creators", "/a/discover"],
                [
                  "My dashboard",
                  role === "Brand-Agency" ? "/a/dashboard" : "/c/dashboard",
                ],
                ["Messages", "/messages"],
                ["Pricing", "/pricing"],
              ].map(([name, url]) => (
                <Command.Item key={url} onSelect={() => go(url)}>
                  {name}
                  <ArrowUpRight size={15} />
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Campaigns">
              {campaigns.slice(0, 12).map((c) => (
                <Command.Item
                  key={c.id}
                  onSelect={() => go(`/campaigns/${c.slug}`)}
                >
                  {c.title}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Creators">
              {creators.map((c) => (
                <Command.Item
                  key={c.id}
                  onSelect={() => go(`/creator/${c.username}`)}
                >
                  {c.name} • {c.niche}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Agencies & brands">
              {posters.map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => go(`/agency/${p.slug}`)}
                >
                  {p.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Dialog>
    </>
  );
}
function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <Logo />
          <p>
            Creators aur brands, ek jagah.
            <br />
            Collab karo, grow karo.
          </p>
          <span className="muted">Made for India. Made for you.</span>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/campaigns">Find campaigns</Link>
          <Link href="/a/discover">Discover creators</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/agency/kurta-kraft">Agency profiles</Link>
        </div>
        <div>
          <h3>CollabKaro</h3>
          <Link href="/about">About us</Link>
          <Link href="/blog">The creator journal</Link>
          <Link href="/contact">Get in touch</Link>
          <Link href="/creators">For creators</Link>
          <Link href="/brands">For brands</Link>
        </div>
        <div>
          <h3>
            Free tools <span className="badge lime">FOR YOU</span>
          </h3>
          <Link href="/tools/engagement">
            Engagement calculator <ArrowUpRight size={13} />
          </Link>
          <Link href="/tools/rate-estimator">
            Creator rate estimator <ArrowUpRight size={13} />
          </Link>
          <Link href="/tools/brief-template">
            Campaign brief template <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} CollabKaro. All rights reserved.
        </span>
        <div>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Help & support</Link>
        </div>
      </div>
    </footer>
  );
}
