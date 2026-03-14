"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDiariesByMonth, type DiaryWithImage } from "@/lib/api/diaries";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  excited: "✨",
  calm: "😌",
  anxious: "😰",
  grateful: "🙏",
};

const MOOD_BG: Record<string, string> = {
  happy: "bg-yellow-100 border-yellow-300",
  sad: "bg-blue-100 border-blue-300",
  excited: "bg-pink-100 border-pink-300",
  calm: "bg-green-100 border-green-300",
  anxious: "bg-purple-100 border-purple-300",
  grateful: "bg-amber-100 border-amber-300",
};

export default function DiaryCalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [diaries, setDiaries] = useState<DiaryWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const fetchDiaries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDiariesByMonth(currentYear, currentMonth);
      setDiaries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "日記の読み込みに失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  // 月の日数と最初の曜日を計算
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  // 日付ごとの日記をマッピング
  const diaryByDate: Record<number, DiaryWithImage[]> = {};
  diaries.forEach((diary) => {
    const day = new Date(diary.created_at).getDate();
    if (!diaryByDate[day]) diaryByDate[day] = [];
    diaryByDate[day].push(diary);
  });

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDate(today.getDate());
  };

  const isToday = (day: number) =>
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth() + 1 &&
    day === today.getDate();

  const selectedDiaries = selectedDate ? diaryByDate[selectedDate] || [] : [];

  const truncateContent = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#4a3728]">📅 カレンダー</h1>
          <p className="text-sm text-[#b09a7d] mt-1">
            日記を書いた日にお花が咲いています
          </p>
        </div>
        <button
          onClick={() => router.push("/user/diary")}
          className="px-5 py-2 rounded-full text-sm font-medium border-2 border-purple-200 text-purple-500 hover:bg-purple-50 transition-colors"
        >
          📖 一覧表示
        </button>
      </div>

      {error && (
        <div className="mb-6 glass-card p-4 border-red-200 bg-red-50/70">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* カレンダーカード */}
      <div className="glass-card p-6 animate-fade-in-up">
        {/* 月ナビゲーション */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevMonth}
            className="w-10 h-10 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-400 transition-colors text-lg font-bold"
          >
            ‹
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#4a3728]">
              {currentYear}年 {currentMonth}月
            </h2>
            <button
              onClick={goToToday}
              className="text-xs text-purple-400 hover:text-purple-600 transition-colors mt-1"
            >
              今日に戻る
            </button>
          </div>
          <button
            onClick={goToNextMonth}
            className="w-10 h-10 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-400 transition-colors text-lg font-bold"
          >
            ›
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-bold py-2 ${
                i === 0
                  ? "text-red-400"
                  : i === 6
                    ? "text-blue-400"
                    : "text-[#b09a7d]"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <span className="text-4xl inline-block animate-float">🌸</span>
              <p className="mt-3 text-[#b09a7d] text-sm">読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* 空白セル */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* 日付セル */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayDiaries = diaryByDate[day];
              const hasDiary = !!dayDiaries;
              const isSelected = selectedDate === day;
              const dayOfWeek = (firstDayOfWeek + i) % 7;
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;

              // 日記の最初のmoodを取得
              const mood = dayDiaries?.[0]?.mood;
              const emoji = mood ? MOOD_EMOJI[mood] : undefined;

              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDate(isSelected ? null : day);
                  }}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative
                    transition-all duration-200 text-sm
                    ${isSelected ? "ring-2 ring-pink-400 scale-105 shadow-lg" : ""}
                    ${isToday(day) ? "ring-2 ring-purple-300" : ""}
                    ${
                      hasDiary
                        ? `${mood && MOOD_BG[mood] ? MOOD_BG[mood] : "bg-pink-50 border-pink-200"} border cursor-pointer hover:scale-105`
                        : "hover:bg-gray-50 cursor-pointer"
                    }
                  `}
                >
                  <span
                    className={`font-medium ${
                      isToday(day)
                        ? "text-purple-600 font-bold"
                        : isSunday
                          ? "text-red-400"
                          : isSaturday
                            ? "text-blue-400"
                            : "text-[#4a3728]"
                    }`}
                  >
                    {day}
                  </span>
                  {hasDiary && (
                    <span className="text-xs mt-0.5">{emoji || "🌸"}</span>
                  )}
                  {/* 複数の日記がある場合のバッジ */}
                  {dayDiaries && dayDiaries.length > 1 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-pink-400 text-white text-[10px] flex items-center justify-center font-bold">
                      {dayDiaries.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 選択した日の日記一覧 */}
      {selectedDate !== null && (
        <div className="mt-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#4a3728]">
              🌷 {currentMonth}月{selectedDate}日の日記
            </h3>
            <button
              onClick={() =>
                router.push(
                  `/user/diary/new?date=${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`
                )
              }
              className="btn-flower px-4 py-2 text-xs flex items-center gap-1"
            >
              <span>✏️</span>
              <span>この日の日記を書く</span>
            </button>
          </div>

          {selectedDiaries.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <span className="text-5xl inline-block mb-4">🌱</span>
              <p className="text-[#b09a7d] text-sm mb-4">
                この日はまだ日記がありません
              </p>
              <button
                onClick={() =>
                  router.push(
                    `/user/diary/new?date=${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`
                  )
                }
                className="btn-flower px-6 py-2 text-sm"
              >
                🌸 日記を書く
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {selectedDiaries.map((diary) => (
                <div
                  key={diary.id}
                  onClick={() => router.push(`/user/diary/${diary.id}`)}
                  className={`glass-card p-4 cursor-pointer hover:scale-[1.02] transition-all duration-300 border ${
                    diary.mood && MOOD_BG[diary.mood]
                      ? MOOD_BG[diary.mood]
                      : "border-pink-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                      {diary.mood ? MOOD_EMOJI[diary.mood] || "🌸" : "🌸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <time className="text-xs text-[#b09a7d] font-medium">
                          {new Date(diary.created_at).toLocaleTimeString(
                            "ja-JP",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                    <span className="text-pink-300 text-lg flex-shrink-0">
                      ›
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 凡例 */}
      <div className="mt-6 glass-card p-4 animate-fade-in-up">
        <p className="text-xs text-[#b09a7d] font-medium mb-2">🎨 気分の凡例</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MOOD_EMOJI).map(([mood, emoji]) => (
            <span
              key={mood}
              className={`px-2 py-1 rounded-full text-xs font-medium border ${MOOD_BG[mood]}`}
            >
              {emoji}{" "}
              {
                {
                  happy: "嬉しい",
                  sad: "悲しい",
                  excited: "ワクワク",
                  calm: "穏やか",
                  anxious: "不安",
                  grateful: "感謝",
                }[mood]
              }
            </span>
          ))}
          <span className="px-2 py-1 rounded-full text-xs font-medium border bg-pink-50 border-pink-200">
            🌸 その他
          </span>
        </div>
      </div>
    </div>
  );
}
