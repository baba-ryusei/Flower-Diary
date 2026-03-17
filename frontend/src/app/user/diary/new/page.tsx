"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createDiary, uploadPhoto } from "@/lib/api/diaries";
import { createEmotionLog, EMOTION_FACTORS } from "@/lib/api/emotions";

const FACTOR_KEYS = Object.keys(EMOTION_FACTORS);

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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tension, setTension] = useState(50);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [emotionAnalysis, setEmotionAnalysis] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const toggleFactor = (key: string) => {
    setSelectedFactors((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userId = 1;

      // 写真がある場合は先にアップロード
      let uploadedPhotoUrl: string | undefined;
      if (photoFile) {
        uploadedPhotoUrl = await uploadPhoto(photoFile);
      }

      const result = await createDiary({
        user_id: userId,
        title: title.trim() || undefined,
        content,
        mood: mood || undefined,
        tension: tension,
        photo_url: uploadedPhotoUrl,
      });

      // AIコメントはバックグラウンド生成のためここでは取得しない

      // 感情ログを保存（バックグラウンドで。失敗しても日記は保存済み）
      if (result.id) {
        try {
          const emotionResult = await createEmotionLog(
            result.id,
            tension,
            selectedFactors
          );
          if (emotionResult.analysis) {
            setEmotionAnalysis(emotionResult.analysis);
          }
        } catch {
          // 感情ログ失敗は無視
        }
      }

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

              {/* AI感情分析結果 */}
              {emotionAnalysis && (
                <div
                  className={`mt-4 p-4 rounded-2xl text-left text-sm leading-relaxed ${
                    tension <= 30
                      ? "bg-blue-50 border border-blue-200 text-blue-800"
                      : "bg-amber-50 border border-amber-200 text-amber-800"
                  }`}
                >
                  <p className="font-bold mb-1">
                    {tension <= 30
                      ? "💙 AIからのひとこと"
                      : "🌟 あなたのエネルギー源"}
                  </p>
                  <p>{emotionAnalysis}</p>
                </div>
              )}

              {/* AIコメントはバックグラウンド生成のため日記一覧から確認 */}
              <div className="mt-4 p-3 rounded-2xl text-left text-xs bg-green-50 border border-green-200 text-green-700">
                💬 AIコメントを生成中です。日記一覧から確認できます。
              </div>

              <p className="text-xs text-[#c9b99a] mt-4">
                まもなく一覧ページへ移動します...
              </p>
            </div>
          </div>
        ) : (
          /* 入力フォーム */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ページヘッダー */}
            <div className="text-center mb-2">
              <span className="text-4xl inline-block mb-2">✏️</span>
              <h1 className="text-2xl font-bold text-[#4a3728]">
                今日のきもち
              </h1>
              <p className="text-sm text-[#b09a7d] mt-1">
                あなたの日記からお花が和きます
              </p>
            </div>

            {/* 題名 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-bold text-[#8b7355] mb-3"
              >
                📝 題名（任意）
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                disabled={isLoading}
                className="w-full px-5 py-3 rounded-2xl border-2 border-pink-100 bg-white/80 focus:border-pink-300 focus:ring-4 focus:ring-pink-100 focus:outline-none text-[#4a3728] placeholder:text-[#c9b99a] transition-all"
                placeholder="今日の日記の題名（省略可）"
              />
              <p className="mt-1 text-xs text-[#c9b99a] text-right">
                {title.length} / 100
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
                  title="テンションをスライダーで調整"
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
                  title="テンション値を直接入力"
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
                  {tension <= 30 && "😔 少しストレスを感じていそうです"}
                  {tension > 30 && tension <= 69 && "😐 いつも通りの気分ですね"}
                  {tension >= 70 && "😊 元気な気分ですね！"}
                </p>
              </div>
            </div>

            {/* 感情の要因選択 */}
            <div>
              <label className="block text-sm font-bold text-[#8b7355] mb-1">
                {tension <= 30
                  ? "😔 ストレスの要因は何ですか？"
                  : tension >= 70
                    ? "🌟 元気の源は何ですか？"
                    : "💭 今日の気分に影響したものは？"}
              </label>
              <p className="text-xs text-[#b09a7d] mb-3">
                当てはまるものを選んでください（複数選択可）
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FACTOR_KEYS.map((key) => {
                  const isSelected = selectedFactors.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleFactor(key)}
                      disabled={isLoading}
                      className={`px-3 py-2.5 rounded-xl border-2 text-left text-xs font-medium transition-all duration-150 ${
                        isSelected
                          ? tension <= 30
                            ? "border-blue-400 bg-blue-50 text-blue-700"
                            : tension >= 70
                              ? "border-amber-400 bg-amber-50 text-amber-700"
                              : "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-gray-100 bg-white/50 text-[#8b7355] hover:border-pink-200"
                      }`}
                    >
                      {EMOTION_FACTORS[key]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 写真アップロード */}
            <div>
              <label className="block text-sm font-bold text-[#8b7355] mb-3">
                📷 今日の一枚（任意）
              </label>
              {photoPreview ? (
                <div className="relative inline-block">
                  <Image
                    src={photoPreview}
                    alt="添付写真プレビュー"
                    width={400}
                    height={300}
                    className="w-full max-h-60 object-cover rounded-2xl border-2 border-pink-200"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    disabled={isLoading}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/30 hover:bg-pink-50/60 cursor-pointer transition-colors">
                  <span className="text-2xl mb-1">📸</span>
                  <span className="text-sm text-[#b09a7d]">
                    タップして写真を選択
                  </span>
                  <span className="text-xs text-[#c9b99a] mt-1">
                    JPEG / PNG / WebP（最大10MB）
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              )}
              <p className="mt-2 text-xs text-[#c9b99a]">
                📸 写真があるとAIがより詳しくコメントします
              </p>
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
                    {photoFile ? "写真を送信中..." : "お花を咲かせています..."}
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
