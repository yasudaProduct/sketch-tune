import NextAuth, { User, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/drizzle";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { eq } from "drizzle-orm";
import { env } from "../../../env";

// 認証APIのベースパス
export const BASE_PATH = "/api/auth";

const authOptions: NextAuthConfig = {
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'github') return true // いる？

            if (account?.provider !== 'credentials') return false // いる？

            if (!user.id) return false

            const existingUser = await db.query.users.findFirst({
                where: eq(users.id, user.id),
            })

            if (!existingUser) return false

            return true
        },
    },
    providers: [
        Github({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Credentials({
            name: "Credentials",
            // 認証フォームのフィールド
            credentials: {
                email: { label: "メールアドレス", type: "email", placeholder: "test@example.com" },
                password: { label: "パスワード", type: "password" },
            },
            // 認証処理
            async authorize(credentials): Promise<User | null> {
                // ユーザー情報のダミーデータ
                // const users = [
                //     {
                //         id: "test-user-1",
                //         userName: "test1",
                //         name: "Test 1",
                //         password: "qk5lSJ3maQ0pqmOyadTQRgN1K",
                //         email: "test1@example.com",
                //     },
                //     {
                //         id: "test-user-2",
                //         userName: "test2",
                //         name: "Test 2",
                //         password: "T2GapYCYK6wp8mJ1YUUnYpBMc",
                //         email: "test2@example.com",
                //     },
                // ];

                // // ユーザー情報の検索(ダミーデータ)
                // const user = users.find(
                //     (user) =>
                //         user.email === credentials.email &&
                //         user.password === credentials.password
                // );

                if (
                    !(
                        typeof credentials?.email === 'string' &&
                        typeof credentials?.password === 'string'
                    )
                ) {
                    throw new Error('Invalid credentials.')
                }

                // ユーザー情報の検索(データベース)
                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email),
                })

                // パスワードの検証

                // ユーザー情報の返却
                return user
                    ? { id: user.id, name: user.name, email: user.email }
                    : null;
            },
        }),

    ],
    pages: {
        // signIn: '/signin',
        newUser: '/signup',
    },
    basePath: BASE_PATH,
    session: { strategy: 'jwt' },
    secret: env.AUTH_SECRET,
    debug: env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);