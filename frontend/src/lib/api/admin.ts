const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AdminDiary {
  id: number;
  user_id: number;
  content: string;
  mood?: string;
  created_at: string;
  updated_at: string;
  has_image?: boolean;
  flower_image?: {
    id: number;
    diary_id: number;
    image_url: string;
    prompt: string;
    created_at: string;
  };
}

export interface AdminStats {
  total_users: number;
  total_diaries: number;
  total_images: number;
  monthly_diaries: number;
  weekly_diaries: number;
}

/**
 * 全ユーザーを取得
 */
export async function getAllUsers(skip = 0, limit = 100): Promise<User[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/users?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("ユーザー一覧の取得に失敗しました");
  }

  return response.json();
}

/**
 * 特定ユーザーの日記一覧を取得
 */
export async function getUserDiaries(
  userId: number,
  skip = 0,
  limit = 50
): Promise<AdminDiary[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/users/${userId}/diaries?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("日記一覧の取得に失敗しました");
  }

  return response.json();
}

/**
 * 全日記を取得
 */
export async function getAllDiaries(
  skip = 0,
  limit = 100
): Promise<AdminDiary[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/diaries?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("日記一覧の取得に失敗しました");
  }

  return response.json();
}

/**
 * 統計情報を取得
 */
export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/stats`);

  if (!response.ok) {
    throw new Error("統計情報の取得に失敗しました");
  }

  return response.json();
}
