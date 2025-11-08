import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vouch - Blockchain Resume Verification",
  description: "Verify work experience with blockchain credentials",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

