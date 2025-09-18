import type { Metadata } from "next";
import { Noto_Sans_Telugu } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";


const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Learn Telugu Easily",
  description: "Learn Telugu easily by playing like a game",
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={notoTelugu.className}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
