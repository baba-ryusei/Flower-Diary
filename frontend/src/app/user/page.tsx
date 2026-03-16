import Link from "next/link";
import FlowerGrowth from "./_components/FlowerGrowth";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-72px)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* 左: 花の成長 */}
          <div className="w-full max-w-[300px] flex-shrink-0 animate-fade-in-up">
            <FlowerGrowth />
          </div>

          {/* 右: ウェルカムテキスト & ボタン */}
          <div className="flex-1 text-center animate-fade-in-up [animation-delay:0.15s]">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300 bg-clip-text text-transparent leading-relaxed">
              Flower Diary
            </h1>
            <p className="text-lg text-[#8b7355] mb-2 leading-relaxed">
              あなたの気持ちを、世界にひとつだけの花に。
            </p>
            <p className="text-sm text-[#b09a7d] mb-10 leading-relaxed">
              日記を毎日書くとお花が育ちます。
              <br />
              続けることで蕾がほどけ、満開の花が咲きます 🌷
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
                href="/user/emotion"
                className="px-8 py-4 text-lg rounded-full font-bold border-2 border-blue-200 text-blue-500 hover:bg-blue-50 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>📊</span>
                <span>感情ログ</span>
              </Link>
              <Link
                href="/user/diary/calendar"
                className="px-8 py-4 text-lg rounded-full font-bold border-2 border-pink-200 text-pink-500 hover:bg-pink-50 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>📅</span>
                <span>カレンダー</span>
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
            <div className="mt-12 flex justify-center gap-6 text-3xl opacity-40">
              <span className="animate-float [animation-delay:0s]">🌷</span>
              <span className="animate-float [animation-delay:0.5s]">🌻</span>
              <span className="animate-float [animation-delay:1s]">💐</span>
              <span className="animate-float [animation-delay:1.5s]">🌹</span>
              <span className="animate-float [animation-delay:2s]">🌼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
