"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getEmotionSummary,
  EMOTION_FACTORS,
  type EmotionSummary,
  type EmotionSummaryItem,
} from "@/lib/api/emotions";

// テンションレベルのスタイル定義
const LEVEL_STYLE = {
  low: {
    label: "低テンション",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
    bar: "bg-blue-400",
    emoji: "😔",
  },
  normal: {
    label: "普通",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    bar: "bg-green-400",
    emoji: "😐",
  },
  high: {
    label: "高テンション",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
    bar: "bg-amber-400",
    emoji: "😊",
  },
} as const;

// テンション値にもとづく棒グラフの色
function tensionBarColor(tension: number) {
  if (tension <= 30) return "bg-blue-400";
  if (tension <= 69) return "bg-green-400";
  return "bg-amber-400";
}

// ログカード1件
function LogCard({ log }: { log: EmotionSummaryItem }) {
  const style = LEVEL_STYLE[log.tension_level];
  return (
    <div
      className={`p-4 rounded-2xl border-2 ${style.bg} ${style.border} space-y-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{log.date}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
        >
          {style.emoji} {style.label}
        </span>
      </div>
      {/* テンションバー */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white/60 rounded-full h-2.5 overflow-hidden">
          <div
            className={`${tensionBarColor(log.tension)} h-2.5 rounded-full`}
            style={{ width: `${log.tension}%` }}
          />
        </div>
        <span className={`text-sm font-bold ${style.text}`}>
          {log.tension}/100
        </span>
      </div>
      {/* 要因タグ */}
      {log.factors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {log.factors.map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-0.5 rounded-full bg-white/70 text-gray-600 border border-gray-200"
            >
              {EMOTION_FACTORS[f] ?? f}
            </span>
          ))}
        </div>
      )}
      {/* AI分析テキスト */}
      {log.analysis && (
        <p
          className={`text-xs leading-relaxed ${style.text} bg-white/50 rounded-xl p-2`}
        >
          💬 {log.analysis}
        </p>
      )}
    </div>
  );
}

export default function EmotionDashboardPage() {
  const [summary, setSummary] = useState<EmotionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<
    "all" | "low" | "normal" | "high"
  >("all");

  useEffect(() => {
    getEmotionSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-5xl animate-float">💭</span>
      </div>
    );
  }

  if (!summary || summary.total === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="glass-card p-10">
          <span className="text-6xl block mb-4">📊</span>
          <h1 className="text-xl font-bold text-[#4a3728] mb-2">
            感情ログがまだありません
          </h1>
          <p className="text-sm text-[#b09a7d] mb-6">
            日記を書いてテンションと要因を記録すると、ここに可視化されます
          </p>
          <Link
            href="/user/diary/new"
            className="btn-flower px-6 py-3 inline-block"
          >
            ✏️ 日記を書く
          </Link>
        </div>
      </div>
    );
  }

  // 要因ランキング（出現回数降順）
  const sortedFactors = Object.entries(summary.factor_counts).sort(
    (a, b) => b[1] - a[1]
  );
  const maxFactorCount = sortedFactors[0]?.[1] ?? 1;

  // 表示するログ（フィルター適用）
  const filteredLogs =
    filterLevel === "all"
      ? [...summary.logs].reverse()
      : [...summary.logs]
          .reverse()
          .filter((l) => l.tension_level === filterLevel);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* ヘッダー */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#4a3728] mb-1">
          📊 感情ダッシュボード
        </h1>
        <p className="text-sm text-[#b09a7d]">
          日記から蓄積された感情データを可視化しています
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-[#4a3728]">{summary.total}</p>
          <p className="text-xs text-[#b09a7d]">記録数</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-[#4a3728]">
            {summary.avg_tension ?? "-"}
          </p>
          <p className="text-xs text-[#b09a7d]">平均テンション</p>
        </div>
        <div className={`glass-card p-4 text-center ${LEVEL_STYLE.low.bg}`}>
          <p className={`text-2xl font-bold ${LEVEL_STYLE.low.text}`}>
            {summary.level_counts.low}
          </p>
          <p className="text-xs text-blue-600">😔 低</p>
        </div>
        <div className={`glass-card p-4 text-center ${LEVEL_STYLE.high.bg}`}>
          <p className={`text-2xl font-bold ${LEVEL_STYLE.high.text}`}>
            {summary.level_counts.high}
          </p>
          <p className="text-xs text-amber-600">😊 高</p>
        </div>
      </div>

      {/* テンション推移グラフ（シンプルな棒グラフ） */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h2 className="text-sm font-bold text-[#8b7355] mb-3">
          📈 テンション推移
        </h2>
        <div className="flex items-end gap-1 h-24 overflow-x-auto pb-1">
          {summary.logs.slice(-30).map((log, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 flex-shrink-0"
              title={`${log.date}: ${log.tension}`}
            >
              <div
                className={`w-5 rounded-t-sm ${tensionBarColor(log.tension)} transition-all`}
                style={{ height: `${(log.tension / 100) * 80}px` }}
              />
              <span className="text-[8px] text-gray-400 rotate-45 origin-left w-4 block overflow-hidden">
                {log.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block" />
            低(≤30)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-green-400 inline-block" />
            普通(31-69)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
            高(≥70)
          </span>
        </div>
      </div>

      {/* 要因ランキング */}
      {sortedFactors.length > 0 && (
        <div className="glass-card p-5 animate-fade-in-up">
          <h2 className="text-sm font-bold text-[#8b7355] mb-3">
            🏷️ よく選ばれた要因
          </h2>
          <div className="space-y-2">
            {sortedFactors.map(([key, count]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-[#8b7355] w-36 flex-shrink-0">
                  {EMOTION_FACTORS[key] ?? key}
                </span>
                <div className="flex-1 bg-pink-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-rose-400 h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / maxFactorCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-[#4a3728] w-5 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ログ一覧 */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h2 className="text-sm font-bold text-[#8b7355]">📋 ログ一覧</h2>
          {(["all", "low", "normal", "high"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                filterLevel === level
                  ? "bg-pink-500 text-white border-pink-500"
                  : "border-gray-200 text-gray-500 hover:border-pink-300"
              }`}
            >
              {level === "all"
                ? "すべて"
                : level === "low"
                  ? "😔 低"
                  : level === "normal"
                    ? "😐 普通"
                    : "😊 高"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredLogs.map((log, i) => (
            <LogCard key={i} log={log} />
          ))}
        </div>
      </div>
    </div>
  );
}
