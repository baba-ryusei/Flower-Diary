from pathlib import Path


def load_prompt(file_name: str) -> str:
    """テキストファイルをそのまま文字列で返す（後方互換用）"""
    prompt_path = Path(__file__).parent / file_name

    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


def load_flower_prompts() -> dict[str, str]:
    """
    flower_prompts.txt を読み込み、感情キー→プロンプト文字列の辞書を返す。
    すべての値末尾に [style_suffix] が自動付与される。
    """
    prompt_path = Path(__file__).parent / "flower_prompts.txt"
    lines = prompt_path.read_text(encoding="utf-8").splitlines()

    sections: dict[str, list[str]] = {}
    current: str | None = None

    for line in lines:
        stripped = line.strip()
        # コメント・空行はスキップ
        if not stripped or stripped.startswith("#"):
            continue
        # セクションヘッダー
        if stripped.startswith("[") and stripped.endswith("]"):
            current = stripped[1:-1].strip()
            sections[current] = []
        elif current is not None:
            sections[current].append(stripped)

    style_suffix = " ".join(sections.pop("style_suffix", []))
    result: dict[str, str] = {}
    for key, body_lines in sections.items():
        prompt = " ".join(body_lines)
        result[key] = f"{prompt}, {style_suffix}" if style_suffix else prompt

    return result

