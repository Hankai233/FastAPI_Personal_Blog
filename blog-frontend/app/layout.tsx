import type { Metadata } from "next";
import "./globals.css";
import BodyWrapper from "@/components/BodyWrapper";

export const metadata: Metadata = {
  title: "My Blog",
  description: "Personal blog powered by FastAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <BodyWrapper>{children}</BodyWrapper>
      </body>
    </html>
  );
}
