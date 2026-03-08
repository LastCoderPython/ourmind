import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { BiofeedbackProvider } from "@/components/BiofeedbackProvider";
import { UserProvider } from "@/components/UserContext";
import { AppShell } from "@/components/AppShell";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "OurMind — Anonymous Student Resilience",
  description:
    "A safe, anonymous space for students to build emotional resilience through CBT-based conversations, mood tracking, coping strategies, and peer support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <UserProvider>
          <BiofeedbackProvider>
            <AppShell>{children}</AppShell>
          </BiofeedbackProvider>
        </UserProvider>
      </body>
    </html>
  );
}
