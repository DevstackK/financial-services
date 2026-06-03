import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F&B Operations Dashboard",
  description: "Coffee shop agent operations dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
