/**
 * RootLayout의 역할
 * 1) 페이지 전체에 공통적인 HTML 구조 제공
 * 2) metadata, <html>, <body> 같은 '문서 레벨' 설정
 * 3) 전역 Provider를 감싸되, Server Component 제약을 지켜야 함
 *
 * Providers + WishlistProvider + ClientRoot 구조 이유
 * - Providers(User + Cart)는 "use client"라서 Client Component 필요
 * - WishlistProvider 역시 클라이언트 훅을 사용하므로 Providers 영역 안에서 실행해야 함
 * - ClientRoot는 전역 상태 초기화나 Layout hydration 같은 클라이언트 사이드 작업을 담당.
 */
import "./globals.css";
import { Providers } from "./providers";
import ClientRoot from "./ClientRoot";
import { WishlistProvider } from "../context/WishlistContext"; // 경로는 프로젝트 구조에 맞게 조정
import React from "react";
import Script from "next/script";
import { Toaster } from "react-hot-toast";


export const metadata = {
  title: "YDJ",
  description: "Your Daily Journey",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />

         {/* 카카오 주소 검색 API */}
        <Script
          src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />

        {/* PortOne 결제 SDK */}
        <Script
          src="https://cdn.portone.io/v2/browser-sdk.js"
          strategy="beforeInteractive"
        />

      </head>
      {/** body는 Server Component지만, 내부에 Client Component는 넣어도 됨 */}
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">

        {/**
         * 모든 글로벌 Provider는 여기에서만 감싸면 된다!
         * - 아래 순서가 유지되어야 정상 작동:
         *   1) Providers(User, Cart)
         *   2) WishlistProvider
         *   3) ClientRoot
         */}
        <Providers>
          <WishlistProvider>
            <ClientRoot>
              <main className="flex-1 w-full">{children}</main>
              <Toaster />
            </ClientRoot>
          </WishlistProvider>
        </Providers>
      </body>
    </html>
  );
}
