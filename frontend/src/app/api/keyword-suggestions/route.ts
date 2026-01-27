import { NextRequest, NextResponse } from "next/server";

// Выносим в конфиг, чтобы не хардкодить
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  // Если запрос слишком короткий, отдаем пустой массив или дефолты
  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Стучимся к твоему NestJS бэкенду
    const response = await fetch(
      `${BACKEND_URL}/keyword-suggestions?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Кэширование на уровне Next.js (опционально, так как у тебя Redis на беке)
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error(`Backend error! status: ${response.status}`);
    }

    const data = await response.json();

    // Возвращаем данные в том виде, в котором их отдал бек
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching suggestions from backend:", error);

    // В случае факапа возвращаем пустой массив, чтобы фронт не падал
    return NextResponse.json([], { status: 500 });
  }
}
