import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import { Preloader } from "@/components/Preloader";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Imago Dei Conf 2026",
  description: "Регистрация на Imago Dei Conf 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${unbounded.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <Preloader>{children}</Preloader>
      </body>
    </html>
  );
}
