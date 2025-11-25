import "../globals.css";
import { Providers } from "../providers";
import ClientRoot from "../ClientRoot";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <title>YDJ</title>
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <ClientRoot>{children}</ClientRoot>
        </Providers>
      </body>
    </html>
  );
}
