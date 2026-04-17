import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://taskdrip.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TaskDrip — Set it, forget it, get it done",
    template: "%s | TaskDrip",
  },
  description:
    "The AI-powered to-do list where items actually get done. Describe your task in plain English, let AI do the work, and review the result. Free to start.",
  keywords: [
    "AI task manager",
    "AI to-do list",
    "task delegation",
    "AI assistant",
    "automate tasks",
    "productivity tool",
    "AI agent",
    "get things done",
  ],
  authors: [{ name: "Donmeusi Inc." }],
  creator: "Donmeusi Inc.",
  openGraph: {
    title: "TaskDrip — Set it, forget it, get it done",
    description:
      "Your to-do list never worked because you're the only one doing the work. TaskDrip gives every task to AI — you just review the result.",
    type: "website",
    url: siteUrl,
    siteName: "TaskDrip",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskDrip — Set it, forget it, get it done",
    description:
      "Your to-do list never worked because you're the only one doing the work. TaskDrip gives every task to AI — you just review the result.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "TaskDrip",
              applicationCategory: "Productivity",
              operatingSystem: "Web",
              description:
                "AI-powered task delegation app. Describe your task, let AI do the work, review the result.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free tier available",
              },
              creator: {
                "@type": "Organization",
                name: "Donmeusi Inc.",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}