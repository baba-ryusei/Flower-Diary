const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";

export interface Diary {
  id: number;
  user_id: number;
  content: string;
  mood?: string;
  created_at: string;
  updated_at: string;
}

export interface FlowerImage {
  id: number;
  diary_id: number;
  image_url: string;
  prompt: string;
  created_at: string;
}

export interface CreateDiaryRequest {
  user_id: number;
  content: string;
  mood?: string;
}

export interface DiaryWithImage extends Diary {
  flower_image?: FlowerImage;
}

/**
 * 日記を作成し、画像を生成する
 */
export async function createDiary(
  data: CreateDiaryRequest
): Promise<DiaryWithImage> {
  try {
    console.log("API Request:", `${API_BASE_URL}/api/v1/diaries/`, data);

    const response = await fetch(`${API_BASE_URL}/api/v1/diaries/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      let errorMessage = "日記の作成に失敗しました";
      try {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
        if (typeof errorMessage === "object") {
          errorMessage = JSON.stringify(errorMessage);
        }
      } catch {
        const text = await response.text();
        console.error("API Error (raw):", text);
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("API Response data:", result);
    return result;
  } catch (error) {
    console.error("Create diary error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("ネットワークエラーが発生しました");
  }
}

/**
 * 日記一覧を取得
 */
export async function getDiaries(skip = 0, limit = 10): Promise<Diary[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/diaries/?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("日記の取得に失敗しました");
  }

  return response.json();
}

/**
 * 特定の日記を取得
 */
export async function getDiary(diaryId: number): Promise<DiaryWithImage> {
  const response = await fetch(`${API_BASE_URL}/api/v1/diaries/${diaryId}`);

  if (!response.ok) {
    throw new Error("日記の取得に失敗しました");
  }

  return response.json();
}

/**
 * 日記の花画像を生成
 */
export async function generateFlowerImage(
  diaryId: number
): Promise<FlowerImage> {
  const response = await fetch(`${API_BASE_URL}/api/v1/flowers/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ diary_id: diaryId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "画像の生成に失敗しました");
  }

  return response.json();
}
