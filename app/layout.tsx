import "./globals.css";
import { Providers } from "./providers";
import ClientRoot from "./ClientRoot";
import { WishlistProvider } from "../context/WishlistContext";

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
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Providers>
          <WishlistProvider>
            <ClientRoot>
              <main className="flex-1 w-full">{children}</main>
            </ClientRoot>
          </WishlistProvider>
        </Providers>
      </body>
    </html>
  );
}
