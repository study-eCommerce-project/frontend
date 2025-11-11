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
      <body className="pt-16 flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="m-0 p-0 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
