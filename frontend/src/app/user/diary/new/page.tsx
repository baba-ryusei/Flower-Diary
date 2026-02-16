"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createDiary } from "@/lib/api/diaries";

export default function NewDiaryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // TODO: 実際のユーザーIDを使用する（認証実装後）
      const userId = 1;

      console.log("Submitting diary:", { userId, content, mood });

      const result = await createDiary({
        user_id: userId,
        content,
        mood: mood || undefined,
      });

      console.log("Diary created successfully:", result);

      // 画像が生成された場合は表示
      if (result.flower_image) {
        setGeneratedImage(result.flower_image.image_url);
      }

      // 成功メッセージを表示後、一覧ページへ
      setTimeout(() => {
        router.push("/user/diary");
      }, 3000);
    } catch (err) {
      console.error("Form submission error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "日記の作成に失敗しました";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            新しい日記を書く
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {generatedImage ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block p-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-lg">
                  <Image
                    src={generatedImage}
                    alt="生成された花の画像"
                    width={512}
                    height={512}
                    className="w-full max-w-md rounded-lg shadow-lg"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-lg font-semibold text-gray-900">
                    日記を保存しました！
                  </p>
                </div>
                <p className="text-gray-600">
                  あなたの気持ちから、素敵な花が咲きました。
                </p>
                <p className="text-sm text-gray-500">
                  3秒後に一覧ページへ移動します...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="mood"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  今日の気分 (オプション)
                </label>
                <select
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">選択してください</option>
                  <option value="happy">嬉しい 😊</option>
                  <option value="sad">悲しい 😢</option>
                  <option value="excited">ワクワク ✨</option>
                  <option value="calm">穏やか 😌</option>
                  <option value="anxious">不安 😰</option>
                  <option value="grateful">感謝 🙏</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  日記の内容
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="今日あった出来事や、感じたことを自由に書いてください..."
                  required
                  disabled={isLoading}
                />
                <p className="mt-2 text-sm text-gray-500">
                  あなたの日記から、AIが素敵な花の画像を生成します 🌸
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || !content.trim()}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      保存中...
                    </span>
                  ) : (
                    "日記を保存して画像を生成"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/user/diary")}
                  disabled={isLoading}
                  className="px-6 py-3 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
