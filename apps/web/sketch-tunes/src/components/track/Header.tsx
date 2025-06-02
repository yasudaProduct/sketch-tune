"use client";

import { Music, Menu } from "lucide-react";
import Link from "next/link";
import { useSideMenu } from "@/contexts/SideMenuContext";

export const Header = () => {
  const { toggle } = useSideMenu();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 w-full lg:z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              aria-label="メニューを開く"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <Link href="/" className="flex items-center ml-2 lg:ml-0">
              <Music className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                SketchTunes
              </span>
              <span className="ml-1 text-xs text-indigo-600">(作成中)</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
