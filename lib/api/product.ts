/**
 * 📌 Client-side API Helper (프론트엔드 → 백엔드 요청)
 * ----------------------------------------------------
 * 이 파일은 프론트 컴포넌트 또는 훅에서 재사용하는
 * "백엔드(Spring 서버) 요청용 함수"들을 모아둔 곳이다.
 * 
 * ✔ 브라우저에서 실행됨
 * ✔ 백엔드(Spring Boot) API 호출 용도
 * ✔ 여러 컴포넌트에서 재사용 가능 (useProduct, useCategory 등)
 *
 * ⚠️ 주의: 이 파일은 Next.js API Route가 아니므로
 *    /app/api/* 와 합치면 안 된다.
 *    /app/api → Next.js 서버 라우트
 *    /lib/api → 프론트 요청 유틸 함수
 */
import { Product } from "@/types/product";

// 백엔드 API 기본 URL (환경변수에서 가져옴)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * 특정 카테고리(leafCode) 기준으로 상품 목록 조회
 *
 * @param leafCode - 최하위 카테고리 코드
 * @returns Product[] - 해당 카테고리의 상품 리스트
 */
export async function fetchProductsByCategory(leafCode: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products/category/${leafCode}`);

  if (!res.ok) {
    throw new Error("상품 조회 실패");
  }

  // 서버 오류 처리
  return res.json();
}

/**
 * 상품 상세 정보 조회
 *
 * @param id - 상품 ID
 * @returns Product 상세 정보
 *
 * credentials: "include" → 쿠키(세션) 포함해서 요청 (로그인 상태 유지)
 */
export async function fetchProductDetail(id: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}/api/products/${id}/detail`, {
    credentials: "include",  // 세션 기반 로그인 유지
    cache: "no-store"        // 캐싱 금지 → 항상 최신 데이터 받음
  });
  return res.json();
}

/**
 * 상품 좋아요 토글 (좋아요 / 좋아요 취소 전환)
 *
 * @param productId - 상품 ID
 * @returns { liked: boolean, likes: number }
 *
 * method: "POST" 로 좋아요 토글 요청
 * credentials: "include" → 로그인한 사용자만 가능
 */
export async function toggleLike(productId: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${API_URL}/api/like/toggle/${productId}`, {
      method: "POST",
      credentials: "include",
      cache: "no-store"  // 캐시 제거 -> 회원이 좋아요한 상품 확인을 위함
  });

  if (!res.ok) throw new Error("Like request failed");
  return res.json();
}



