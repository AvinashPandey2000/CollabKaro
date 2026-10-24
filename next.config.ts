import type { NextConfig } from "next";

// Images uploaded to the CollabKaro API are served from its /uploads path.
const api = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL)
  : null;

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      ...(api
        ? [
            {
              protocol: api.protocol.replace(":", "") as "http" | "https",
              hostname: api.hostname,
              port: api.port,
              pathname: "/uploads/**",
            },
          ]
        : []),
    ],
    // next/image refuses to optimise images from private IPs/localhost.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};
export default config;
