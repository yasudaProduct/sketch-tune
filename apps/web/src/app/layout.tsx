import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { SideMenuProvider } from "@/contexts/SideMenuContext";
import { Header } from "@/components/track/Header";
import { SideMenu } from "@/components/navigation/SideMenu";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SketchTunes",
  description: "音楽ストリーミングアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <PlayerProvider>
              <SideMenuProvider>
                <div className="min-h-screen bg-gray-50">
                  {/* Header - 画面最上部に表示 */}
                  <Header />

                  {/* サイドメニューとメインコンテンツエリア */}
                  <div className="flex">
                    {/* サイドメニュー */}
                    <SideMenu />

                    {/* メインコンテンツ */}
                    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                      {children}
                    </main>
                  </div>
                </div>
              </SideMenuProvider>
            </PlayerProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
