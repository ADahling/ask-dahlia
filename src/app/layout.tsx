import type { Metadata } from "next";
import { Inter, Lato, Dancing_Script, Cinzel_Decorative } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { copy } from "@/lib/copy";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato"
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing"
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel"
});

export const metadata: Metadata = {
  title: `${copy.product} - ${copy.tagline}`,
  description: copy.home.h2,
  keywords: "legal AI, contract management, clause retrieval, RAG agent, legal tech",
  authors: [{ name: copy.company }],
  creator: copy.company,
  openGraph: {
    title: `${copy.product} - ${copy.tagline}`,
    description: copy.home.h2,
    type: "website",
    locale: "en_US",
    siteName: copy.product
  },
  twitter: {
    card: "summary_large_image",
    title: `${copy.product} - ${copy.tagline}`,
    description: copy.home.h2,
    creator: "@askdahlia"
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1
  },
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23000000"/><defs><linearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%23e879f9"/><stop offset="50%25" style="stop-color:%23c084fc"/><stop offset="100%25" style="stop-color:%23a78bfa"/></linearGradient></defs><text x="50%25" y="55%25" font-family="Dancing Script, cursive" font-size="28" font-weight="900" font-style="italic" fill="url(%23g)" text-anchor="middle" dominant-baseline="middle" stroke="url(%23g)" stroke-width="0.5">D</text></svg>',
        type: 'image/svg+xml',
      }
    ],
    shortcut: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23000000"/><defs><linearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%23e879f9"/><stop offset="50%25" style="stop-color:%23c084fc"/><stop offset="100%25" style="stop-color:%23a78bfa"/></linearGradient></defs><text x="50%25" y="55%25" font-family="Dancing Script, cursive" font-size="28" font-weight="900" font-style="italic" fill="url(%23g)" text-anchor="middle" dominant-baseline="middle" stroke="url(%23g)" stroke-width="0.5">D</text></svg>',
    apple: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23000000"/><defs><linearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%23e879f9"/><stop offset="50%25" style="stop-color:%23c084fc"/><stop offset="100%25" style="stop-color:%23a78bfa"/></linearGradient></defs><text x="50%25" y="55%25" font-family="Dancing Script, cursive" font-size="28" font-weight="900" font-style="italic" fill="url(%23g)" text-anchor="middle" dominant-baseline="middle" stroke="url(%23g)" stroke-width="0.5">D</text></svg>'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lato.variable} ${dancingScript.variable} ${cinzelDecorative.variable}`}>
      <body className="font-inter">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
