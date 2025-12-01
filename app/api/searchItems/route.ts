/**
 * 📌 Next.js API Route (서버 전용 라우트)
 * -----------------------------------------
 * 이 파일은 Next.js 내부에서 "서버처럼" 실행되는 API 엔드포인트 역할을 한다.
 * 
 * ✔ 브라우저에서는 fetch("/api/searchItems") 로 직접 호출 가능
 * ✔ 서버 환경에서 실행되므로 환경변수(NAVER_CLIENT_ID 등) 안전하게 처리 가능
 * ✔ 외부 API(Naver OpenAPI 등)를 호출할 때 보안상 유리
 *
 * ⚠️ 주의: 이 파일은 프론트 단의 유틸 함수가 아니므로
 *    /lib/api/ 와는 역할이 완전히 다르다.
 */
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "검색어가 없습니다." }, { status: 400 });
  }

  const apiUrl = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=10`;

  const response = await fetch(apiUrl, {
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
