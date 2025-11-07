"use client";
import { ReactNode } from "react";
import "./globals.css";
import Header from "../components/Header";
import { UserProvider } from "../context/UserContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head />
      <body className="bg-gray-100">
        <UserProvider>
          <Header />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
