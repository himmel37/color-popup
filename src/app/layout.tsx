import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "COLOR POPUP — NCT WISH",
  description: "NCT WISH 2nd Mini Album COLOR 웹 팝업 스토어",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${playfair.variable} ${dmSans.variable} h-full`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
