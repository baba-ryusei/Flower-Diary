from openai import AsyncOpenAI
from typing import List, Dict
from app.core.config import settings
from prompts import load_prompt
import logging

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.system_prompt = load_prompt("system_prompts.txt")

        # デバッグ: 設定を確認
        logger.info(f"ChatService initialized with model: {self.model}")
        logger.info(f"API Key configured: {'Yes' if settings.OPENAI_API_KEY else 'No'}")

    async def chat(
        self, user_message: str, conversation_history: List[Dict[str, str]] = None
    ) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]

        # 会話履歴を追加
        if conversation_history:
            messages.extend(conversation_history[-20:])  # 最新20件

        # 現在のメッセージを追加
        messages.append({"role": "user", "content": user_message})

        # デバッグ: 送信するメッセージを確認
        logger.info(f"Sending {len(messages)} messages to OpenAI API")
        logger.debug(f"Messages: {messages}")

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500,
            )
            logger.info(f"OpenAI API response received successfully")
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API エラー: {str(e)}", exc_info=True)
            return "ごめんなさい、今うまくお話ができない状態みたいです。少し待ってからもう一度お話ししてもらえますか？"
