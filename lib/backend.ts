// Client for the CollabKaro API (../socialMediaNaukriBackend).
//
// Backend mode is on when NEXT_PUBLIC_API_URL is set (see .env.local.example).
// Without it the app stays a local demo backed by data/ and localStorage.
//
// The access token lives only in memory; the refresh token is an httpOnly
// cookie the API sets, so a page reload calls `restoreSession()`.
import type {
  Application,
  Campaign,
  ContentItem,
  Conversation,
  Creator,
  Deal,
  Message,
  Notice,
  PastCollab,
  Poster,
  Role,
} from "@/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const backendEnabled = Boolean(API_URL);

export interface Me {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  role: Exclude<Role, "Guest"> | null;
  creatorId?: string;
  posterId?: string;
  plan: string;
  profile: Record<string, string>;
}

export interface RemoteState {
  me: Me;
  applications: Application[];
  campaigns: Campaign[];
  conversations: Conversation[];
  notifications: Notice[];
  deals: Deal[];
  saved: string[];
  shortlist: string[];
  profile: Record<string, string>;
  plan: string;
  portfolio: ContentItem[];
  pastCollabs: PastCollab[];
  creator?: Creator;
  poster?: Poster;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

let accessToken: string | null = null;
let refreshing: Promise<Me | null> | null = null;
// Remembers that this browser has logged in, so first-time visitors don't
// make a refresh call that can only fail. Not a secret; the cookie is the auth.
const HINT = "collabkaro-has-session";
const hint = (on?: boolean) => {
  try {
    if (on === undefined) return localStorage.getItem(HINT) === "1";
    if (on) localStorage.setItem(HINT, "1");
    else localStorage.removeItem(HINT);
  } catch {}
  return false;
};

export const hasSession = () => Boolean(accessToken);

async function raw(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  if (init.body && typeof init.body === "string")
    headers.set("content-type", "application/json");
  return fetch(`${API_URL}/v1${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (Array.isArray(data?.issues) && data.issues[0]?.message) ||
      (typeof data?.message === "string" ? data.message : null) ||
      "Something went wrong. Please try again.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}

/** Authenticated request; refreshes the access token once on 401. */
export async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const init: RequestInit = {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  let res = await raw(path, init);
  if (res.status === 401 && accessToken) {
    if (await restoreSession()) res = await raw(path, init);
  }
  return parse<T>(res);
}

/** Swap the refresh cookie for a fresh access token. Null when logged out. */
export function restoreSession(): Promise<Me | null> {
  if (!backendEnabled || (!accessToken && !hint()))
    return Promise.resolve(null);
  refreshing ??= (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      }).catch(() => null);
      if (res?.ok) {
        const data = (await res.json()) as { accessToken: string; user: Me };
        accessToken = data.accessToken;
        return data.user;
      }
      // Another tab may have just rotated the cookie; retry once.
      if (res?.status === 401 && attempt === 0)
        await new Promise((r) => setTimeout(r, 400));
      else break;
    }
    accessToken = null;
    hint(false);
    return null;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  sendOtp: (phone: string) =>
    raw("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }).then((r) => parse<{ expiresIn: number; resendIn: number }>(r)),
  async verifyOtp(input: {
    phone: string;
    code: string;
    name?: string;
    acceptTerms?: boolean;
  }) {
    const data = await parse<{
      accessToken: string;
      isNew: boolean;
      user: Me;
    }>(
      await raw("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    );
    accessToken = data.accessToken;
    hint(true);
    return data;
  },
  chooseRole: (input: {
    role: "Creator" | "Brand-Agency";
    name?: string;
    company?: string;
    posterType?: string;
    city?: string;
  }) => request<Me>("POST", "/me/role", input),
  async logout() {
    await raw("/auth/logout", { method: "POST" }).catch(() => null);
    accessToken = null;
    hint(false);
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

type Page<T> = { items: T[]; total: number };

export const remote = {
  catalog: async () => {
    const [campaigns, creators, posters] = await Promise.all([
      request<Page<Campaign>>("GET", "/campaigns?limit=500"),
      request<Page<Creator>>("GET", "/creators?limit=500"),
      request<Page<Poster>>("GET", "/posters?limit=500"),
    ]);
    return {
      campaigns: campaigns.items,
      creators: creators.items,
      posters: posters.items,
    };
  },
  state: () => request<RemoteState>("GET", "/me/state"),

  setSaved: (campaignId: string, on: boolean) =>
    request(on ? "PUT" : "DELETE", `/me/saved/${campaignId}`),
  setShortlisted: (creatorId: string, on: boolean) =>
    request(on ? "PUT" : "DELETE", `/me/shortlist/${creatorId}`),
  updateProfile: (patch: Record<string, string>) =>
    request("PATCH", "/me/profile", patch),
  setPlan: (plan: string) => request("PATCH", "/me/plan", { plan }),

  apply: (a: Application) =>
    request<Application>("POST", "/applications", {
      id: a.id,
      campaignId: a.campaignId,
      pitch: a.pitch,
      quote: a.quote,
      showcase: a.showcase,
    }),
  setStatus: (id: string, status: Application["status"]) =>
    request<Application>("PATCH", `/applications/${id}/status`, { status }),

  saveCampaign: (c: Campaign) =>
    request<Campaign>("PUT", `/campaigns/${c.id}`, c),
  campaignStatus: (id: string, status: Campaign["status"]) =>
    request<Campaign>("PATCH", `/campaigns/${id}/status`, { status }),

  startChat: (input: {
    id: string;
    creatorId: string;
    posterId: string;
    campaignId: string;
  }) => request<Conversation>("POST", "/conversations", input),
  send: (threadId: string, m: Message) =>
    request<Message>("POST", `/conversations/${threadId}/messages`, {
      id: m.id,
      body: m.body,
      attachment: m.attachment,
      voice: m.voice,
      call: m.call,
    }),
  updateCall: (threadId: string, messageId: string, call: Message["call"]) =>
    request<Message>(
      "PATCH",
      `/conversations/${threadId}/messages/${messageId}`,
      { call },
    ),
  markRead: () => request("POST", "/notifications/read"),

  saveDeal: (d: Deal) =>
    request<Deal>("PUT", `/deals/${d.id}`, {
      applicationId: d.applicationId,
      amount: d.amount,
      usageFees: d.usageFees,
      scheduleId: d.scheduleId,
      milestones: d.milestones.map(({ id, label, percent, amount }) => ({
        id,
        label,
        percent,
        amount,
      })),
    }),
  signDeal: (id: string, name: string) =>
    request<Deal>("POST", `/deals/${id}/sign`, { name }),
  recordPayment: (
    id: string,
    milestoneId: string,
    payment: { paidOn: string; reference?: string } | null,
  ) =>
    request<Deal>(
      payment ? "PUT" : "DELETE",
      `/deals/${id}/milestones/${milestoneId}/payment`,
      payment ?? undefined,
    ),

  addPortfolio: (item: ContentItem) =>
    request("POST", "/creator/portfolio", item),
  removePortfolio: (id: string) =>
    request("DELETE", `/creator/portfolio/${id}`),
  addPastCollab: (c: PastCollab) => request("POST", "/creator/past-collabs", c),
  removePastCollab: (index: number) =>
    request("DELETE", `/creator/past-collabs/${index}`),

  /** Upload a file (already resized for images) and get its hosted URL. */
  async upload(
    file: Blob,
    name: string,
    purpose:
      | "campaign-cover"
      | "brand-logo"
      | "avatar"
      | "cover"
      | "portfolio"
      | "voice",
  ) {
    const form = new FormData();
    form.append("file", file, name);
    form.append("purpose", purpose);
    const send = () => raw("/uploads", { method: "POST", body: form });
    let res = await send();
    if (res.status === 401 && (await restoreSession())) res = await send();
    return parse<{ url: string; bytes: number; mime: string }>(res);
  },
};

// ─── Realtime ─────────────────────────────────────────────────────────────────

/** Connect to the API's Socket.IO channel; returns a disconnect function. */
export async function connectRealtime(onChange: (event: string) => void) {
  if (!backendEnabled || !accessToken) return () => {};
  const { io } = await import("socket.io-client");
  const socket = io(API_URL!, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket"],
    auth: (cb) => cb({ token: accessToken }),
  });
  for (const event of [
    "sync",
    "notification:new",
    "message:new",
    "message:update",
  ])
    socket.on(event, () => onChange(event));
  socket.on("auth:error", async () => {
    if (await restoreSession()) socket.connect();
  });
  return () => {
    socket.disconnect();
  };
}
