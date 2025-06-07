"use client";

import React, { useEffect } from "react";
import { useSideMenu } from "@/contexts/SideMenuContext";
import { X, Home, Music, Heart, Settings, User, Upload } from "lucide-react";
import Link from "next/link";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "ホーム",
    href: "/",
  },
  {
    icon: <Upload className="h-5 w-5" />,
    label: "アップロード",
    href: "/upload",
  },
  {
    icon: <Heart className="h-5 w-5" />,
    label: "お気に入り",
    href: "/favorites",
  },
  {
    icon: <User className="h-5 w-5" />,
    label: "プロフィール",
    href: "/profile",
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "設定",
    href: "/settings",
  },
];

export const SideMenu = () => {
  const { isOpen, close } = useSideMenu();

  // エスケープキーでメニューを閉じる（モバイルのみ）
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.innerWidth < 1024) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // モバイルでのみスクロールを無効にする
      if (window.innerWidth < 1024) {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, close]);

  return (
    <>
      {/* オーバーレイ（モバイルのみ） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* サイドメニュー */}
      <aside
        className={`
          fixed top-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:border-r lg:border-gray-200 lg:shadow-none lg:top-16 lg:h-[calc(100vh-4rem)]
          h-full lg:static lg:z-auto
        `}
      >
        {/* ヘッダー（モバイルのみ） */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center">
            <Music className="h-6 w-6 text-indigo-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900">
              メニュー
            </span>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="メニューを閉じる"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* メニューアイテム */}
        <nav className="mt-6 lg:mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  onClick={() => {
                    // モバイルでのみメニューを閉じる
                    if (window.innerWidth < 1024) {
                      close();
                    }
                  }}
                  className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* フッター */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 lg:hidden">
          <div className="text-xs text-gray-500 text-center">
            SketchTunes v0.1
          </div>
        </div>
      </aside>
    </>
  );
};
