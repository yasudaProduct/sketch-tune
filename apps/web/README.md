# SketchTunes

音楽制作者向けのスケッチ・デモ共有プラットフォーム

## 概要

SketchTunesは、音楽制作過程の楽曲（スケッチ、デモ、ワークインプログレス）を共有し、<br>
コミュニティからフィードバックを受け取ることができるWebアプリケーションです。<br>
楽曲アップロードの敷居を下げることでDTM初心者のモチベーション持続を狙います。<br>
制作段階の楽曲に対してタイムスタンプコメントを付けることで、具体的で建設的なフィードバックを可能にします。<br>

## 主な機能

### 🎵 楽曲管理
- 楽曲のアップロード・ストリーミング再生
- 制作段階別の楽曲分類（スケッチ・デモ・ワークインプログレス）
- DAW、プラグイン、使用楽器情報の管理
- ジャンル分類とタグ機能

### 🎧 音楽プレイヤー
- 波形ビジュアライザー表示
- シーク機能・音量調整
- レスポンシブデザイン対応

### 💬 コミュニティ機能
- タイムスタンプベースのコメント機能
- 楽曲へのいいね・再生数トラッキング
- ユーザープロフィール・アバター表示

## 技術スタック

### フロントエンド
- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**

### バックエンド
- **Hono**
- **Drizzle ORM**
- **Auth.js**

### 開発ツール
- **ESLint**
- **Turbopack**
- **Bun**

## 開発環境のセットアップ

### 必要な環境
- Node.js 18+ または Bun
- npm/yarn/bun

### .env
```bash
cd ./apps/web
touch .env
```

```.env
# Auth.js
AUTH_SECRET="8iuUAndNm2JXZ36WCvThdq+9mmu3JM1MJE40sETLcC8="
NEXTAUTH_URL=http://localhost:3000

# Auth Github
GITHUB_ID=Ov23li1zYDvNFVtsmsnK
GITHUB_SECRET=548dfe5d1491d914d5ffbfef7e648e5299226aa8
```

### インストール

```bash
# 依存関係のインストール
bun install

# または
npm install
```

### 開発サーバーの起動

```bash
# 開発サーバー（Turbopack使用）
bun dev

# または
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

### その他のコマンド

```bash
# プロダクションビルド
bun run build

# プロダクションサーバー起動
bun start

# ESLint実行
bun run lint
```

## プロジェクト構造
```
src/
├── app/
│ ├── api/ # APIルート（Hono）
│ ├── track/ # 楽曲詳細ページ
│ ├── upload/ # アップロードページ
│ └── page.tsx # ホームページ
├── components/
│ ├── audio/ # 音楽プレイヤー関連
│ ├── navigation/ # ナビゲーション
│ ├── track/ # 楽曲表示関連
│ └── ui/ # 汎用UIコンポーネント(shadcn/ui)
├── contexts/
│ ├── PlayerContext.tsx
│ ├── SideMenuContext.tsx
│ └── ToastContext.tsx
├── lib/ # ライブラリ・ユーティリティ
└── utils/ # ヘルパー関数
```

## API仕様

### Tracks API

🚧 **作成中**