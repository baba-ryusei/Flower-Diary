"use client";

import { useEffect, useState } from "react";
import { getDiaryCount } from "@/lib/api/diaries";

// 各ステージの定義
const STAGES = [
  {
    name: "種",
    description: "日記を書いてお花を育てよう！",
    color: "#A0785A",
    nextAt: 1,
  },
  {
    name: "芽吹き",
    description: "芽が出てきた！続けて書こう",
    color: "#5a8f3c",
    nextAt: 4,
  },
  {
    name: "蕾",
    description: "小さな蕾がついた！",
    color: "#e18fac",
    nextAt: 8,
  },
  {
    name: "膨らむ蕾",
    description: "蕾が大きくなってきた！",
    color: "#d4608a",
    nextAt: 15,
  },
  {
    name: "開花",
    description: "花が咲き始めた！",
    color: "#c73d72",
    nextAt: 25,
  },
  {
    name: "満開",
    description: "満開のお花が咲いた！✨",
    color: "#ad1457",
    nextAt: null,
  },
];

// ステージ開始時の日記数
const STAGE_START = [0, 1, 4, 8, 15, 25];

function getStage(count: number): number {
  if (count === 0) return 0;
  if (count < 4) return 1;
  if (count < 8) return 2;
  if (count < 15) return 3;
  if (count < 25) return 4;
  return 5;
}

// ステージから花びら開度(0=蕾, 1=満開)を計算
function getOpenRatio(stage: number): number {
  if (stage <= 1) return 0;
  return Math.min(1, (stage - 2) / 3);
}

// SVG花コンポーネント
function FlowerSVG({ displayStage }: { displayStage: number }) {
  const CX = 100;
  const CY = 108;
  const openRatio = getOpenRatio(displayStage);
  const showPetals = displayStage >= 2;
  const showSprout = displayStage >= 1;
  const stemTop = displayStage === 0 ? 272 : displayStage === 1 ? 238 : 120;

  // 花びらパラメータ（蕾→満開で変化）
  const petalOffset = 5 + openRatio * 25; // 中心からの距離
  const petalRx = 6 + openRatio * 15; // 横幅
  const petalRy = 34 - openRatio * 13; // 縦幅（蕾は縦長、満開はやや扁平）

  // 花芯
  const centerR = 3 + openRatio * 9;

  const petalColors = [
    "#FFB3CB",
    "#FFCAD4",
    "#FF9EBC",
    "#FFB3CB",
    "#FFCAD4",
    "#FF9EBC",
  ];

  return (
    <svg
      viewBox="0 0 200 290"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* 土 */}
      <ellipse cx="100" cy="274" rx="76" ry="14" fill="#A0785A" opacity="0.5" />
      <ellipse cx="100" cy="268" rx="54" ry="9" fill="#8B6247" opacity="0.45" />

      {/* 種（ステージ0のみ） */}
      {displayStage === 0 && (
        <g>
          <ellipse
            cx="100"
            cy="263"
            rx="7"
            ry="9"
            fill="#93683F"
            opacity="0.8"
          />
          <ellipse
            cx="96"
            cy="260"
            rx="1.5"
            ry="3"
            fill="#6B4C2A"
            opacity="0.5"
          />
        </g>
      )}

      {/* 茎 */}
      {showSprout && (
        <path
          d={`M 100 270 C 96 ${(stemTop + 270) / 2 + 14} 104 ${
            (stemTop + 270) / 2 - 10
          } 100 ${stemTop}`}
          stroke="#5a8f3c"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* 葉（ステージ2以上） */}
      {displayStage >= 2 && (
        <>
          <ellipse
            cx="81"
            cy="216"
            rx="23"
            ry="9"
            fill="#6ab04c"
            transform="rotate(-42, 81, 216)"
            opacity="0.9"
          />
          <ellipse
            cx="119"
            cy="183"
            rx="23"
            ry="9"
            fill="#78c549"
            transform="rotate(42, 119, 183)"
            opacity="0.9"
          />
        </>
      )}

      {/* 花びら（ステージ2以上） */}
      {showPetals &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const angle = openRatio * i * 60;
          const rad = (angle * Math.PI) / 180;
          const px = CX + Math.sin(rad) * petalOffset;
          const py = CY - Math.cos(rad) * petalOffset;

          return (
            <g
              key={i}
              className="petal-group"
              style={{ transform: `translate(${px}px, ${py}px)` }}
            >
              <ellipse
                cx={0}
                cy={0}
                rx={petalRx}
                ry={petalRy}
                fill={petalColors[i]}
                className="petal-path"
                style={{ transform: `rotate(${angle}deg)` }}
              />
            </g>
          );
        })}

      {/* がく（蕾カバー・ステージ2〜3のみ表示して徐々に消える） */}
      {showPetals &&
        displayStage <= 3 &&
        [0, 1, 2].map((i) => {
          const sepalOpacity = Math.max(0, 1 - openRatio * 3.2);
          return (
            <ellipse
              key={i}
              cx={CX}
              cy={CY - 7}
              rx={7}
              ry={27}
              fill="#4a8c2a"
              className="sepal-path"
              style={{ opacity: sepalOpacity }}
              transform={`rotate(${i * 120}, ${CX}, ${CY})`}
            />
          );
        })}

      {/* 花芯 */}
      {showPetals && (
        <>
          <circle
            cx={CX}
            cy={CY}
            r={centerR}
            fill="#FCD34D"
            className="flower-center"
          />
          <circle
            cx={CX}
            cy={CY}
            r={centerR * 0.55}
            fill="#F59E0B"
            className="flower-center"
          />
        </>
      )}
    </svg>
  );
}

export default function FlowerGrowth() {
  const [diaryCount, setDiaryCount] = useState<number | null>(null);
  const [displayStage, setDisplayStage] = useState(0);

  useEffect(() => {
    getDiaryCount()
      .then((count) => {
        setDiaryCount(count);
        const actualStage = getStage(count);
        // まず蕾状態(stage 2)で表示し、少し後に実際のステージへアニメーション
        const startStage = actualStage >= 2 ? 2 : actualStage;
        setDisplayStage(startStage);
        if (actualStage > startStage) {
          setTimeout(() => setDisplayStage(actualStage), 450);
        }
      })
      .catch(() => {
        setDiaryCount(0);
        setDisplayStage(0);
      });
  }, []);

  if (diaryCount === null) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-72">
        <span className="text-4xl animate-float">🌱</span>
      </div>
    );
  }

  const stage = getStage(diaryCount);
  const stageInfo = STAGES[stage];
  const nextAt = stageInfo.nextAt;
  const stageStartCount = STAGE_START[stage];
  const progressPct = nextAt
    ? Math.min(
        100,
        ((diaryCount - stageStartCount) / (nextAt - stageStartCount)) * 100
      )
    : 100;

  return (
    <div className="glass-card p-6">
      <h2 className="text-center text-base font-bold text-[#4a3728] mb-3">
        🌱 あなたのお花
      </h2>

      {/* SVG花 */}
      <div className="mx-auto w-[170px] h-[208px]">
        <FlowerSVG displayStage={displayStage} />
      </div>

      {/* ステージ名 & 説明 */}
      <div className="text-center mt-3 mb-4">
        <span
          className={`inline-block text-sm font-bold px-3 py-1 rounded-full mb-1.5 ${
            stage === 0
              ? "bg-amber-100 text-amber-700"
              : stage === 1
                ? "bg-green-100 text-green-700"
                : stage === 2
                  ? "bg-pink-100 text-pink-600"
                  : stage === 3
                    ? "bg-pink-200 text-pink-700"
                    : stage === 4
                      ? "bg-rose-100 text-rose-600"
                      : "bg-rose-200 text-rose-700"
          }`}
        >
          {stageInfo.name}
        </span>
        <p className="text-xs text-[#8b7355]">{stageInfo.description}</p>
      </div>

      {/* プログレスバー */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#b09a7d] mb-1.5">
          <span>{diaryCount}回書いた</span>
          {nextAt && <span>次: {nextAt}回</span>}
        </div>
        <div className="w-full bg-pink-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-pink-400 to-rose-400 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextAt && (
          <p className="text-xs text-[#c9b99a] mt-1 text-center">
            次の成長まであと{" "}
            <span className="font-bold text-pink-500">
              {nextAt - diaryCount}回
            </span>
          </p>
        )}
        {!nextAt && (
          <p className="text-xs text-rose-400 mt-1 text-center font-bold">
            🎉 満開達成！
          </p>
        )}
      </div>

      {/* ステージインジケーター */}
      <div className="flex justify-center items-center gap-1.5">
        {STAGES.map((s, i) => (
          <div
            key={i}
            title={s.name}
            className={`rounded-full transition-all duration-500 ${
              i < stage
                ? "w-2.5 h-2.5 bg-pink-300"
                : i === stage
                  ? "w-3.5 h-3.5 bg-rose-500 ring-2 ring-rose-200"
                  : "w-2.5 h-2.5 bg-pink-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
