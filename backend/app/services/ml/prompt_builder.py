"""
日記の内容から花の画像生成用プロンプトを作成する
OpenAI APIを使って感情を分析し、適切な花のプロンプトを生成
"""

import json
from openai import OpenAI
from app.core.config import settings


class PromptBuilder:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def analyze_emotion_and_build_prompt(
        self, diary_content: str, mood: str = None
    ) -> str:
        """
        OpenAI APIを使って日記の感情を分析し、花の画像生成用プロンプトを作成

        Args:
            diary_content: 日記の本文
            mood: ユーザーが選択した気分（オプション）

        Returns:
            Vertex AI Imagen用のプロンプト文字列
        """
        system_prompt = """あなたは日記の内容から感情を分析し、その感情に合った美しい花のイメージを表現するプロンプト生成の専門家です。
日記の内容を読み、以下のJSON形式で応答してください：

{
  "emotion": "感情の説明（例: 喜び、悲しみ、穏やか、情熱的など）",
  "flower_description": "その感情を表現する花の特徴（色、種類、雰囲気など）",
  "prompt": "画像生成AI用の英語プロンプト（具体的で詳細な描写）"
}

プロンプトは必ず英語で、写真のような高品質な花のイメージを生成できる詳細な記述にしてください。"""

        user_message = f"日記の内容:\n{diary_content}"
        if mood:
            user_message += f"\n\nユーザーの気分: {mood}"

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            result = json.loads(response.choices[0].message.content)
            return result.get("prompt", self._fallback_prompt())

        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._fallback_prompt()

    def _fallback_prompt(self) -> str:
        """APIエラー時のフォールバックプロンプト"""
        return (
            "A beautiful and artistic flower photograph. "
            "Soft pink cherry blossoms, high quality, professional photography, "
            "soft natural lighting, bokeh effect, shallow depth of field, "
            "artistic composition, warm tones, peaceful atmosphere"
        )

    @staticmethod
    def build_flower_prompt(diary_content: str, diary_title: str = "") -> str:
        """
        後方互換性のための静的メソッド
        新しいコードではanalyze_emotion_and_build_promptを使用してください
        """
        builder = PromptBuilder()
        return builder.analyze_emotion_and_build_prompt(diary_content)
