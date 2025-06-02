# 技術仕様書.md - SketchTunes技術仕様

## 1. システム概要

### 1.1 アーキテクチャパターン
- **マイクロサービスアーキテクチャ** (将来的な拡張を考慮)
- **tRPC** (柔軟なデータ取得)
- **CDN** + **エッジキャッシング** (音楽ファイル配信最適化)

### 1.2 システム全体構成図
```
[フロントエンド] ←→ [API Gateway] ←→ [マイクロサービス群]
                                        ├── User Service
                                        ├── Music Service  
                                        ├── Comment Service
                                        ├── Notification Service
                                        └── Analytics Service
                         ↓
                    [データベース層]
                         ├── PostgreSQL (メタデータ)
                         ├── Redis (キャッシュ/セッション)
                         └── S3 (音楽ファイル)
```

## 2. フロントエンド技術仕様

### 2.1 基本技術スタック
- **React 19**
- **TypeScript 5.8**
- **Next.js 15**
- **Tailwind CSS 4.1.5**

### 2.2 状態管理
- **Zustand** (軽量な状態管理)
- **TanStack Query** (サーバー状態管理)
- **React Hook Form** (フォーム管理)

### 2.3 音楽プレイヤー実装
```typescript
// 音楽プレイヤーコアインターface
interface AudioPlayer {
  load(url: string): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(time: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  onTimeUpdate(callback: (time: number) => void): void;
}

// Web Audio API実装
class WebAudioPlayer implements AudioPlayer {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer;
  private source: AudioBufferSourceNode;
  private gainNode: GainNode;
  private analyser: AnalyserNode;
  
  // 波形データ取得
  getFrequencyData(): Uint8Array {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}
```

### 2.4 タイムスタンプコメント実装
```typescript
interface TimestampComment {
  id: string;
  musicId: string;
  userId: string;
  timestamp: number; // 秒数
  content: string;
  type: 'feedback' | 'question' | 'praise';
  position: { x: number; y: number }; // プレイヤー上の位置
  createdAt: Date;
}

// タイムライン上のコメント表示コンポーネント
const TimelineComments: React.FC<{
  comments: TimestampComment[];
  currentTime: number;
  duration: number;
}> = ({ comments, currentTime, duration }) => {
  // タイムライン上にコメントマーカーを配置
  return (
    <div className="relative w-full h-16 bg-gray-100">
      {comments.map(comment => (
        <CommentMarker
          key={comment.id}
          comment={comment}
          position={(comment.timestamp / duration) * 100}
          isActive={Math.abs(currentTime - comment.timestamp) < 1}
        />
      ))}
    </div>
  );
};
```

### 2.5 リアルタイム波形表示
```typescript
// 音楽波形可視化
class WaveformVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }
  
  renderWaveform(audioBuffer: AudioBuffer) {
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / this.canvas.width);
    const amp = this.canvas.height / 2;
    
    this.ctx.fillStyle = '#3B82F6';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      this.ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  }
}
```

## 3. バックエンド技術仕様

### 3.1 API設計
- **Node.js 20** + **Hono** (高パフォーマンス・軽量フレームワーク)
- **GraphQL** (Apollo Server) + **REST API** (ハイブリッド)
- **JWT認証** + **Refresh Token** (セキュリティ)

### 3.2 Hono アプリケーション設定
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { jwt } from 'hono/jwt';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

// 型定義
type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  S3_BUCKET: string;
  REDIS_URL: string;
};

type Variables = {
  user: {
    id: string;
    email: string;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ミドルウェア設定
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:3000', 'https://sketchtunes.com'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

// JWT認証ミドルウェア
app.use('/api/protected/*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });
  return jwtMiddleware(c, next);
});

// APIルーティング
app.route('/api/auth', authRoutes);
app.route('/api/tracks', trackRoutes);
app.route('/api/users', userRoutes);
app.route('/api/comments', commentRoutes);

export default app;
```

### 3.3 認証API実装
```typescript
import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { setCookie, getCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';

const auth = new Hono();

// ユーザー登録
auth.post('/register', async (c) => {
  try {
    const { email, username, password } = await c.req.json();
    
    // バリデーション
    if (!email || !username || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // ユーザー作成（DB操作）
    const user = await createUser({
      email,
      username,
      password: hashedPassword
    });
    
    // JWT生成
    const payload = {
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15分
    };
    
    const token = await sign(payload, c.env.JWT_SECRET);
    
    // リフレッシュトークン生成
    const refreshToken = await sign(
      { userId: user.id, type: 'refresh' },
      c.env.JWT_SECRET,
      'HS256'
    );
    
    // HTTPOnlyクッキーにリフレッシュトークン設定
    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 * 7, // 7日
    });
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken: token,
    });
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// ログイン
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // ユーザー検索
    const user = await findUserByEmail(email);
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // JWT生成
    const payload = {
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
    };
    
    const token = await sign(payload, c.env.JWT_SECRET);
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken: token,
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
});

export { auth as authRoutes };
```

### 3.4 楽曲API実装
```typescript
import { Hono } from 'hono';
import { streamText } from 'hono/streaming';

const tracks = new Hono();

// 楽曲一覧取得
tracks.get('/', async (c) => {
  try {
    const { page = '1', limit = '20', stage, genre } = c.req.query();
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // フィルター条件構築
    const filters: any = {};
    if (stage) filters.stage = stage;
    if (genre) filters.genre = genre;
    
    const tracks = await getTracksList({
      offset,
      limit: Number(limit),
      filters,
    });
    
    return c.json({
      tracks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: tracks.length,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch tracks' }, 500);
  }
});

// 楽曲詳細取得
tracks.get('/:id', async (c) => {
  try {
    const trackId = c.req.param('id');
    
    const track = await getTrackById(trackId);
    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }
    
    // 再生履歴記録
    await recordPlayHistory(trackId, c.var.user?.id);
    
    return c.json({ track });
  } catch (error) {
    return c.json({ error: 'Failed to fetch track' }, 500);
  }
});

// 楽曲アップロード
tracks.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('audio') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const stage = formData.get('stage') as string;
    const genre = formData.get('genre') as string;
    
    if (!file || !title) {
      return c.json({ error: 'Audio file and title are required' }, 400);
    }
    
    // ファイル検証
    await validateAudioFile(file);
    
    // 音楽ファイル処理
    const processor = new AudioFileProcessor();
    const processedFile = await processor.processUpload(file);
    
    // データベース保存
    const track = await createTrack({
      userId: c.var.user.id,
      title,
      description,
      stage,
      genre,
      fileUrl: processedFile.url,
      duration: processedFile.duration,
      waveformData: processedFile.waveform,
    });
    
    return c.json({ track }, 201);
  } catch (error) {
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// 楽曲ストリーミング
tracks.get('/:id/stream', async (c) => {
  try {
    const trackId = c.req.param('id');
    const quality = c.req.query('quality') || 'medium';
    
    const track = await getTrackById(trackId);
    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }
    
    // CDN URLを生成
    const optimizer = new AudioCDNOptimizer();
    const streamUrl = optimizer.generateStreamingUrl(trackId, quality as any);
    
    // リダイレクトまたはプロキシ
    return c.redirect(streamUrl, 302);
  } catch (error) {
    return c.json({ error: 'Streaming failed' }, 500);
  }
});

export { tracks as trackRoutes };
```

### 3.5 WebSocket実装（Hono + WebSocket）
```typescript
import { Hono } from 'hono';
import { upgradeWebSocket } from 'hono/ws';

const websocket = new Hono();

interface WebSocketMessage {
  type: 'join-track' | 'new-comment' | 'sync-playback';
  data: any;
}

const connectedUsers = new Map<string, WebSocket>();
const trackRooms = new Map<string, Set<string>>();

websocket.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onOpen: (evt, ws) => {
        console.log('WebSocket connection opened');
      },
      
      onMessage: (evt, ws) => {
        try {
          const message: WebSocketMessage = JSON.parse(evt.data.toString());
          
          switch (message.type) {
            case 'join-track':
              handleJoinTrack(ws, message.data.trackId, message.data.userId);
              break;
              
            case 'new-comment':
              handleNewComment(ws, message.data);
              break;
              
            case 'sync-playback':
              handleSyncPlayback(ws, message.data);
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      },
      
      onClose: (evt, ws) => {
        console.log('WebSocket connection closed');
        // クリーンアップ処理
        cleanupUserConnection(ws);
      },
    };
  })
);

function handleJoinTrack(ws: WebSocket, trackId: string, userId: string) {
  // ユーザーをトラックルームに追加
  if (!trackRooms.has(trackId)) {
    trackRooms.set(trackId, new Set());
  }
  trackRooms.get(trackId)!.add(userId);
  connectedUsers.set(userId, ws);
  
  // 参加通知
  ws.send(JSON.stringify({
    type: 'joined-track',
    data: { trackId, success: true }
  }));
}

function handleNewComment(ws: WebSocket, commentData: any) {
  // コメント保存
  saveComment(commentData).then(comment => {
    // 同じトラックの他のユーザーに通知
    const trackUsers = trackRooms.get(commentData.trackId);
    if (trackUsers) {
      trackUsers.forEach(userId => {
        const userWs = connectedUsers.get(userId);
        if (userWs && userWs !== ws) {
          userWs.send(JSON.stringify({
            type: 'comment-added',
            data: comment
          }));
        }
      });
    }
  });
}

export { websocket as websocketRoutes };
```

### 3.6 データベース設計

#### 3.6.1 PostgreSQL スキーマ
```sql
-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    skill_level ENUM('beginner', 'intermediate', 'advanced'),
    preferred_daw VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 楽曲テーブル
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    waveform_data JSONB, -- 波形データ
    duration INTEGER, -- 秒数
    bpm INTEGER,
    key_signature VARCHAR(10),
    stage ENUM('rough', 'demo', 'wip', 'experiment', 'complete') DEFAULT 'wip',
    genre VARCHAR(50),
    daw_used VARCHAR(50),
    creation_time INTEGER, -- 制作時間（分）
    privacy ENUM('public', 'followers', 'private') DEFAULT 'public',
    allow_comments BOOLEAN DEFAULT true,
    allow_remixes BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- コメントテーブル
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id), -- 返信用
    content TEXT NOT NULL,
    timestamp_seconds DECIMAL(10,3), -- 楽曲内の位置
    comment_type ENUM('feedback', 'question', 'praise', 'technical') DEFAULT 'feedback',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- フォローテーブル
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

-- 楽曲再生履歴
CREATE TABLE play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_played INTEGER -- 再生した秒数
);

-- タグテーブル
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 楽曲タグ関連
CREATE TABLE track_tags (
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (track_id, tag_id)
);
```

#### 3.6.2 Redis活用
```typescript
// Redis キャッシュ設計
interface CacheKeys {
  userSession: `session:${string}`;           // ユーザーセッション
  trackMetadata: `track:${string}:meta`;      // 楽曲メタデータ
  userFeed: `feed:${string}`;                 // ユーザーフィード
  trendingTracks: 'trending:tracks';          // トレンド楽曲
  waveformCache: `waveform:${string}`;        // 波形データ
}

// キャッシュ管理クラス
class CacheManager {
  private redis: Redis;
  
  async cacheTrackMetadata(trackId: string, metadata: any): Promise<void> {
    await this.redis.setex(`track:${trackId}:meta`, 3600, JSON.stringify(metadata));
  }
  
  async getCachedWaveform(trackId: string): Promise<number[] | null> {
    const cached = await this.redis.get(`waveform:${trackId}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

### 3.7 ファイル処理システム

#### 3.7.1 音楽ファイルアップロード
```typescript
// マルチパート音楽ファイル処理（Hono対応）
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

class AudioFileProcessor {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: 'ap-northeast-1',
    });
  }
  
  async processUpload(file: File): Promise<{
    url: string;
    duration: number;
    waveform: number[];
  }> {
    // 1. ファイル検証
    await this.validateAudioFile(file);
    
    // 2. ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 3. 波形データ生成
    const waveform = await this.generateWaveform(buffer);
    
    // 4. 音楽メタデータ抽出
    const metadata = await this.extractMetadata(buffer);
    
    // 5. S3アップロード
    const url = await this.uploadToS3(file.name, buffer);
    
    return {
      url,
      duration: metadata.duration,
      waveform
    };
  }
  
  private async validateAudioFile(file: File): Promise<void> {
    // ファイル拡張子チェック
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file format');
    }
    
    // ファイルサイズチェック（50MB制限）
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File too large');
    }
  }
  
  private async uploadToS3(fileName: string, buffer: Buffer): Promise<string> {
    const key = `audio/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: 'sketchtunes-audio-files',
      Key: key,
      Body: buffer,
      ContentType: 'audio/mpeg',
    });
    
    await this.s3Client.send(command);
    return `https://sketchtunes-audio-files.s3.amazonaws.com/${key}`;
  }
  
  private async generateWaveform(buffer: Buffer): Promise<number[]> {
    // FFmpegを使用した波形データ生成
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-f', 'f64le',
      '-ar', '8000',
      '-ac', '1',
      'pipe:1'
    ]);
    
    // 波形データ処理ロジック
    return [];
  }
}
```

#### 3.7.2 音楽ストリーミング最適化
```typescript
// 適応的ビットレート配信
class StreamingOptimizer {
  async createMultipleBitrates(sourceUrl: string): Promise<{
    low: string;    // 128kbps
    medium: string; // 256kbps  
    high: string;   // 320kbps
  }> {
    const qualities = [
      { name: 'low', bitrate: '128k' },
      { name: 'medium', bitrate: '256k' },
      { name: 'high', bitrate: '320k' }
    ];
    
    const results = await Promise.all(
      qualities.map(quality => this.transcodeAudio(sourceUrl, quality.bitrate))
    );
    
    return {
      low: results[0],
      medium: results[1], 
      high: results[2]
    };
  }
  
  // 接続品質に応じたビットレート選択
  selectOptimalBitrate(connectionSpeed: number): string {
    if (connectionSpeed > 1000000) return 'high';   // 1Mbps以上
    if (connectionSpeed > 500000) return 'medium';  // 500kbps以上
    return 'low';                                   // それ以下
  }
}
```

### 3.8 セキュリティミドルウェア
```typescript
// Honoセキュリティミドルウェア
import { Hono } from 'hono';
import { rateLimiter } from 'hono/rate-limiter';

// レート制限ミドルウェア
const createRateLimit = (windowMs: number, max: number) => {
  return rateLimiter({
    windowMs,
    limit: max,
    message: 'Too many requests',
    standardHeaders: 'draft-6',
    legacyHeaders: false,
  });
};

// API別レート制限設定
const apiLimits = {
  upload: createRateLimit(60 * 60 * 1000, 5),    // 1時間に5回
  comment: createRateLimit(60 * 1000, 10),        // 1分間に10回
  general: createRateLimit(15 * 60 * 1000, 100),  // 15分間に100回
};

// セキュリティヘッダー設定
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  await next();
});

// 認証済みユーザーの検証ミドルウェア
const requireAuth = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// 使用例
app.use('/api/tracks', apiLimits.general);
app.post('/api/tracks', apiLimits.upload, requireAuth, async (c) => {
  // 楽曲アップロード処理
});
```

## 4. インフラ・DevOps

### 4.1 AWS構成
```yaml
# Terraform設定例
resource "aws_ecs_cluster" "sketchtunes" {
  name = "sketchtunes-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_s3_bucket" "audio_files" {
  bucket = "sketchtunes-audio-files"
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["https://sketchtunes.com"]
    max_age_seconds = 3000
  }
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.audio_files.regional_domain_name
    origin_id   = "S3-sketchtunes-audio"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  # 音楽ファイル用キャッシュ設定
  default_cache_behavior {
    target_origin_id         = "S3-sketchtunes-audio"
    viewer_protocol_policy   = "redirect-to-https"
    cached_methods          = ["GET", "HEAD", "OPTIONS"]
    allowed_methods         = ["GET", "HEAD", "OPTIONS"]
    
    cache_policy_id = aws_cloudfront_cache_policy.audio_cache.id
  }
}
```

### 4.2 CI/CDパイプライン
```yaml
# GitHub Actions設定
name: SketchTunes CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: E2E tests
        run: npm run test:e2e

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Build Docker images
        run: |
          docker build -t sketchtunes/frontend:${{ github.sha }} ./frontend
          docker build -t sketchtunes/api:${{ github.sha }} ./api
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster sketchtunes-cluster \
            --service sketchtunes-frontend \
            --force-new-deployment
```

## 5. セキュリティ仕様

### 5.1 認証・認可（Hono対応）
```typescript
// JWT + Refresh Token実装（Hono）
import { sign, verify } from 'hono/jwt';

class AuthService {
  async generateTokens(userId: string, secret: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = await sign(
      { 
        userId, 
        type: 'access',
        exp: Math.floor(Date.now() / 1000) + 60 * 15 // 15分
      },
      secret
    );
    
    const refreshToken = await sign(
      { 
        userId, 
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7日
      },
      secret
    );
    
    return { accessToken, refreshToken };
  }
  
  async validateAudioFileUpload(file: File): Promise<boolean> {
    // ファイル拡張子チェック
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file format');
    }
    
    // ファイルサイズチェック（50MB制限）
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File too large');
    }
    
    return true;
  }
}
```

### 5.2 レート制限（Redis活用）
```typescript
// Redisベースレート制限
class RateLimiter {
  private redis: Redis;
  
  async checkLimit(
    key: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<boolean> {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
    }
    
    return current <= maxRequests;
  }
  
  // 音楽アップロード制限 (1時間に5曲まで)
  async checkUploadLimit(userId: string): Promise<boolean> {
    return this.checkLimit(`upload:${userId}`, 5, 3600000);
  }
  
  // コメント制限 (1分間に10件まで)
  async checkCommentLimit(userId: string): Promise<boolean> {
    return this.checkLimit(`comment:${userId}`, 10, 60000);
  }
}
```

## 6. 監視・ロギング

### 6.1 アプリケーション監視（Hono対応）
```typescript
// Prometheus メトリクス
import client from 'prom-client';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const audioUploadCounter = new client.Counter({
  name: 'audio_uploads_total',
  help: 'Total number of audio uploads',
  labelNames: ['user_id', 'file_format']
});

const activePlayersGauge = new client.Gauge({
  name: 'active_audio_players',
  help: 'Number of currently active audio players'
});

// Honoミドルウェアとして実装
app.use('*', async (c, next) => {
  const startTime = Date.now();
  
  await next();
  
  const duration = (Date.now() - startTime) / 1000;
  httpRequestDuration
    .labels(c.req.method, c.req.path, c.res.status.toString())
    .observe(duration);
});
```

### 6.2 ログ管理
```typescript
// 構造化ログ（Hono対応）
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sketchtunes-api-hono' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Honoログミドルウェア
app.use('*', async (c, next) => {
  const startTime = Date.now();
  
  await next();
  
  const duration = Date.now() - startTime;
  logger.info('HTTP Request', {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')
  });
});

// 使用例
logger.info('Audio file uploaded', {
  userId: 'user-123',
  trackId: 'track-456',
  fileSize: 1024000,
  duration: 180,
  uploadTime: Date.now()
});
```

## 7. パフォーマンス最適化

### 7.1 データベース最適化
```sql
-- 必要なインデックス
CREATE INDEX idx_tracks_user_created ON tracks(user_id, created_at DESC);
CREATE INDEX idx_tracks_stage_created ON tracks(stage, created_at DESC);
CREATE INDEX idx_comments_track_timestamp ON comments(track_id, timestamp_seconds);
CREATE INDEX idx_play_history_track ON play_history(track_id, played_at);

-- 楽曲検索用のGINインデックス
CREATE INDEX idx_tracks_search ON tracks USING gin(to_tsvector('english', title || ' ' || description));
```

### 7.2 フロントエンド最適化
```typescript
// 楽曲リストの仮想化
import { FixedSizeList as List } from 'react-window';

const VirtualizedTrackList: React.FC<{ tracks: Track[] }> = ({ tracks }) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <TrackCard track={tracks[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={tracks.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};

// 音楽プレイヤーのプリロード
const useAudioPreloader = () => {
  const preloadedAudio = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  const preloadTrack = useCallback((url: string) => {
    if (!preloadedAudio.current.has(url)) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = url;
      preloadedAudio.current.set(url, audio);
    }
  }, []);
  
  return { preloadTrack, preloadedAudio: preloadedAudio.current };
};
```

### 7.3 CDN最適化
```typescript
// 音楽ファイル配信最適化
class AudioCDNOptimizer {
  private readonly CDN_DOMAINS = [
    'cdn1.sketchtunes.com',
    'cdn2.sketchtunes.com',
    'cdn3.sketchtunes.com'
  ];
  
  // 地理的分散配信
  getOptimalCDNUrl(audioFileId: string, userLocation?: string): string {
    const hash = this.hashString(audioFileId);
    const domainIndex = hash % this.CDN_DOMAINS.length;
    
    // ユーザーの地理的位置に基づく最適化（将来実装）
    if (userLocation) {
      return this.getGeoOptimizedUrl(audioFileId, userLocation);
    }
    
    return `https://${this.CDN_DOMAINS[domainIndex]}/audio/${audioFileId}`;
  }
  
  // プログレッシブダウンロード対応
  generateStreamingUrl(audioFileId: string, quality: 'low' | 'medium' | 'high'): string {
    return `${this.getOptimalCDNUrl(audioFileId)}?quality=${quality}&streaming=true`;
  }
}
```

## 8. 開発・テスト戦略

### 8.1 テスト戦略（Hono対応）
```typescript
// ユニットテスト例（Vitest + Hono）
import { testClient } from 'hono/testing';
import { describe, test, expect } from 'vitest';
import app from '../src/app';

describe('Audio API', () => {
  const client = testClient(app);
  
  test('should get tracks list', async () => {
    const res = await client.api.tracks.$get();
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toHaveProperty('tracks');
    expect(Array.isArray(data.tracks)).toBe(true);
  });
  
  test('should require authentication for upload', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Track');
    
    const res = await client.api.tracks.$post({
      form: formData
    });
    
    expect(res.status).toBe(401);
  });
});

// 統合テスト例（Cypress）
describe('Track Upload Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
    cy.visit('/upload');
  });
  
  it('should upload track successfully', () => {
    // ファイルアップロード
    cy.get('[data-testid=file-upload]').selectFile('fixtures/test-track.mp3');
    
    // メタデータ入力
    cy.get('[data-testid=track-title]').type('Test Track');
    cy.get('[data-testid=stage-select]').select('demo');
    cy.get('[data-testid=genre-select]').select('electronic');
    
    // アップロード実行
    cy.get('[data-testid=upload-button]').click();
    
    // 成功確認
    cy.get('[data-testid=success-message]').should('be.visible');
    cy.url().should('include', '/tracks/');
  });
});
```

### 8.2 パフォーマンステスト
```typescript
// 負荷テスト設定（k6）
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // 100ユーザーまで徐々に増加
    { duration: '5m', target: 100 },   // 100ユーザーで5分間維持
    { duration: '2m', target: 200 },   // 200ユーザーまで増加
    { duration: '5m', target: 200 },   // 200ユーザーで5分間維持
    { duration: '2m', target: 0 },     // 0まで減少
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99%のリクエストが1.5秒以内
    http_req_failed: ['rate<0.1'],     // エラー率10%未満
  },
};

export default function () {
  // 楽曲一覧取得テスト
  let response = http.get('https://api.sketchtunes.com/tracks');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
  
  // 楽曲再生テスト
  if (response.json().tracks && response.json().tracks.length > 0) {
    const trackId = response.json().tracks[0].id;
    let audioResponse = http.get(`https://cdn.sketchtunes.com/audio/${trackId}`);
    check(audioResponse, {
      'audio file loaded': (r) => r.status === 200,
      'audio response time < 2s': (r) => r.timings.duration < 2000,
    });
  }
  
  sleep(2);
}
```

## 9. 開発・デプロイメント手順

### 9.1 ローカル開発環境
```bash
# 開発環境構築
git clone https://github.com/company/sketchtunes.git
cd sketchtunes

# Docker Compose起動
docker-compose up -d postgres redis

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local

# データベースマイグレーション
npm run db:migrate

# 開発サーバー起動（Hono）
npm run dev
```

### 9.2 Docker設定
```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# API Dockerfile（Hono対応）
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 9.3 package.json設定例
```json
{
  "name": "sketchtunes-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "bcryptjs": "^2.4.3",
    "@aws-sdk/client-s3": "^3.0.0",
    "redis": "^4.6.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 9.4 Hono エントリーポイント例
```typescript
// src/index.ts
import { serve } from '@hono/node-server';
import app from './app';

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Hono server running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
```

### 9.5 本番デプロイ手順
```bash
# 1. ビルド
npm run build

# 2. Docker イメージ作成
docker build -t sketchtunes/frontend:latest ./frontend
docker build -t sketchtunes/api:latest ./api

# 3. ECRにプッシュ
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin ECR_URI
docker tag sketchtunes/frontend:latest ECR_URI/sketchtunes/frontend:latest
docker push ECR_URI/sketchtunes/frontend:latest

# 4. ECS デプロイ
aws ecs update-service \
  --cluster sketchtunes-cluster \
  --service sketchtunes-frontend \
  --force-new-deployment

# 5. データベースマイグレーション
npm run db:migrate:prod
```

## 10. セキュリティチェックリスト

### 10.1 アプリケーションセキュリティ
- [ ] HTTPS強制設定
- [ ] CORS適切な設定
- [ ] CSP（Content Security Policy）設定
- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策
- [ ] ファイルアップロード検証
- [ ] レート制限実装
- [ ] 入力値検証・サニタイズ

### 10.2 インフラセキュリティ
- [ ] VPC設定
- [ ] セキュリティグループ最小権限
- [ ] IAMロール適切な権限設定
- [ ] S3バケットパブリックアクセス制限
- [ ] RDS暗号化有効
- [ ] CloudTrail有効
- [ ] WAF設定

## 11. 運用監視項目

### 11.1 アプリケーション監視
- [ ] API応答時間
- [ ] エラー率
- [ ] 楽曲アップロード成功率
- [ ] 音楽再生エラー率
- [ ] 同時接続ユーザー数
- [ ] データベース接続プール

### 11.2 インフラ監視
- [ ] CPU使用率
- [ ] メモリ使用率
- [ ] ディスク使用率
- [ ] ネットワーク帯域
- [ ] CDN キャッシュヒット率
- [ ] S3ストレージ使用量

この技術仕様書により、SketchTunesの開発・運用に必要な技術的詳細が完全に定義されました。