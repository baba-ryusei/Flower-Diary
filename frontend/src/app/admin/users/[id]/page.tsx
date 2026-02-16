"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserDiaries, type AdminDiary } from "@/lib/api/admin";

export default function UserDetailPage() {
  const params = useParams();
  const userId = Number(params.id);

  const [diaries, setDiaries] = useState<AdminDiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const data = await getUserDiaries(userId);
        setDiaries(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "日記の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDiaries();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
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

  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-gray-600 mx-auto mb-4"
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

  if (error) {
    return (
      <div>
        <Link
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← ユーザー一覧に戻る
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
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
          ユーザー一覧に戻る
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ユーザー #{userId} の日記
        </h1>
        <div className="text-sm text-gray-600">
          総日記数: <span className="font-semibold">{diaries.length}</span>
        </div>
      </div>

      {diaries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-600">まだ日記が投稿されていません</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {diaries.map((diary) => (
            <div
              key={diary.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="flex">
                {/* 画像エリア */}
                {diary.flower_image && (
                  <div className="w-48 bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0">
                    <Image
                      src={diary.flower_image.image_url}
                      alt="花の画像"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* コンテンツエリア */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getMoodEmoji(diary.mood)}
                      </span>
                      <div>
                        <div className="text-sm text-gray-500">
                          日記ID: {diary.id}
                        </div>
                        <time className="text-sm text-gray-500">
                          {formatDate(diary.created_at)}
                        </time>
                      </div>
                    </div>
                    {diary.mood && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {diary.mood}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">
                    {truncateContent(diary.content)}
                  </p>

                  {diary.flower_image && (
                    <p className="text-xs text-gray-500 italic mb-2">
                      プロンプト: {diary.flower_image.prompt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className={`flex items-center gap-1 ${diary.flower_image ? "text-green-600" : "text-gray-400"}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {diary.flower_image ? "画像あり" : "画像なし"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
