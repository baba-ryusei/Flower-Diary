"""
日記に対するAIコメント生成サービス

- 写真あり → GPT-4o (vision) で写真+文章を一緒に解析
- 写真なし → GPT-4o-mini (text) で文章のみ解析
- 返答は日本語・温かみのある口から出たようなひとこと（300文字以内）
"""

from openai import AsyncOpenAI
from app.core.config import settings

SYSTEM_PROMPT = (
    "あなたは共感力の高い日記カウンセラーAIです。"
    "ユーザーが書いた日記（と添付写真）を読んで、"
    "温かく、まるで親友に話しかけるような自然な日本語でひとことコメントを返してください。"
    "説教や過剰なアドバイスはせず、ただ寄り添う一言にしてください。"
    "300文字以内で返答してください。"
)


class AICommentService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_comment(
        self,
        diary_content: str,
        photo_url: str | None = None,
        mood: str | None = None,
    ) -> str:
        """
        日記に対するAIコメントを生成する。

        Args:
            diary_content: 日記本文
            photo_url: 添付写真の公開URL（オプション）
            mood: ムード文字列（例: "happy", "sad"）

        Returns:
            AIのコメント文字列
        """
        mood_label = f"ムード: {mood}\n" if mood else ""
        text_content = f"{mood_label}日記の内容:\n{diary_content[:500]}"

        if photo_url:
            # GPT-4o vision: 写真+テキスト
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": photo_url, "detail": "low"},
                        },
                        {"type": "text", "text": text_content},
                    ],
                },
            ]
            model = "gpt-4o"
        else:
            # GPT-4o-mini: テキストのみ
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text_content},
            ]
            model = settings.OPENAI_MODEL

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.8,
            max_tokens=400,
        )
        return response.choices[0].message.content.strip()
