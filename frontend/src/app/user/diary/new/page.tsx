"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createDiary } from "@/lib/api/diaries";

const MOODS = [
  {
    value: "happy",
    emoji: "😊",
    label: "嬉しい",
    color: "from-yellow-100 to-orange-100 border-yellow-300",
  },
  {
    value: "sad",
    emoji: "😢",
    label: "悲しい",
    color: "from-blue-100 to-indigo-100 border-blue-300",
  },
  {
    value: "excited",
    emoji: "✨",
    label: "ワクワク",
    color: "from-pink-100 to-rose-100 border-pink-300",
  },
  {
    value: "calm",
    emoji: "😌",
    label: "穏やか",
    color: "from-green-100 to-emerald-100 border-green-300",
  },
  {
    value: "anxious",
    emoji: "😰",
    label: "不安",
    color: "from-purple-100 to-violet-100 border-purple-300",
  },
  {
    value: "grateful",
    emoji: "🙏",
    label: "感謝",
    color: "from-amber-100 to-yellow-100 border-amber-300",
  },
];

export default function NewDiaryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tension, setTension] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // テンション値の変更ハンドラー（バリデーション付き）
  const handleTensionChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setTension(1);
    } else if (numValue < 1) {
      setTension(1);
    } else if (numValue > 100) {
      setTension(100);
    } else {
      setTension(numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userId = 1;

      const result = await createDiary({
        user_id: userId,
        content,
        mood: mood || undefined,
        tension: tension,
      });

      if (result.flower_image) {
        setGeneratedImage(result.flower_image.image_url);
      }

      setTimeout(() => {
        router.push("/user/diary");
      }, 4000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "日記の作成に失敗しました";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass-card p-8 animate-fade-in-up">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-200">
            <p className="text-red-500 text-sm">⚠️ {error}</p>
          </div>
        )}

        {generatedImage ? (
          /* 生成完了画面 */
          <div className="text-center animate-fade-in-up">
            <div className="mb-2">
              <span className="text-4xl animate-sparkle inline-block">✨</span>
            </div>
            <h2 className="text-xl font-bold text-[#4a3728] mb-6">
              お花が咲きました！
            </h2>
            <div className="mb-6 inline-block p-2 rounded-3xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 shadow-lg">
              <Image
                src={generatedImage}
                alt="生成された花の画像"
                width={512}
                height={512}
                className="w-full max-w-sm rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <span>🌸</span>
                <p className="font-bold text-[#4a3728]">日記を保存しました！</p>
              </div>
              <p className="text-sm text-[#b09a7d]">
                あなたの気持ちから、素敵なお花が咲きました
              </p>
              <p className="text-xs text-[#c9b99a] mt-4">
                まもなく一覧ページへ移動します...
              </p>
            </div>
          </div>
        ) : (
          /* 入力フォーム */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* タイトル */}
            <div className="text-center mb-2">
              <span className="text-4xl inline-block mb-2">✏️</span>
              <h1 className="text-2xl font-bold text-[#4a3728]">
                今日のきもち
              </h1>
              <p className="text-sm text-[#b09a7d] mt-1">
                あなたの日記からお花が咲きます
              </p>
            </div>

            {/* mood選択 - カード型 */}
            <div>
              <label className="block text-sm font-bold text-[#8b7355] mb-3">
                🎨 今日の気分は？
              </label>
              <div className="grid grid-cols-3 gap-3">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(mood === m.value ? "" : m.value)}
                    disabled={isLoading}
                    className={`p-3 rounded-2xl border-2 transition-all duration-200 text-center
                      ${
                        mood === m.value
                          ? `bg-gradient-to-br ${m.color} scale-105 shadow-md`
                          : "bg-white/50 border-gray-100 hover:border-pink-200 hover:bg-pink-50/30"
                      }`}
                  >
                    <span className="text-2xl block mb-1">{m.emoji}</span>
                    <span className="text-xs font-medium text-[#8b7355]">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* テンション入力 */}
            <div>
              <label className="block text-sm font-bold text-[#8b7355] mb-3">
                💪 今日のテンション感は？
              </label>

              {/* スライダーと数値入力を横並び */}
              <div className="flex items-center gap-4 mb-3">
                {/* スライダー */}
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={tension}
                  onChange={(e) => setTension(Number(e.target.value))}
                  disabled={isLoading}
                  className="flex-1 h-3 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #bfdbfe 0%, #bbf7d0 ${tension}%, #fef08a 100%)`,
                  }}
                />

                {/* 数値入力ボックス */}
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tension}
                  onChange={(e) => handleTensionChange(e.target.value)}
                  disabled={isLoading}
                  className="w-20 px-3 py-2 text-center rounded-xl border-2 border-pink-100 bg-white/80 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:outline-none text-[#4a3728] font-bold text-lg transition-all"
                />
              </div>

              {/* 目盛り */}
              <div className="flex justify-between text-xs text-[#b09a7d] mb-3">
                <span>低い (1)</span>
                <span>普通 (50)</span>
                <span>高い (100)</span>
              </div>

              {/* ビジュアルインジケーター */}
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl">
                <div className="text-5xl mb-2">
                  {tension < 20 && "😔"}
                  {tension >= 20 && tension < 40 && "😕"}
                  {tension >= 40 && tension < 60 && "😐"}
                  {tension >= 60 && tension < 80 && "🙂"}
                  {tension >= 80 && tension < 95 && "😊"}
                  {tension >= 95 && "🤩"}
                </div>
                <p className="text-sm font-bold text-[#4a3728]">
                  テンション: {tension}/100
                </p>
                <p className="text-xs text-[#b09a7d] mt-1">
                  {tension < 40 && "少し落ち着いた気分ですね"}
                  {tension >= 40 && tension < 70 && "いつも通りの気分ですね"}
                  {tension >= 70 && "元気な気分ですね！"}
                </p>
              </div>
            </div>

            {/* 日記本文 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-bold text-[#8b7355] mb-3"
              >
                📝 日記を書こう
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-5 py-4 rounded-2xl border-2 border-pink-100 bg-white/80 focus:border-pink-300 focus:ring-4 focus:ring-pink-100 focus:outline-none resize-none text-[#4a3728] placeholder:text-[#c9b99a] transition-all leading-relaxed"
                placeholder="今日あったこと、感じたことを自由に書いてね..."
                required
                disabled={isLoading}
              />
              <p className="mt-2 text-xs text-[#c9b99a] text-right">
                🌸 日記の内容からAIがお花を選びます
              </p>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="flex-1 btn-flower py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-float inline-block">🌸</span>
                    お花を咲かせています...
                  </span>
                ) : (
                  "🌷 保存してお花を咲かせる"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/user/diary")}
                disabled={isLoading}
                className="px-6 py-4 rounded-full border-2 border-gray-200 text-[#b09a7d] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                戻る
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
