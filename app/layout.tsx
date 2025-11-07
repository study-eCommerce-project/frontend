import "./globals.css";
import Header from "../components/Header";
import { UserProvider } from "../context/UserContext";

export const metadata = {
  title: "E-Commerce",
  description: "Next.js 로그인 테스트 앱",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {/* ✅ 전역으로 유저 상태 공유 */}
        <UserProvider>
          <Header />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
