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
  setRole: (role: Role) => void;
  toggleSave: (id: string) => void;
  toggleShortlist: (id: string) => void;
  apply: (a: Application) => boolean;
  setStatus: (id: string, status: Status) => void;
  post: (c: Campaign) => void;
  campaignStatus: (id: string, status: Campaign["status"]) => void;
  send: (id: string, message: Message) => void;
  startChat: (
    creatorId: string,
    posterId?: string,
    campaignId?: string,
  ) => string;
  markRead: () => void;
  updateProfile: (p: Record<string, string>) => void;
  setPlan: (p: string) => void;
  notify: (title: string, body: string, href: string) => void;
}
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
        );
        return true;
      },
      setStatus: (id, status) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        }));
        get().notify(
          `Application ${status.toLowerCase()}`,
          "Your application pipeline has been updated.",
          "/c/applications",
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
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      updateProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      setPlan: (plan) => set({ plan }),
      notify: (title, body, href) =>
        set((s) => ({
          notifications: [
            { id: crypto.randomUUID(), title, body, href, read: false },
            ...s.notifications,
          ],
        })),
    }),
    { name: "collabkaro-demo-v1" },
  ),
);
