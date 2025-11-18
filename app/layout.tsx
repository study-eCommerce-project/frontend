"use client"

import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // intro 페이지면 Header와 Footer 숨김
  const showHeaderFooter = pathname !== '/intro';
  
  return (
    <html lang="ko">
      <head>
        <title>YDJ</title>
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers>
          {showHeaderFooter && <Header />}
          {/* 배경을 main에 적용하고 padding은 Header 유무에 따라 달라지도록 */}
          <main className={`flex-1 bg-gray-100 overflow-x-hidden ${showHeaderFooter ? 'py-16' : 'p-0'}`}>
            {/* 페이지별로 중복된 최대 너비/패딩을 여기서 감싸면 편함 */}
            <div className={showHeaderFooter ? "max-w-4xl mx-auto px-4" : "w-full h-full flex items-center justify-center"}>
              {children}
            </div>
          </main>
          {showHeaderFooter && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
