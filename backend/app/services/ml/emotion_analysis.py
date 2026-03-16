from openai import AsyncOpenAI
from app.core.config import settings

# 感情要因カテゴリ定義（キー・ラベルのマスタ）
EMOTION_FACTORS = {
    "sleep": "😴 睡眠・休息",
    "health": "🍽️ 食事・体調",
    "work": "💼 仕事・学業",
    "relationship": "👥 人間関係",
    "money": "💰 お金・生活",
    "weather": "🌤️ 天気・環境",
    "exercise": "🏃 運動・趣味",
    "achievement": "🎯 達成感・自己肯定",
    "sns": "📱 情報・SNS",
    "unknown": "❓ 不明・その他",
}


def classify_tension_level(tension: int) -> str:
    if tension <= 30:
        return "low"
    elif tension <= 69:
        return "normal"
    else:
        return "high"


class EmotionAnalysisService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def analyze(
        self,
        tension: int,
        tension_level: str,
        factors: list[str],
        diary_content: str,
    ) -> str | None:
        """
        low / high のみAI分析を行い、テキストを返す。
        normal はNoneを返す（データ蓄積のみ）。
        """
        if tension_level == "normal":
            return None

        factor_labels = [
            EMOTION_FACTORS.get(f, f) for f in factors if f in EMOTION_FACTORS
        ]
        factor_str = "、".join(factor_labels) if factor_labels else "不明"

        if tension_level == "low":
            system = (
                "あなたは共感力の高いメンタルケアAIです。"
                "ユーザーの日記とストレス要因をもとに、"
                "簡潔で温かい日本語で分析・アドバイスを200文字以内で返してください。"
                "責めず、寄り添うトーンで書いてください。"
            )
            user_msg = (
                f"テンション値: {tension}/100（低め）\n"
                f"ストレス要因として選んだカテゴリ: {factor_str}\n"
                f"日記の内容: {diary_content[:300]}\n\n"
                "このストレスの傾向を分析し、一言アドバイスをください。"
            )
        else:  # high
            system = (
                "あなたはポジティブ心理学に詳しいAIです。"
                "ユーザーの日記と元気の要因をもとに、"
                "何がエネルギーの源になっているか簡潔な日本語で200文字以内でまとめてください。"
            )
            user_msg = (
                f"テンション値: {tension}/100（高め）\n"
                f"元気の要因として選んだカテゴリ: {factor_str}\n"
                f"日記の内容: {diary_content[:300]}\n\n"
                "このポジティブなエネルギーの源を分析してください。"
            )

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.7,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
