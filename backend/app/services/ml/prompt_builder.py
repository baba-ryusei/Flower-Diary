"""
日記の内容から花の画像生成用プロンプトを作成する
キーワードベースの感情分析で、適切な花のプロンプトを生成（API不要）
"""

import re

# 感情 → 花のマッピング定義
EMOTION_FLOWER_MAP = {
    "joy": {
        "keywords": [
            "嬉しい",
            "楽しい",
            "幸せ",
            "最高",
            "やった",
            "ハッピー",
            "笑",
            "わくわく",
            "ワクワク",
            "喜び",
            "素敵",
            "良い日",
            "happy",
            "joy",
            "glad",
            "great",
            "awesome",
            "fun",
        ],
        "prompt": (
            "Vibrant sunflowers in a golden meadow, bright yellow petals, "
            "warm sunlight, joyful atmosphere, high quality photography, "
            "shallow depth of field, soft bokeh background"
        ),
    },
    "sadness": {
        "keywords": [
            "悲しい",
            "辛い",
            "泣",
            "寂しい",
            "落ち込",
            "憂鬱",
            "つらい",
            "切ない",
            "苦しい",
            "悔しい",
            "失敗",
            "別れ",
            "sad",
            "cry",
            "lonely",
            "depressed",
            "painful",
            "miss",
        ],
        "prompt": (
            "Delicate blue hydrangeas with dewdrops, moody atmospheric lighting, "
            "soft rain in background, melancholic beauty, professional photography, "
            "cool blue and purple tones, gentle sadness"
        ),
    },
    "calm": {
        "keywords": [
            "穏やか",
            "静か",
            "リラックス",
            "安心",
            "のんびり",
            "平和",
            "落ち着",
            "ゆっくり",
            "散歩",
            "休",
            "読書",
            "お茶",
            "calm",
            "peace",
            "relax",
            "quiet",
            "rest",
            "gentle",
        ],
        "prompt": (
            "Soft lavender field at golden hour, gentle breeze, "
            "peaceful countryside landscape, warm pastel tones, "
            "professional photography, dreamy atmosphere, serene mood"
        ),
    },
    "anger": {
        "keywords": [
            "怒",
            "腹立",
            "むかつ",
            "イライラ",
            "いらいら",
            "最悪",
            "許せない",
            "ふざけ",
            "うざい",
            "ストレス",
            "不満",
            "angry",
            "furious",
            "annoyed",
            "frustrated",
            "hate",
        ],
        "prompt": (
            "Striking red roses with dark dramatic lighting, "
            "intense crimson petals, high contrast, powerful mood, "
            "artistic photography, deep shadows, passionate energy"
        ),
    },
    "anxiety": {
        "keywords": [
            "不安",
            "心配",
            "焦り",
            "緊張",
            "ドキドキ",
            "怖い",
            "迷",
            "悩",
            "どうしよう",
            "大丈夫かな",
            "プレッシャー",
            "anxious",
            "worried",
            "nervous",
            "afraid",
            "scared",
        ],
        "prompt": (
            "White jasmine flowers in soft fog, ethereal atmosphere, "
            "misty morning garden, delicate petals, muted tones, "
            "professional photography, subtle lighting, contemplative mood"
        ),
    },
    "love": {
        "keywords": [
            "好き",
            "愛",
            "恋",
            "デート",
            "告白",
            "一緒",
            "ありがとう",
            "感謝",
            "大切",
            "優しい",
            "温かい",
            "抱きしめ",
            "love",
            "like",
            "dear",
            "together",
            "thank",
            "warm",
        ],
        "prompt": (
            "Romantic pink peonies in soft focus, warm golden lighting, "
            "gentle pastel pink and white tones, beautiful bouquet, "
            "professional photography, dreamy bokeh, tender atmosphere"
        ),
    },
    "excitement": {
        "keywords": [
            "興奮",
            "すごい",
            "ヤバい",
            "やばい",
            "テンション",
            "燃え",
            "挑戦",
            "頑張",
            "目標",
            "達成",
            "成功",
            "夢",
            "excited",
            "amazing",
            "incredible",
            "challenge",
            "goal",
        ],
        "prompt": (
            "Vivid orange and yellow tulips bursting with color, "
            "dynamic composition, energetic atmosphere, bright spring garden, "
            "high quality photography, vibrant saturated colors, uplifting mood"
        ),
    },
}

# mood選択 → 感情カテゴリのマッピング
MOOD_EMOTION_MAP = {
    "happy": "joy",
    "sad": "sadness",
    "angry": "anger",
    "anxious": "anxiety",
    "calm": "calm",
    "excited": "excitement",
    "loved": "love",
    "grateful": "love",
}

# デフォルトプロンプト
DEFAULT_PROMPT = (
    "A beautiful and artistic flower photograph. "
    "Soft pink cherry blossoms, high quality, professional photography, "
    "soft natural lighting, bokeh effect, shallow depth of field, "
    "artistic composition, warm tones, peaceful atmosphere"
)


class PromptBuilder:
    def __init__(self):
        pass

    def analyze_emotion_and_build_prompt(
        self, diary_content: str, mood: str = None
    ) -> str:
        """
        キーワードベースで日記の感情を分析し、花の画像生成用プロンプトを作成

        Args:
            diary_content: 日記の本文
            mood: ユーザーが選択した気分（オプション）

        Returns:
            Vertex AI Imagen用のプロンプト文字列
        """
        # 1. moodが指定されていればそれを優先
        if mood and mood.lower() in MOOD_EMOTION_MAP:
            emotion_key = MOOD_EMOTION_MAP[mood.lower()]
            print(f"感情分析(mood指定): {mood} → {emotion_key}")
            return EMOTION_FLOWER_MAP[emotion_key]["prompt"]

        # 2. 日記本文からキーワードマッチで感情を判定
        scores: dict[str, int] = {}
        content_lower = diary_content.lower()

        for emotion, data in EMOTION_FLOWER_MAP.items():
            score = 0
            for keyword in data["keywords"]:
                # 部分一致でカウント
                count = len(re.findall(re.escape(keyword), content_lower))
                score += count
            if score > 0:
                scores[emotion] = score

        if scores:
            best_emotion = max(scores, key=scores.get)
            print(f"感情分析(キーワード): {scores} → {best_emotion}")
            return EMOTION_FLOWER_MAP[best_emotion]["prompt"]

        # 3. どれにもマッチしなければデフォルト
        print("感情分析: マッチなし → デフォルトプロンプト")
        return DEFAULT_PROMPT

    @staticmethod
    def build_flower_prompt(diary_content: str, diary_title: str = "") -> str:
        """
        後方互換性のための静的メソッド
        """
        builder = PromptBuilder()
        return builder.analyze_emotion_and_build_prompt(diary_content)
