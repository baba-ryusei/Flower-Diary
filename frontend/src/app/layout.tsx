import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🌸 Flower Diary",
  description: "あなたの気持ちを花に変える日記アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
