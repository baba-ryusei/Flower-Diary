import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6">
      <div className="text-center max-w-lg animate-fade-in-up">
        {/* メインビジュアル */}
        <div className="mb-8">
          <span className="text-8xl inline-block animate-float">🌸</span>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300 bg-clip-text text-transparent leading-relaxed">
          Flower Diary
        </h1>
        <p className="text-lg text-[#8b7355] mb-2 leading-relaxed">
          あなたの気持ちを、世界にひとつだけの花に。
        </p>
        <p className="text-sm text-[#b09a7d] mb-10 leading-relaxed">
          日記を書くと、AIがあなたの感情を読み取って
          <br />
          気持ちにぴったりのお花を咲かせます 🌷
        </p>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/user/diary/new"
            className="btn-flower px-8 py-4 text-lg inline-flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            <span>日記を書く</span>
          </Link>
          <Link
            href="/user/diary"
            className="px-8 py-4 text-lg rounded-full font-bold border-2 border-purple-200 text-purple-500 hover:bg-purple-50 transition-all inline-flex items-center justify-center gap-2"
          >
            <span>📖</span>
            <span>日記を見る</span>
          </Link>
        </div>

        {/* デコレーション */}
        <div className="mt-16 flex justify-center gap-6 text-3xl opacity-40">
          <span className="animate-float" style={{ animationDelay: "0s" }}>
            🌷
          </span>
          <span className="animate-float" style={{ animationDelay: "0.5s" }}>
            🌻
          </span>
          <span className="animate-float" style={{ animationDelay: "1s" }}>
            💐
          </span>
          <span className="animate-float" style={{ animationDelay: "1.5s" }}>
            🌹
          </span>
          <span className="animate-float" style={{ animationDelay: "2s" }}>
            🌼
          </span>
        </div>
      </div>
    </div>
  );
}
