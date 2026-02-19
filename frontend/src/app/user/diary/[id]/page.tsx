"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getDiary, type DiaryWithImage } from "@/lib/api/diaries";

export default function DiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);

  const [diary, setDiary] = useState<DiaryWithImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const data = await getDiary(diaryId);
        setDiary(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "日記の読み込みに失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (diaryId) {
      fetchDiary();
    }
  }, [diaryId]);

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

  if (error || !diary) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="glass-card p-8 text-center">
          <span className="text-5xl block mb-4">😿</span>
          <p className="text-[#8b7355] mb-6">
            {error || "日記が見つかりません"}
          </p>
          <button
            onClick={() => router.push("/user/diary")}
            className="btn-flower px-6 py-3 text-sm"
          >
            📖 一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    return mood ? moodMap[mood] || "🌸" : "🌸";
  };

  const getMoodLabel = (mood?: string) => {
    const labelMap: Record<string, string> = {
      happy: "嬉しい",
      sad: "悲しい",
      excited: "ワクワク",
      calm: "穏やか",
      anxious: "不安",
      grateful: "感謝",
    };
    return mood ? labelMap[mood] || mood : "";
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in-up">
      {/* 戻るボタン */}
      <button
        onClick={() => router.push("/user/diary")}
        className="flex items-center gap-1 text-[#b09a7d] hover:text-[#8b7355] transition-colors mb-6 text-sm font-medium"
      >
        <span>←</span>
        <span>一覧に戻る</span>
      </button>

      <div className="glass-card overflow-hidden">
        {/* 花の画像 */}
        {diary.flower_image && (
          <div className="p-6 pb-4 bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-blue-50/80">
            <div className="max-w-md mx-auto">
              <div className="p-2 rounded-3xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 shadow-lg">
                <Image
                  src={diary.flower_image.image_url}
                  alt="日記から生成された花"
                  width={800}
                  height={800}
                  className="w-full rounded-2xl"
                />
              </div>
              {diary.flower_image.prompt && (
                <p className="mt-3 text-xs text-[#c9b99a] text-center italic leading-relaxed">
                  &ldquo;{diary.flower_image.prompt}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* 日記内容 */}
        <div className="p-6 pt-5">
          {/* 日付・気分 */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{getMoodEmoji(diary.mood)}</span>
            <div>
              <time className="text-sm text-[#b09a7d] block">
                {formatDate(diary.created_at)}
              </time>
              {diary.mood && (
                <span className="inline-block px-3 py-0.5 mt-1 bg-gradient-to-r from-pink-100 to-purple-100 text-[#8b7355] rounded-full text-xs font-medium">
                  {getMoodLabel(diary.mood)}
                </span>
              )}
            </div>
          </div>

          {/* 区切り線 */}
          <div className="border-t border-pink-100 mb-5"></div>

          {/* 本文 */}
          <div className="whitespace-pre-wrap text-[#4a3728] leading-loose text-[15px]">
            {diary.content}
          </div>
        </div>
      </div>
    </div>
  );
}
