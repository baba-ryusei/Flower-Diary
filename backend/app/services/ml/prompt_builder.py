"""
日記の内容から花の画像生成用プロンプトを作成する
キーワードベースの感情分析で、適切な花のプロンプトを生成（API不要）
プロンプト定義は prompts/flower_prompts.txt で管理
"""

import re
from prompts import load_flower_prompts

# prompts/flower_prompts.txt からプロンプトを読み込む
_FLOWER_PROMPTS = load_flower_prompts()

# 感情 → キーワードマッピング（プロンプト本体はファイル管理）
EMOTION_KEYWORDS: dict[str, list[str]] = {
    "joy": [
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
    "sadness": [
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
    "calm": [
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
    "anger": [
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
    "anxiety": [
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
    "love": [
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
    "excitement": [
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
            return _FLOWER_PROMPTS.get(emotion_key, _FLOWER_PROMPTS.get("default", ""))

        # 2. 日記本文からキーワードマッチで感情を判定
        scores: dict[str, int] = {}
        content_lower = diary_content.lower()

        for emotion, keywords in EMOTION_KEYWORDS.items():
            score = sum(
                len(re.findall(re.escape(kw), content_lower)) for kw in keywords
            )
            if score > 0:
                scores[emotion] = score

        if scores:
            best_emotion = max(scores, key=scores.get)
            print(f"感情分析(キーワード): {scores} → {best_emotion}")
            return _FLOWER_PROMPTS.get(best_emotion, _FLOWER_PROMPTS.get("default", ""))

        # 3. どれにもマッチしなければデフォルト
        print("感情分析: マッチなし → デフォルトプロンプト")
        return _FLOWER_PROMPTS.get("default", "")

    @staticmethod
    def build_flower_prompt(diary_content: str, diary_title: str = "") -> str:
        """後方互換性のための静的メソッド"""
        builder = PromptBuilder()
        return builder.analyze_emotion_and_build_prompt(diary_content)
