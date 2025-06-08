"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Mail, Lock, User, Github, Loader2 } from "lucide-react";
import { singUp } from "./action";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("すべての項目を入力してください");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      setIsLoading(false);
      return;
    }

    try {
      // 登録成功後、自動ログイン
      const result = await singUp(
        formData.name,
        formData.email,
        formData.password
      );

      if (result?.isSuccess) {
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          callbackUrl: "/",
        });
      }

      if (result?.error) {
        setError("アカウントの作成に失敗しました");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("サインアップエラー:", err);
      setError("アカウントの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setIsGithubLoading(true);
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch (err) {
      console.error("GitHubサインアップエラー:", err);
      setError("GitHubでのサインアップに失敗しました");
    } finally {
      setIsGithubLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <Music className="h-12 w-12 text-indigo-600" />
          </Link>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            SketchTunesへようこそ
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                お名前
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="pl-10"
                  placeholder="山田太郎"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="pl-10"
                  placeholder="example@sketchtunes.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* パスワード入力 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="pl-10"
                  placeholder="8文字以上で入力"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* パスワード確認入力 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード（確認）
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="pl-10"
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  アカウントを作成中...
                </>
              ) : (
                "アカウントを作成"
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGithubSignUp}
              disabled={isGithubLoading}
            >
              {isGithubLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  GitHubで続行中...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  GitHubでサインアップ
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちですか？{" "}
            <Link
              href="/api/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              ログイン
            </Link>
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            サインアップすることで、{" "}
            <Link href="/terms" className="underline hover:text-gray-700">
              利用規約
            </Link>{" "}
            と{" "}
            <Link href="/privacy" className="underline hover:text-gray-700">
              プライバシーポリシー
            </Link>{" "}
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}
