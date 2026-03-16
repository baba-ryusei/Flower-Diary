"use client";

import { useState, useEffect, useRef } from "react";
import {
  sendMessage,
  getLocalHistory,
  syncHistoryFromDB,
  clearHistory,
  type ChatMessage,
} from "@/lib/api/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初回ロード時にlocalStorageから履歴を復元
  useEffect(() => {
    const history = getLocalHistory();
    setMessages(history);
    setSyncing(false);

    // バックグラウンドでDBと同期（オプション）
    syncHistoryFromDB()
      .then((syncedHistory) => {
        setMessages(syncedHistory);
      })
      .catch(console.error);
  }, []);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // 即座にUI更新（楽観的更新）
    const tempUserMsg: ChatMessage = {
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      // API呼び出し
      const reply = await sendMessage(userMessage);

      // AI返答を追加
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Failed to send message:", error);

      // エラーメッセージを表示
      const errorMsg: ChatMessage = {
        role: "assistant",
        content:
          "すみません、メッセージの送信に失敗しました。もう一度お試しください。",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("会話履歴を削除してもよろしいですか？")) return;

    try {
      await clearHistory();
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
      alert("履歴の削除に失敗しました");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (syncing) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🌸</div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              💬 優しいチャット
            </h1>
            <p className="text-sm text-gray-600">
              あなたの気持ちを聞かせてください。いつでも寄り添います。
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              🗑️ 履歴削除
            </button>
          )}
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="glass-card p-6 mb-6 min-h-[500px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌸</div>
            <p className="text-gray-500 mb-2">
              こんにちは！何か話したいことはありますか？
            </p>
            <p className="text-sm text-gray-400">
              どんな小さなことでも、遠慮なく話してくださいね。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-pink-400 to-purple-400 text-white"
                      : "bg-white border-2 border-pink-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  {msg.created_at && (
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === "user" ? "text-pink-100" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-pink-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 入力欄 */}
      <div className="glass-card p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-3 border-2 border-pink-100 rounded-full focus:outline-none focus:border-pink-300 transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-flower px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "送信 💌"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Enterキーで送信できます
        </p>
      </div>
    </div>
  );
}
