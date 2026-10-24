"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { backendEnabled } from "@/lib/backend";
import { useStore } from "@/lib/store";
import { Home } from "./home";
const Campaigns = dynamic(() =>
  import("./marketplace").then((m) => m.Campaigns),
);
const CampaignDetail = dynamic(() =>
  import("./marketplace").then((m) => m.CampaignDetail),
);
const Discover = dynamic(() => import("./marketplace").then((m) => m.Discover));
const PosterProfile = dynamic(() =>
  import("./marketplace").then((m) => m.PosterProfile),
);
const Empty = dynamic(() => import("./marketplace").then((m) => m.Empty));
const CreatorProfile = dynamic(() =>
  import("./profile").then((m) => m.CreatorProfile),
);
const Dashboard = dynamic(() => import("./workspace").then((m) => m.Dashboard));
const Applications = dynamic(() =>
  import("./workspace").then((m) => m.Applications),
);
const MyCampaigns = dynamic(() =>
  import("./workspace").then((m) => m.MyCampaigns),
);
const Pipeline = dynamic(() => import("./workspace").then((m) => m.Pipeline));
const Shortlists = dynamic(() =>
  import("./workspace").then((m) => m.Shortlists),
);
const Work = dynamic(() => import("./workspace").then((m) => m.Work));
const Payments = dynamic(() => import("./deals").then((m) => m.Payments));
const Auth = dynamic(() => import("./forms").then((m) => m.Auth));
const BackendAuth = dynamic(() =>
  import("./backend-auth").then((m) => m.BackendAuth),
);
const Onboarding = dynamic(() => import("./forms").then((m) => m.Onboarding));
const CreateCampaign = dynamic(() =>
  import("./forms").then((m) => m.CreateCampaign),
);
const EditProfile = dynamic(() => import("./forms").then((m) => m.EditProfile));
const Messages = dynamic(() => import("./shared").then((m) => m.Messages));
const Notifications = dynamic(() =>
  import("./shared").then((m) => m.Notifications),
);
const Settings = dynamic(() => import("./shared").then((m) => m.Settings));
const Admin = dynamic(() => import("./shared").then((m) => m.Admin));
const SideLanding = dynamic(() =>
  import("./marketing").then((m) => m.SideLanding),
);
const Pricing = dynamic(() => import("./marketing").then((m) => m.Pricing));
const Contact = dynamic(() => import("./marketing").then((m) => m.Contact));
const Tools = dynamic(() => import("./marketing").then((m) => m.Tools));
const StaticPage = dynamic(() =>
  import("./marketing").then((m) => m.StaticPage),
);
const Blog = dynamic(() => import("./marketing").then((m) => m.Blog));
export function PageRouter({ path }: { path: string[] }) {
  // Backend mode: wait for the live catalogue (server and first client render
  // both show the skeleton, so hydration matches), and re-render on reloads.
  const catalogVersion = useStore((s) => s.catalogVersion);
  const waiting = backendEnabled && catalogVersion === 0;
  const [root, sub, id, last] = path;
  const route = path.join("/");
  let page: React.ReactNode;
  if (!root) page = <Home />;
  else if (root === "campaigns")
    page = sub ? <CampaignDetail slug={sub} /> : <Campaigns />;
  else if (root === "creator") page = <CreatorProfile username={sub} />;
  else if (root === "agency") page = <PosterProfile slug={sub} />;
  else if (["creators", "brands", "agencies"].includes(root))
    page = <SideLanding brand={root !== "creators"} />;
  else if (root === "pricing") page = <Pricing />;
  else if (root === "contact") page = <Contact />;
  else if (["about", "privacy", "terms"].includes(root))
    page = <StaticPage kind={root} />;
  else if (root === "blog") page = <Blog article={!!sub} />;
  else if (root === "tools") page = <Tools kind={sub} />;
  else if (
    ["login", "signup", "otp", "role-select", "forgot-password"].includes(root)
  )
    page = backendEnabled ? <BackendAuth kind={root} /> : <Auth kind={root} />;
  else if (root === "onboarding" || route === "a/onboarding")
    page = <Onboarding brand={root === "a"} />;
  else if (root === "messages") page = <Messages />;
  else if (root === "notifications") page = <Notifications />;
  else if (root === "settings") page = <Settings />;
  else if (root === "admin") page = <Admin />;
  else if (root === "c") {
    if (sub === "dashboard") page = <Dashboard />;
    else if (sub === "applications") page = <Applications />;
    else if (sub === "saved") page = <Campaigns savedOnly />;
    else if (sub === "work") page = <Work id={id} />;
    else if (sub === "profile") page = <EditProfile />;
  } else if (root === "a") {
    if (sub === "dashboard") page = <Dashboard brand />;
    else if (sub === "discover") page = <Discover />;
    else if (sub === "campaigns" && id === "new") page = <CreateCampaign />;
    else if (sub === "campaigns" && last === "applicants")
      page = <Pipeline id={id} />;
    else if (sub === "campaigns") page = <MyCampaigns />;
    else if (sub === "lists") page = <Shortlists />;
    else if (sub === "payments") page = <Payments />;
    else if (sub === "settings") page = <Settings brand />;
  }
  return (
    <Suspense
      fallback={
        <div className="container page-wrap">
          <div className="skeleton-card" />
        </div>
      }
    >
      {waiting ? (
        <div className="container page-wrap">
          <div className="skeleton-card" />
        </div>
      ) : (
        page || (
          <Empty
            title="This page took a creative detour."
            text="Let’s get you back to your next opportunity."
            href="/"
            label="Back to home"
          />
        )
      )}
    </Suspense>
  );
}
