// app/layout.tsx (또는 RootLayout 파일)
import "./globals.css";
import Header from "../components/Header";
import { Providers } from "./providers";
import Footer from "../components/Footer";

export const metadata = {
  title: "E-Commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="pt-6 flex flex-col min-h-screen">
        <Providers>
          <Header />
          {/* 배경을 main에 적용하고 padding은 main 내부에서 통일 */}
          <main className="flex-1 bg-gray-100">
            {/* 페이지별로 중복된 최대 너비/패딩을 여기서 감싸면 편함 */}
            <div className="max-w-4xl mx-auto px-4 py-10">
              {children}
            </div>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
