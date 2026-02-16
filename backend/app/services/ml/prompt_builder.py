"""
日記の内容から花の画像生成用プロンプトを作成する
"""


class PromptBuilder:
    @staticmethod
    def build_flower_prompt(diary_content: str, diary_title: str = "") -> str:
        """
        日記の内容を分析して、花の画像生成用プロンプトを作成

        Args:
            diary_content: 日記の本文
            diary_title: 日記のタイトル（オプション）

        Returns:
            Vertex AI Imagen用のプロンプト文字列
        """
        # 基本プロンプトテンプレート
        base_prompt = (
            "A beautiful and artistic flower photograph. "
            "High quality, professional photography, soft natural lighting. "
        )

        # 日記の内容に基づいた感情分析（簡易版）
        # 今後、より高度な感情分析を実装可能
        emotion_keywords = {
            "happy": ["嬉しい", "楽しい", "幸せ", "喜び", "素敵", "良い"],
            "sad": ["悲しい", "辛い", "寂しい", "切ない"],
            "peaceful": ["穏やか", "静か", "落ち着く", "リラックス", "安らぎ"],
            "energetic": ["元気", "活発", "パワフル", "情熱"],
        }

        # 感情に基づいた花の選択
        flower_suggestions = {
            "happy": "bright and cheerful sunflowers or roses",
            "sad": "elegant white lilies or blue hydrangeas",
            "peaceful": "soft pink cherry blossoms or white daisies",
            "energetic": "vibrant red tulips or orange marigolds",
        }

        detected_emotion = "peaceful"  # デフォルト
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in diary_content for keyword in keywords):
                detected_emotion = emotion
                break

        flower_type = flower_suggestions[detected_emotion]

        # 最終プロンプト
        prompt = (
            f"{base_prompt}"
            f"{flower_type}, "
            f"bokeh effect, shallow depth of field, "
            f"artistic composition, warm tones, peaceful atmosphere"
        )

        return prompt
