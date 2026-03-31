import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Lease Demo",
  description: "Demo van een financial lease leadgeneratie platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
