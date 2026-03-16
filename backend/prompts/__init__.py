from pathlib import Path

def load_prompt(file_name: str) -> str:
    # __file__の親ディレクトリ（promptsディレクトリ）からファイルを読み込む
    prompt_path = Path(__file__).parent / file_name

    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()
