import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "管理画面 - Flower Diary",
  description: "Flower Diary管理画面",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 管理画面ヘッダー */}
      <header className="bg-gray-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">管理画面</h1>
          <nav className="flex gap-4">
            <Link href="/admin/dashboard" className="hover:text-gray-300">
              ダッシュボード
            </Link>
            <Link href="/admin/users" className="hover:text-gray-300">
              ユーザー管理
            </Link>
            <Link href="/admin/settings" className="hover:text-gray-300">
              設定
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
