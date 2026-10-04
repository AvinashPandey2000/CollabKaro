import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
import "./globals.css";
const heading = localFont({
  src: "../public/fonts/bricolage.woff2",
  variable: "--font-heading",
  weight: "200 800",
  display: "swap",
});
const body = localFont({
  src: "../public/fonts/inter.woff2",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});
const hindi = localFont({
  src: "../public/fonts/mukta.woff2",
  variable: "--font-hindi",
  weight: "400",
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0900-097F,U+A8E0-A8FF" }],
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://collabkaro.example"),
  title: {
    default: "CollabKaro | Where India’s creators and brands collab.",
    template: "%s | CollabKaro",
  },
  description:
    "Find paid, barter, and affiliate campaigns. Discover Indian creators, connect with verified brands, and make your next collab happen.",
  openGraph: {
    title: "CollabKaro",
    description: "Creators aur brands, ek jagah. Collab karo, grow karo.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${heading.variable} ${body.variable} ${hindi.variable}`}
      >
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <Providers>
          <Shell>
            <div id="content">{children}</div>
          </Shell>
        </Providers>
      </body>
    </html>
  );
}
