"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDiaries, type Diary } from "@/lib/api/diaries";

export default function DiaryListPage() {
  const router = useRouter();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const data = await getDiaries();
        setDiaries(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "日記の読み込みに失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaries();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMoodEmoji = (mood?: string) => {
    const moodMap: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      excited: "✨",
      calm: "😌",
      anxious: "😰",
      grateful: "🙏",
    };
    return mood ? moodMap[mood] || "📝" : "🌸";
  };

  const getMoodColor = (mood?: string) => {
    const colorMap: Record<string, string> = {
      happy: "from-yellow-100 to-orange-100 border-yellow-200",
      sad: "from-blue-100 to-indigo-100 border-blue-200",
      excited: "from-pink-100 to-rose-100 border-pink-200",
      calm: "from-green-100 to-emerald-100 border-green-200",
      anxious: "from-purple-100 to-violet-100 border-purple-200",
      grateful: "from-amber-100 to-yellow-100 border-amber-200",
    };
    return mood
      ? colorMap[mood] || "from-pink-50 to-purple-50 border-pink-200"
      : "from-pink-50 to-purple-50 border-pink-200";
  };

  const truncateContent = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl inline-block animate-float">🌸</span>
          <p className="mt-4 text-[#b09a7d] font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#4a3728]">📖 あなたの日記</h1>
          <p className="text-sm text-[#b09a7d] mt-1">
            {diaries.length > 0
              ? `${diaries.length}件のお花が咲いています`
              : "まだお花がありません"}
          </p>
        </div>
        <button
          onClick={() => router.push("/user/diary/new")}
          className="btn-flower px-6 py-3 text-sm flex items-center gap-2"
        >
          <span>✏️</span>
          <span>新しい日記</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 glass-card p-4 border-red-200 bg-red-50/70">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}

      {diaries.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in-up">
          <span className="text-7xl inline-block animate-float mb-6">🌱</span>
          <h2 className="text-xl font-bold text-[#4a3728] mb-2">
            まだ日記がありません
          </h2>
          <p className="text-[#b09a7d] mb-8 text-sm leading-relaxed">
            最初の日記を書いて、
            <br />
            あなただけのお花を咲かせましょう！
          </p>
          <button
            onClick={() => router.push("/user/diary/new")}
            className="btn-flower px-8 py-3 text-sm"
          >
            🌸 はじめての日記を書く
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {diaries.map((diary, index) => (
            <div
              key={diary.id}
              onClick={() => router.push(`/user/diary/${diary.id}`)}
              className={`glass-card p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-fade-in-up border bg-gradient-to-r ${getMoodColor(diary.mood)}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                {/* 絵文字アイコン */}
                <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  {getMoodEmoji(diary.mood)}
                </div>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <time className="text-xs text-[#b09a7d] font-medium">
                      {formatDate(diary.created_at)}
                    </time>
                    {diary.mood && (
                      <span className="px-2 py-0.5 bg-white/60 text-[#8b7355] rounded-full text-xs font-medium">
                        {diary.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-[#4a3728] text-sm leading-relaxed">
                    {truncateContent(diary.content)}
                  </p>
                </div>

                {/* 矢印 */}
                <span className="text-pink-300 text-lg flex-shrink-0">›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
