import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import EntryAnimation from "@/components/EntryAnimation";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QUANTIX — Enterprise Quantum Circuit Generation Platform",
  description: "Enterprise Quantum Circuit Generation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-dvh m-0 font-sans antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <EntryAnimation />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
