/**
 * [toFullUrlCDN]
 * CDN(무신사 이미지 CDN 등) 전용 절대 URL 생성 함수
 *
 * 사용 예:
 *   toFullUrlCDN("/thumbnails/a.png")
 *   → "https://image.msscdn.net/thumbnails/a.png"
 *
 * 특징:
 * - API 서버가 아닌 CDN 이미지 접근용 (정적 리소스)
 * - url이 없거나 http로 시작하면 그대로 처리
 */
export const toFullUrlCDN = (url?: string) => {
  if (!url) return "";                     // URL 없음
  if (url.startsWith("http")) return url;  // 이미 절대 경로면 그대로 사용
  return `https://image.msscdn.net${url}`; // CDN URL 접두어 자동 부착
};