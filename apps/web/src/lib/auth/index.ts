import NextAuth, { User, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";

// 認証APIのベースパス
export const BASE_PATH = "/api/auth";

const authOptions: NextAuthConfig = {
    providers: [
        Github({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Credentials({
            name: "Credentials",
            // 認証フォームのフィールド
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" },
            },
            // 認証処理
            async authorize(credentials): Promise<User | null> {
                // ユーザー情報のダミーデータ
                const users = [
                    {
                        id: "test-user-1",
                        userName: "test1",
                        name: "Test 1",
                        password: "qk5lSJ3maQ0pqmOyadTQRgN1K",
                        email: "test1@example.com",
                    },
                    {
                        id: "test-user-2",
                        userName: "test2",
                        name: "Test 2",
                        password: "T2GapYCYK6wp8mJ1YUUnYpBMc",
                        email: "test2@example.com",
                    },
                ];
                // ユーザー情報の検索
                const user = users.find(
                    (user) =>
                        user.userName === credentials.username &&
                        user.password === credentials.password
                );
                // ユーザー情報の返却
                return user
                    ? { id: user.id, name: user.name, email: user.email }
                    : null;
            },
        }),
    ],
    // 認証APIのベースパス
    basePath: BASE_PATH,
    // シークレットキーの設定
    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);