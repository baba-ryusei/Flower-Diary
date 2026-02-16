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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-purple-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !diary) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">
              {error || "日記が見つかりません"}
            </p>
            <button
              onClick={() => router.push("/user/diary")}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              一覧に戻る
            </button>
          </div>
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
    return mood ? moodMap[mood] || "📝" : "📝";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4">
          <button
            onClick={() => router.push("/user/diary")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            一覧に戻る
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 花の画像 */}
          {diary.flower_image && (
            <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-8">
              <div className="max-w-2xl mx-auto">
                <Image
                  src={diary.flower_image.image_url}
                  alt="日記から生成された花"
                  width={800}
                  height={800}
                  className="w-full rounded-lg shadow-xl"
                />
                <p className="mt-4 text-sm text-gray-600 text-center italic">
                  &ldquo;{diary.flower_image.prompt}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* 日記内容 */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getMoodEmoji(diary.mood)}</span>
                  <time className="text-gray-500">
                    {formatDate(diary.created_at)}
                  </time>
                </div>
                {diary.mood && (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {diary.mood}
                  </span>
                )}
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {diary.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
