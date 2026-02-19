import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "🌸 Flower Diary",
  description: "あなたの気持ちを花に変える日記アプリ",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-floral">
      {/* ヘッダー */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/user" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:animate-float">🌸</span>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Flower Diary
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/user/diary"
              className="px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
            >
              📖 日記一覧
            </Link>
            <Link
              href="/user/diary/new"
              className="btn-flower px-5 py-2 text-sm"
            >
              ✏️ 書く
            </Link>
          </nav>
        </div>
      </header>
      <main className="pb-12">{children}</main>
    </div>
  );
}
