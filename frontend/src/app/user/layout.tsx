import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flower Diary",
  description: "友達関係を記録する日記アプリ",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* ユーザー側共通ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Flower Diary</h1>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
