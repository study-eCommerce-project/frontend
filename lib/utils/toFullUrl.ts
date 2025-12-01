/**
 * [toFullUrl]
 * API 서버에서 제공하는 이미지 경로를 절대 URL로 변환하는 유틸 함수
 *
 * 사용 예:
 *   toFullUrl("/images/product/a.jpg")
 *   → "http://localhost:8080/images/product/a.jpg"
 *
 * 특징:
 * - 빈 값(null/undefined)일 때는 빈 문자열("") 반환
 * - 이미 http로 시작하는 절대 경로라면 그대로 반환
 * - 상대 경로라면 BACKEND API_URL 앞에 붙여 완전한 URL을 생성
 */
export const toFullUrl = (url?: string) => {
  if (!url) return "";                                // 안전 처리
  if (url.startsWith("http")) return url;             // 이미 절대 URL이면 그대로 사용
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;  // 서버 기반 URL 생성
};