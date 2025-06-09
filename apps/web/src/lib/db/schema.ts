import {
    boolean,
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    real,
    pgEnum,
} from "drizzle-orm/pg-core"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import type { AdapterAccountType } from "next-auth/adapters"
import { env } from "../../../env"
import { neon } from "@neondatabase/serverless"
import type { InferSelectModel } from "drizzle-orm"

export const db =
    env.NODE_ENV === "development"
        ? drizzle(postgres(env.AUTH_DRIZZLE_URL, { max: 1 }))
        : drizzleNeon(neon(env.AUTH_DRIZZLE_URL))

// Enums
export const trackStageEnum = pgEnum('track_stage', ['sketch', 'demo', 'work_in_progress', 'completed']);
export const trackVisibilityEnum = pgEnum('track_visibility', ['public', 'unlisted', 'private']);

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    hashedPassword: text('hashedPassword'),
    image: text("image"),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date()),
})

// Genres テーブル
export const genres = pgTable("genre", {
    id: integer("id")
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Tags テーブル
export const tags = pgTable("tag", {
    id: integer("id")
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Tracks テーブル
export const tracks = pgTable("track", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    // ファイル情報
    fileUrl: text("fileUrl").notNull(), // 音楽ファイルのURL
    fileName: text("fileName").notNull(),
    fileSize: integer("fileSize"), // バイト単位
    duration: real("duration"), // 秒単位

    // 制作段階
    stage: trackStageEnum("stage").notNull().default("sketch"),
    visibility: trackVisibilityEnum("visibility").notNull().default("public"),

    // 制作情報
    daw: text("daw"), // 使用DAW (Logic Pro, Ableton Live, etc.)
    plugins: text("plugins"), // 使用プラグイン (JSON配列として保存)
    instruments: text("instruments"), // 使用楽器 (JSON配列として保存)
    bpm: integer("bpm"), // テンポ
    key: text("key"), // キー (C major, A minor, etc.)

    // メタデータ
    genreId: integer("genreId").references(() => genres.id),

    // 統計
    playCount: integer("playCount").notNull().default(0),

    // タイムスタンプ
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date()),
})

// Track-Tags 関連テーブル (多対多)
export const trackTags = pgTable("track_tag", {
    id: integer("id")
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    trackId: text("trackId")
        .notNull()
        .references(() => tracks.id, { onDelete: "cascade" }),
    tagId: integer("tagId")
        .notNull()
        .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Comments テーブル (タイムスタンプコメント機能)
export const comments = pgTable("comment", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    trackId: text("trackId")
        .notNull()
        .references(() => tracks.id, { onDelete: "cascade" }),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),

    // タイムスタンプコメント用
    timestamp: real("timestamp"), // 楽曲内の時間（秒）

    // 返信機能用（自己参照）
    parentId: text("parentId"),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date()),
})

// Likes テーブル
export const likes = pgTable("like", {
    trackId: text("trackId")
        .notNull()
        .references(() => tracks.id, { onDelete: "cascade" }),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (like) => [
    {
        // ユーザーは1つの楽曲に1回のみいいね可能
        compositePk: primaryKey({
            columns: [like.userId, like.trackId],
        }),
    },
])

// Play History テーブル (再生履歴・統計用)
export const playHistory = pgTable("play_history", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    trackId: text("trackId")
        .notNull()
        .references(() => tracks.id, { onDelete: "cascade" }),
    userId: text("userId").references(() => users.id, { onDelete: "set null" }), // 匿名再生も可能
    userAgent: text("userAgent"), // ブラウザ情報
    ipAddress: text("ipAddress"), // IP アドレス (匿名化)
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// 型定義のエクスポート
export type User = InferSelectModel<typeof users>
export type Track = InferSelectModel<typeof tracks>
export type Comment = InferSelectModel<typeof comments>
export type Like = InferSelectModel<typeof likes>
export type Genre = InferSelectModel<typeof genres>
export type Tag = InferSelectModel<typeof tags>

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        {
            compoundKey: primaryKey({
                columns: [account.provider, account.providerAccountId],
            }),
        },
    ]
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        {
            compositePk: primaryKey({
                columns: [verificationToken.identifier, verificationToken.token],
            }),
        },
    ]
)

export const authenticators = pgTable(
    "authenticator",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: boolean("credentialBackedUp").notNull(),
        transports: text("transports"),
    },
    (authenticator) => [
        {
            compositePK: primaryKey({
                columns: [authenticator.userId, authenticator.credentialID],
            }),
        },
    ]
)