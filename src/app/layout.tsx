import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  display: "swap",
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "اپلیکیشن نکست",
  description: "ساخته‌شده با نکست‌جی‌اس",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
