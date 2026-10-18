"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applications, conversations, notifications } from "@/data";
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
interface Store {
  role: Role;
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
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      role: "Guest",
      saved: [],
      shortlist: [],
      applications,
      campaigns: [],
      conversations,
      notifications,
      profile: {},
      plan: "Free",
      deals: [],
      portfolio: [],
      pastCollabs: [],
      addPortfolio: (item) =>
        set((s) => ({ portfolio: [item, ...s.portfolio] })),
      removePortfolio: (id) =>
        set((s) => ({ portfolio: s.portfolio.filter((x) => x.id !== id) })),
      addPastCollab: (collab) =>
        set((s) => ({ pastCollabs: [collab, ...s.pastCollabs] })),
      removePastCollab: (index) =>
        set((s) => ({
          pastCollabs: s.pastCollabs.filter((_, i) => i !== index),
        })),
      saveDeal: (deal) => {
        const isNew = !get().deals.some((d) => d.id === deal.id);
        set((s) => ({
          deals: [deal, ...s.deals.filter((d) => d.id !== deal.id)],
        }));
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
      setRole: (role) => set({ role }),
      toggleSave: (id) =>
        set((s) => ({
          saved: s.saved.includes(id)
            ? s.saved.filter((x) => x !== id)
            : [...s.saved, id],
        })),
      toggleShortlist: (id) =>
        set((s) => ({
          shortlist: s.shortlist.includes(id)
            ? s.shortlist.filter((x) => x !== id)
            : [...s.shortlist, id],
        })),
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
      post: (c) =>
        set((s) => ({
          campaigns: [c, ...s.campaigns.filter((x) => x.id !== c.id)],
        })),
      campaignStatus: (id, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, status } : c,
          ),
        })),
      send: (id, message) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, messages: [...c.messages, message] } : c,
          ),
        })),
      updateMessage: (threadId, messageId, patch) =>
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
        })),
      startChat: (creatorId, posterId = "po-1", campaignId = "ca-1") => {
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
        return id;
      },
      markRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            seesNotice(n, s.role) ? { ...n, read: true } : n,
          ),
        })),
      updateProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      setPlan: (plan) => set({ plan }),
      notify: (title, body, href, audience) =>
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
        })),
    }),
    { name: "collabkaro-demo-v1" },
  ),
);
