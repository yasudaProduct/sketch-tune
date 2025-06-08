"use client";

import { Music, Menu, User, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { useSideMenu } from "@/contexts/SideMenuContext";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export const Header = () => {
  const { toggle } = useSideMenu();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

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

          <div className="flex items-center space-x-4">
            {session && session.user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {session.user.name}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2 hidden sm:block">ログアウト</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/api/auth/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="ml-2">ログイン</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    新規登録
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
