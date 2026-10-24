"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import {
  applications,
  conversations,
  creators as catalogCreators,
  notifications,
  posters as catalogPosters,
} from "@/data";
import {
  ApiError,
  auth,
  backendEnabled,
  remote,
  type RemoteState,
} from "@/lib/backend";
import type {
  Role,
  Application,
  Campaign,
  Status,
  Conversation,
  Notice,
  Message,
  Deal,
  ContentItem,
  PastCollab,
} from "@/types";
/** Which creator/brand records the signed-in user acts as. */
export interface Identity {
  creatorId: string;
  posterId: string;
  userId?: string;
  phone?: string;
}
// The demo always acts as Aanya Sharma (cr-1) and Kurta Kraft (po-1).
const DEMO_IDENTITY: Identity = { creatorId: "cr-1", posterId: "po-1" };
interface Store {
  role: Role;
  me: Identity;
  /** "demo" without a backend; otherwise the API session state. */
  session: "demo" | "loading" | "guest" | "authed";
  /** Bumped when the live catalogue (campaigns/creators/posters) reloads. */
  catalogVersion: number;
  hydrate: (state: RemoteState) => void;
  /** Refetch the signed-in user's state from the API. */
  sync: () => Promise<void>;
  setSession: (session: Store["session"]) => void;
  bumpCatalog: () => void;
  logout: () => Promise<void>;
  saved: string[];
  shortlist: string[];
  applications: Application[];
  campaigns: Campaign[];
  conversations: Conversation[];
  notifications: Notice[];
  profile: Record<string, string>;
  plan: string;
  /** Agreed deals with hired creators (fee, milestones, contract signatures). */
  deals: Deal[];
  /** The demo creator's own portfolio links and past brand collabs. */
  portfolio: ContentItem[];
  pastCollabs: PastCollab[];
  addPortfolio: (item: ContentItem) => void;
  removePortfolio: (id: string) => void;
  addPastCollab: (collab: PastCollab) => void;
  removePastCollab: (index: number) => void;
  saveDeal: (deal: Deal) => void;
  recordPayment: (
    dealId: string,
    milestoneId: string,
    payment: { paidOn: string; reference?: string } | null,
  ) => void;
  signDeal: (dealId: string, party: "brand" | "creator", name: string) => void;
  setRole: (role: Role) => void;
  toggleSave: (id: string) => void;
  toggleShortlist: (id: string) => void;
  apply: (a: Application) => boolean;
  setStatus: (id: string, status: Status) => void;
  post: (c: Campaign) => void;
  campaignStatus: (id: string, status: Campaign["status"]) => void;
  send: (id: string, message: Message) => void;
  updateMessage: (
    threadId: string,
    messageId: string,
    patch: Partial<Message>,
  ) => void;
  startChat: (
    creatorId: string,
    posterId?: string,
    campaignId?: string,
  ) => string;
  markRead: () => void;
  updateProfile: (p: Record<string, string>) => void;
  setPlan: (p: string) => void;
  notify: (title: string, body: string, href: string, audience?: Role) => void;
}
export const seesNotice = (n: Notice, role: Role) =>
  !n.audience || n.audience === role;
const roleOf = (r: RemoteState["me"]["role"]): Role => r ?? "Guest";
/** Make sure the user's own profile is in the shared catalogue array. */
function upsert<T extends { id: string }>(list: T[], item?: T) {
  if (!item) return;
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) list.push(item);
  else list[i] = item;
}
let syncTimer: ReturnType<typeof setTimeout> | undefined;
let queue: Promise<void> = Promise.resolve();
/**
 * Backend mode: send a mutation to the API. The store has already applied it
 * optimistically; on failure we tell the user and reload the server's truth.
 * Calls run one at a time, in order (e.g. open a chat, then send into it).
 */
function push(call: () => Promise<unknown>) {
  if (!backendEnabled) return;
  queue = queue
    .then(call)
    .then(() => scheduleSync())
    .catch((err: unknown) => {
      toast.error(
        err instanceof ApiError ? err.message : "Couldn't save. Please retry.",
      );
      scheduleSync(0);
    });
}
export function scheduleSync(delay = 600) {
  if (!backendEnabled) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void useStore.getState().sync(), delay);
}
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      role: "Guest",
      me: DEMO_IDENTITY,
      session: backendEnabled ? "loading" : "demo",
      catalogVersion: 0,
      hydrate: (r) => {
        upsert(catalogCreators, r.creator);
        upsert(catalogPosters, r.poster);
        set({
          role: roleOf(r.me.role),
          me: {
            creatorId: r.me.creatorId ?? "",
            posterId: r.me.posterId ?? "",
            userId: r.me.id,
            phone: r.me.phone,
          },
          session: "authed",
          applications: r.applications,
          campaigns: r.campaigns,
          conversations: r.conversations,
          notifications: r.notifications,
          deals: r.deals,
          saved: r.saved,
          shortlist: r.shortlist,
          profile: r.profile,
          plan: r.plan,
          portfolio: r.portfolio,
          pastCollabs: r.pastCollabs,
        });
      },
      sync: async () => {
        if (!backendEnabled || get().session !== "authed") return;
        // Let queued writes land first so we don't overwrite them with stale data.
        await queue;
        try {
          get().hydrate(await remote.state());
        } catch (err) {
          if (err instanceof ApiError && err.status === 401)
            get().setSession("guest");
        }
      },
      setSession: (session) =>
        set(
          session === "guest"
            ? {
                session,
                role: "Guest",
                me: { creatorId: "", posterId: "" },
                applications: [],
                campaigns: [],
                conversations: [],
                notifications: [],
                deals: [],
                saved: [],
                shortlist: [],
                profile: {},
                plan: "Free",
                portfolio: [],
                pastCollabs: [],
              }
            : { session },
        ),
      bumpCatalog: () => set((s) => ({ catalogVersion: s.catalogVersion + 1 })),
      logout: async () => {
        if (backendEnabled) {
          await auth.logout();
          get().setSession("guest");
        } else set({ role: "Guest" });
      },
      saved: [],
      shortlist: [],
      applications: backendEnabled ? [] : applications,
      campaigns: [],
      conversations: backendEnabled ? [] : conversations,
      notifications: backendEnabled ? [] : notifications,
      profile: {},
      plan: "Free",
      deals: [],
      portfolio: [],
      pastCollabs: [],
      addPortfolio: (item) => {
        set((s) => ({ portfolio: [item, ...s.portfolio] }));
        push(() => remote.addPortfolio(item));
      },
      removePortfolio: (id) => {
        set((s) => ({ portfolio: s.portfolio.filter((x) => x.id !== id) }));
        push(() => remote.removePortfolio(id));
      },
      addPastCollab: (collab) => {
        set((s) => ({ pastCollabs: [collab, ...s.pastCollabs] }));
        push(() => remote.addPastCollab(collab));
      },
      removePastCollab: (index) => {
        set((s) => ({
          pastCollabs: s.pastCollabs.filter((_, i) => i !== index),
        }));
        push(() => remote.removePastCollab(index));
      },
      saveDeal: (deal) => {
        const isNew = !get().deals.some((d) => d.id === deal.id);
        set((s) => ({
          deals: [deal, ...s.deals.filter((d) => d.id !== deal.id)],
        }));
        push(() => remote.saveDeal(deal));
        get().notify(
          isNew ? "Deal set up" : "Deal updated",
          isNew
            ? "Review and sign your collaboration agreement."
            : "The terms changed, so the contract needs signing again.",
          `/c/work/${deal.campaignId}`,
          "Creator",
        );
      },
      recordPayment: (dealId, milestoneId, payment) => {
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id !== dealId
              ? d
              : {
                  ...d,
                  updatedAt: new Date().toISOString(),
                  milestones: d.milestones.map((m) =>
                    m.id !== milestoneId
                      ? m
                      : payment
                        ? { ...m, status: "paid", ...payment }
                        : {
                            ...m,
                            status: "due",
                            paidOn: undefined,
                            reference: undefined,
                          },
                  ),
                },
          ),
        }));
        push(() => remote.recordPayment(dealId, milestoneId, payment));
        const d = get().deals.find((x) => x.id === dealId);
        const m = d?.milestones.find((x) => x.id === milestoneId);
        if (d && m && payment)
          get().notify(
            "Payment recorded",
            `The brand marked ₹${m.amount.toLocaleString("en-IN")} (${m.label.toLowerCase()}) as paid.`,
            `/c/work/${d.campaignId}`,
            "Creator",
          );
      },
      signDeal: (dealId, party, name) => {
        const signature = { name, at: new Date().toISOString() };
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id !== dealId
              ? d
              : party === "brand"
                ? { ...d, brandSignature: signature }
                : { ...d, creatorSignature: signature },
          ),
        }));
        push(() => remote.signDeal(dealId, name));
        const d = get().deals.find((x) => x.id === dealId);
        if (d)
          get().notify(
            party === "brand" ? "Contract ready to sign" : "Creator signed",
            party === "brand"
              ? "The brand signed your collaboration agreement."
              : "The creator signed the collaboration agreement.",
            party === "brand"
              ? `/c/work/${d.campaignId}`
              : `/a/campaigns/${d.campaignId}/applicants`,
            party === "brand" ? "Creator" : "Brand-Agency",
          );
      },
      // With a backend the role comes from the account, not the demo switcher.
      setRole: (role) => {
        if (!backendEnabled) set({ role });
      },
      toggleSave: (id) => {
        const on = !get().saved.includes(id);
        set((s) => ({
          saved: on ? [...s.saved, id] : s.saved.filter((x) => x !== id),
        }));
        push(() => remote.setSaved(id, on));
      },
      toggleShortlist: (id) => {
        const on = !get().shortlist.includes(id);
        set((s) => ({
          shortlist: on
            ? [...s.shortlist, id]
            : s.shortlist.filter((x) => x !== id),
        }));
        push(() => remote.setShortlisted(id, on));
      },
      apply: (a) => {
        if (
          get().applications.some(
            (x) =>
              x.campaignId === a.campaignId &&
              x.creatorId === a.creatorId &&
              x.status !== "Withdrawn",
          )
        )
          return false;
        set((s) => ({ applications: [a, ...s.applications] }));
        push(() => remote.apply(a));
        get().notify(
          "Application sent",
          "Your next collab is one step closer.",
          "/c/applications",
          "Creator",
        );
        return true;
      },
      setStatus: (id, status) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        }));
        push(() => remote.setStatus(id, status));
        if (status === "Withdrawn") {
          const a = get().applications.find((x) => x.id === id);
          get().notify(
            "Application withdrawn",
            "A creator withdrew their application.",
            a ? `/a/campaigns/${a.campaignId}/applicants` : "/a/campaigns",
            "Brand-Agency",
          );
        } else
          get().notify(
            `Application ${status.toLowerCase()}`,
            "Your application pipeline has been updated.",
            "/c/applications",
            "Creator",
          );
      },
      post: (c) => {
        set((s) => ({
          campaigns: [c, ...s.campaigns.filter((x) => x.id !== c.id)],
        }));
        push(() => remote.saveCampaign(c));
      },
      campaignStatus: (id, status) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, status } : c,
          ),
        }));
        push(() => remote.campaignStatus(id, status));
      },
      send: (id, message) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, messages: [...c.messages, message] } : c,
          ),
        }));
        push(() => remote.send(id, message));
      },
      updateMessage: (threadId, messageId, patch) => {
        if (patch.call) {
          const call = patch.call;
          push(() => remote.updateCall(threadId, messageId, call));
        }
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id !== threadId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...patch } : m,
                  ),
                },
          ),
        }));
      },
      startChat: (
        creatorId,
        posterId = get().me.posterId,
        campaignId = "ca-1",
      ) => {
        const existing = get().conversations.find(
          (c) => c.creatorId === creatorId && c.posterId === posterId,
        );
        if (existing) return existing.id;
        const id = crypto.randomUUID();
        set((s) => ({
          conversations: [
            { id, creatorId, posterId, campaignId, messages: [] },
            ...s.conversations,
          ],
        }));
        push(() => remote.startChat({ id, creatorId, posterId, campaignId }));
        return id;
      },
      markRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            seesNotice(n, s.role) ? { ...n, read: true } : n,
          ),
        }));
        push(() => remote.markRead());
      },
      updateProfile: (p) => {
        set({ profile: { ...get().profile, ...p } });
        push(() => remote.updateProfile(p));
      },
      setPlan: (plan) => {
        set({ plan });
        push(() => remote.setPlan(plan));
      },
      // With a backend, the server creates notifications (and pushes them).
      notify: (title, body, href, audience) => {
        if (backendEnabled) return;
        set((s) => ({
          notifications: [
            {
              id: crypto.randomUUID(),
              title,
              body,
              href,
              read: false,
              audience,
            },
            ...s.notifications,
          ],
        }));
      },
    }),
    backendEnabled
      ? {
          // Server data isn't kept in localStorage (shared devices, privacy).
          name: "collabkaro-api-v1",
          partialize: () => ({}),
        }
      : {
          name: "collabkaro-demo-v1",
          // Session fields are runtime-only.
          partialize: ({ session, catalogVersion, ...rest }) => {
            void session;
            void catalogVersion;
            return rest;
          },
        },
  ),
);
