import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindForge Premium",
  description: "The Intelligence Strategy Lab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
