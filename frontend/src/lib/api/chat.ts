const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface ChatMessageResponse {
  id: number;
  user_id: number;
  role: string;
  content: string;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
  message_id: number;
}

const STORAGE_KEY = "chat_history";
const MAX_HISTORY = 20; // localStorage保存件数制限

/**
 * localStorageから会話履歴を読み込み
 */
export function getLocalHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

/**
 * localStorageに会話履歴を保存
 */
export function saveLocalHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    // 最新N件のみ保存（容量制限対策）
    const limited = messages.slice(-MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
}

/**
 * メッセージを送信
 */
export async function sendMessage(
  content: string,
  userId: number = 1
): Promise<string> {
  // localStorageから履歴取得
  const history = getLocalHistory();

  const response = await fetch(
    `${API_BASE_URL}/api/v1/chat/?user_id=${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        history, // localStorageの履歴を送信
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "メッセージの送信に失敗しました");
  }

  const data: ChatResponse = await response.json();

  // 新しいメッセージをlocalStorageに追加
  const updatedHistory: ChatMessage[] = [
    ...history,
    { role: "user", content, created_at: new Date().toISOString() },
    {
      role: "assistant",
      content: data.reply,
      created_at: new Date().toISOString(),
    },
  ];
  saveLocalHistory(updatedHistory);

  return data.reply;
}

/**
 * DBから履歴を同期（ページロード時など）
 */
export async function syncHistoryFromDB(
  userId: number = 1
): Promise<ChatMessage[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/history?user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error("履歴の取得に失敗しました");
    }

    const messages: ChatMessageResponse[] = await response.json();
    const chatMessages: ChatMessage[] = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      created_at: msg.created_at,
    }));

    saveLocalHistory(chatMessages);
    return chatMessages;
  } catch (error) {
    console.error("Failed to sync history:", error);
    return getLocalHistory();
  }
}

/**
 * 履歴をクリア（localStorage + DB）
 */
export async function clearHistory(userId: number = 1): Promise<void> {
  // localStorage クリア
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }

  // DB クリア
  const response = await fetch(
    `${API_BASE_URL}/api/v1/chat/history?user_id=${userId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("履歴の削除に失敗しました");
  }
}
