const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";

export const EMOTION_FACTORS: Record<string, string> = {
  sleep: "😴 睡眠・休息",
  health: "🍽️ 食事・体調",
  work: "💼 仕事・学業",
  relationship: "👥 人間関係",
  money: "💰 お金・生活",
  weather: "🌤️ 天気・環境",
  exercise: "🏃 運動・趣味",
  achievement: "🎯 達成感・自己肯定",
  sns: "📱 情報・SNS",
  unknown: "❓ 不明・その他",
};

export interface EmotionLogResponse {
  id: number;
  diary_id: number;
  tension: number;
  tension_level: "low" | "normal" | "high";
  factors: string[];
  analysis: string | null;
  created_at: string;
}

export interface EmotionSummaryItem {
  date: string;
  tension: number;
  tension_level: "low" | "normal" | "high";
  factors: string[];
  analysis: string | null;
}

export interface EmotionSummary {
  logs: EmotionSummaryItem[];
  total: number;
  avg_tension: number | null;
  factor_counts: Record<string, number>;
  level_counts: { low: number; normal: number; high: number };
}

export async function createEmotionLog(
  diaryId: number,
  tension: number,
  factors: string[]
): Promise<EmotionLogResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/emotions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ diary_id: diaryId, tension, factors }),
  });
  if (!response.ok) {
    throw new Error("感情ログの保存に失敗しました");
  }
  return response.json();
}

export async function getEmotionSummary(): Promise<EmotionSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/emotions/summary`);
  if (!response.ok) {
    throw new Error("感情サマリーの取得に失敗しました");
  }
  return response.json();
}
