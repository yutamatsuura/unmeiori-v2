# sindankantei（鑑定書楽々作成ツール） - 要件定義書

## 1. プロジェクト概要

### 1.1 成果目標
九星気学・姓名判断・吉方位などの鑑定結果を自動生成し、プロ鑑定士が簡単にクライアント向け鑑定書を発行できるシステム

### 1.2 成功指標

#### 定量的指標
- 鑑定書作成時間を現在の10分から1分以内に短縮（90%削減）
- 月額課金ユーザー100名以上の獲得（6ヶ月以内）
- 鑑定士ユーザーの週3回以上の利用率50%以上
- PDF生成精度99%以上（エラー率1%未満）
- UTAGE連携による課金状態同期精度100%

#### 定性的指標
- 鑑定士が専門知識に集中でき、書類作成の負担から解放される
- 高品質で統一感のある鑑定書により顧客満足度が向上
- 九星気学の正確性を保ちながら、誰でも簡単に使える操作性
- 鑑定士の独自ブランディング（ロゴ・屋号）が反映された鑑定書
- クライアントへの即座な配信により迅速なサービス提供

## 2. 技術スタック（固定）

### 2.1 フロントエンド
- **フレームワーク**: React 18
- **ビルドツール**: Vite 5
- **言語**: TypeScript 5
- **UIライブラリ**: MUI v5 (Material-UI)
- **状態管理**: Zustand / TanStack Query
- **ルーティング**: React Router v6
- **APIクライアント**: Axios / OpenAPI Generator

### 2.2 バックエンド
- **言語**: Python 3.11+
- **フレームワーク**: FastAPI 0.100+
- **ORM**: SQLAlchemy 2.0 + Alembic
- **バリデーション**: Pydantic v2
- **認証**: FastAPI-Users / Auth0
- **非同期タスク**: Celery + Redis
- **API文書**: OpenAPI 3.0（自動生成）

### 2.3 データベース
- **メインDB**: PostgreSQL 15+ (Railway PostgreSQL推奨)
- **環境統一**: 開発・ステージング・本番すべてRailway PostgreSQL
- **キャッシュ**: Redis
- **マイグレーション**: SQLAlchemy + Alembic
- **ベクターDB**: Qdrant（RAG用、必要に応じて）

### 2.4 インフラ＆デプロイ
- **フロントエンド**: Vercel (React/Vite最適化)
- **バックエンド**: GCP Cloud Run (FastAPI最適化)
- **データベース**: NEON
- **AI処理**: RunPod (GPU処理) + OpenAI API
- **ベクターDB**: Qdrant Cloud (東京リージョン)
- **CI/CD**: GitHub Actions統合

### 2.5 開発環境＆ツール
- **Python**: 3.11+
- **Node.js**: 20.x LTS
- **パッケージマネージャー**: Poetry（Python）, pnpm（JavaScript）
- **コード品質**: Black, Ruff, ESLint, Prettier

## 3. ページ詳細仕様

### 3.1 P-001: ログインページ

#### 目的
シンプルなメール＋パスワード認証でUTAGE会員状態と連動したアクセス制御

#### 主要機能
- メール・パスワードによるログイン認証
- UTAGE Webhook連携による決済状態確認
- セッション管理・自動ログアウト
- 認証状態に基づくページリダイレクト

#### エンドポイント（FastAPI形式）
```python
@router.post("/api/auth/login")
async def login(credentials: LoginRequest) -> LoginResponse:
    """ログイン認証とUTAGE連携確認"""
    # UTAGE Webhook照合→決済状態確認→JWT発行

@router.get("/api/auth/verify")
async def verify_token(token: str = Depends(get_current_user)) -> UserResponse:
    """トークン検証と権限確認"""

@router.post("/api/auth/logout")
async def logout() -> MessageResponse:
    """ログアウト処理"""
```

#### 処理フロー
1. メール/パスワード入力
2. UTAGE Webhook照合・決済状態確認
3. 認証成功時はダッシュボードへリダイレクト
4. 認証失敗時はエラーメッセージ表示

#### データモデル（Pydantic）
```python
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    subscription_status: str

class UserResponse(BaseModel):
    id: int
    email: str
    subscription_status: str
    created_at: datetime
    updated_at: datetime
```

### 3.2 P-002: 鑑定書作成ページ

#### 目的
クライアント情報入力し九星気学・姓名判断・吉方位の統合鑑定書を1分で生成

#### 主要機能
- クライアント基本情報入力フォーム
- 九星気学・姓名判断の自動計算
- 81パターンテキストの自動取得
- リアルタイムプレビュー機能
- PDF鑑定書の即座生成

#### エンドポイント（FastAPI形式）
```python
@router.post("/api/kantei/calculate")
async def calculate_kantei(client_info: ClientInfoRequest) -> KanteiCalculationResponse:
    """九星気学・姓名判断の計算処理"""

@router.get("/api/kantei/templates")
async def get_kantei_templates() -> List[KanteiTemplate]:
    """81パターンテキストテンプレート取得"""

@router.post("/api/kantei/generate-pdf")
async def generate_pdf(kantei_data: KanteiDataRequest) -> PDFGenerationResponse:
    """PDF鑑定書生成"""
```

#### 処理フロー
1. クライアント基本情報入力（氏名、生年月日、性別等）
2. 九星気学・姓名判断の自動計算実行
3. 計算結果に基づく81パターンテキスト取得
4. 鑑定書内容のリアルタイムプレビュー
5. PDF鑑定書の生成・保存

#### データモデル（Pydantic）
```python
class ClientInfoRequest(BaseModel):
    name: str
    birth_date: date
    birth_time: Optional[str] = None
    gender: str
    birth_place: Optional[str] = None

class KanteiCalculationResponse(BaseModel):
    kyusei_kigaku: dict
    seimei_handan: dict
    kichihoui: dict
    template_ids: List[int]

class KanteiDataRequest(BaseModel):
    client_info: ClientInfoRequest
    calculation_result: KanteiCalculationResponse
    custom_message: Optional[str] = None
```

### 3.3 P-003: 鑑定書プレビュー・送信ページ

#### 目的
生成されたPDF鑑定書を確認し、メッセージ付きでクライアントへ即座に送信

#### 主要機能
- 生成PDF鑑定書のプレビュー表示
- 任意のメッセージ入力・編集機能
- クライアントメールアドレス入力
- PDF添付メール送信
- 送信履歴の記録・管理

#### エンドポイント（FastAPI形式）
```python
@router.get("/api/kantei/pdf/{id}")
async def get_pdf_preview(id: int) -> PDFPreviewResponse:
    """PDF鑑定書プレビュー取得"""

@router.post("/api/kantei/send-email")
async def send_kantei_email(email_data: EmailSendRequest) -> EmailSendResponse:
    """PDF添付メール送信"""

@router.post("/api/kantei/download")
async def download_pdf(pdf_id: int) -> FileResponse:
    """PDF鑑定書ダウンロード"""
```

#### 処理フロー
1. 生成されたPDF鑑定書のプレビュー表示
2. 任意メッセージの入力・編集
3. クライアントメールアドレス入力
4. PDF添付メール送信実行
5. 送信成功確認・履歴記録

#### データモデル（Pydantic）
```python
class EmailSendRequest(BaseModel):
    kantei_id: int
    client_email: EmailStr
    message: Optional[str] = None
    sender_name: Optional[str] = None

class EmailSendResponse(BaseModel):
    success: bool
    message_id: str
    sent_at: datetime

class PDFPreviewResponse(BaseModel):
    pdf_url: str
    kantei_data: dict
    created_at: datetime
```

### 3.4 P-004: 鑑定履歴管理ページ

#### 目的
過去の鑑定履歴を時系列表示し、PDFの再ダウンロードや再送信を可能に

#### 主要機能
- 鑑定履歴の時系列一覧表示
- 鑑定詳細情報の表示
- PDF鑑定書の再ダウンロード
- メール再送信機能
- 無期限履歴保存

#### エンドポイント（FastAPI形式）
```python
@router.get("/api/kantei/history")
async def get_kantei_history(page: int = 1, limit: int = 20) -> KanteiHistoryResponse:
    """鑑定履歴一覧取得"""

@router.get("/api/kantei/detail/{id}")
async def get_kantei_detail(id: int) -> KanteiDetailResponse:
    """鑑定詳細情報取得"""

@router.post("/api/kantei/resend/{id}")
async def resend_kantei(id: int, email_data: ResendRequest) -> EmailSendResponse:
    """鑑定書再送信"""
```

#### 処理フロー
1. 鑑定履歴一覧の時系列表示
2. 特定鑑定の詳細情報確認
3. PDF再ダウンロードまたは再送信選択
4. 再送信時のメールアドレス・メッセージ編集
5. 処理実行・結果確認

#### データモデル（Pydantic）
```python
class KanteiHistoryResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[KanteiHistoryItem]

class KanteiHistoryItem(BaseModel):
    id: int
    client_name: str
    created_at: datetime
    status: str
    sent_count: int

class KanteiDetailResponse(BaseModel):
    id: int
    client_info: dict
    calculation_result: dict
    pdf_url: str
    email_history: List[EmailHistory]
    created_at: datetime
```

### 3.5 P-005: テンプレート設定ページ

#### 目的
鑑定書のロゴ・屋号・基本デザインをカスタマイズして独自ブランディング

#### 主要機能
- ロゴ画像のアップロード・管理
- 屋号・事業者名の設定
- 鑑定書デザインテンプレート選択
- 色・フォント設定のカスタマイズ
- 設定内容のリアルタイムプレビュー

#### エンドポイント（FastAPI形式）
```python
@router.get("/api/template/settings")
async def get_template_settings() -> TemplateSettingsResponse:
    """テンプレート設定取得"""

@router.put("/api/template/update")
async def update_template_settings(settings: TemplateSettingsRequest) -> TemplateSettingsResponse:
    """テンプレート設定更新"""

@router.post("/api/template/upload-logo")
async def upload_logo(logo_file: UploadFile) -> LogoUploadResponse:
    """ロゴ画像アップロード"""
```

#### 処理フロー
1. 現在の設定内容表示
2. ロゴ画像のアップロード（JPG/PNG、最大2MB）
3. 屋号・事業者情報の入力
4. デザインテンプレート・色・フォント選択
5. リアルタイムプレビューでの確認
6. 設定保存・適用

#### データモデル（Pydantic）
```python
class TemplateSettingsRequest(BaseModel):
    logo_url: Optional[str] = None
    business_name: str
    operator_name: str
    color_theme: str = "default"
    font_family: str = "default"

class TemplateSettingsResponse(BaseModel):
    id: int
    logo_url: Optional[str]
    business_name: str
    operator_name: str
    color_theme: str
    font_family: str
    updated_at: datetime

class LogoUploadResponse(BaseModel):
    success: bool
    logo_url: str
    file_size: int
```

## 4. データベース設計概要

### 主要テーブル（SQLAlchemy）
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    subscription_status = Column(String, default="inactive")
    utage_user_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class KanteiRecord(Base):
    __tablename__ = "kantei_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    client_name = Column(String, nullable=False)
    client_info = Column(JSON, nullable=False)
    calculation_result = Column(JSON, nullable=False)
    pdf_url = Column(String, nullable=False)
    status = Column(String, default="created")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class EmailHistory(Base):
    __tablename__ = "email_history"
    
    id = Column(Integer, primary_key=True, index=True)
    kantei_record_id = Column(Integer, ForeignKey("kantei_records.id"))
    recipient_email = Column(String, nullable=False)
    message_content = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="sent")

class TemplateSettings(Base):
    __tablename__ = "template_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    logo_url = Column(String, nullable=True)
    business_name = Column(String, nullable=False)
    operator_name = Column(String, nullable=False)
    color_theme = Column(String, default="default")
    font_family = Column(String, default="default")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

## 5. 制約事項

### 外部API制限
- **UTAGE Webhook**: リアルタイム課金状態同期（応答時間3秒以内）
- **メール送信サービス**: 1日1000通制限（初期プラン）
- **PDF生成**: 1ファイル最大10MB、生成時間30秒以内

### 技術的制約
- **ファイルアップロード**: ロゴ画像最大2MB（JPG/PNG形式のみ）
- **データ保存**: 鑑定履歴無期限保存（削除機能なし）
- **並列処理**: PDF生成は同時最大5件まで
- **セキュリティ**: JWT認証、HTTPS必須

## 6. 主要VSA処理連鎖

### VSA-001: 鑑定書作成・送信フロー
**処理フロー**:
1. `POST /api/kantei/calculate` - クライアント情報から鑑定計算実行
2. **内部処理連鎖**:
   - 九星気学・姓名判断アルゴリズム実行
   - 81パターンテキストデータベース照合
   - 鑑定結果統合・整形
3. `POST /api/kantei/generate-pdf` - PDF鑑定書生成
4. `POST /api/kantei/send-email` - PDF添付メール送信

**外部依存**: UTAGE課金状態確認、メール送信サービス、PDF生成ライブラリ

### VSA-002: 認証・権限管理フロー
**処理フロー**:
1. `POST /api/auth/login` - ログイン認証
2. **内部処理連鎖**:
   - UTAGE Webhook照合
   - 課金状態確認・更新
   - JWT発行・セッション管理
3. `GET /api/auth/verify` - 各APIアクセス時の権限確認

**外部依存**: UTAGE Webhook、Redis（セッション管理）

## 7. Docker環境構成

### docker-compose.yml 基本構成
```yaml
services:
  backend:    # FastAPI + Python
    - SQLAlchemy + Alembic
    - PDF生成ライブラリ
    - メール送信機能
  frontend:   # React + Vite
    - TypeScript + MUI
    - OpenAPI Client
  db:         # PostgreSQL
    - 鑑定データ永続化
    - 履歴管理
  redis:      # キャッシュ・セッション管理
    - JWT認証状態
    - 一時データ保存
```

## 8. 必要な外部サービス・アカウント

### 必須サービス
| サービス名 | 用途 | 取得先 | 備考 |
|-----------|------|--------|------|
| UTAGE | 課金・会員管理 | https://utage-system.com | Webhook設定必須 |
| メール送信サービス | PDF添付メール送信 | SendGrid/Mailgun | 1日1000通制限 |
| PostgreSQL | データベース | NEON/Railway | 開発・本番共通 |

### オプションサービス
| サービス名 | 用途 | 取得先 | 備考 |
|-----------|------|--------|------|
| Redis Cloud | セッション管理 | Redis Labs | 無料プラン利用可 |
| CloudFlare | CDN・画像配信 | CloudFlare | ロゴ画像配信高速化 |

## 9. マイクロサービス型統合アーキテクチャ

### 9.1 統合方針
既存TypeScriptロジックを活用したマイクロサービス型統合（選択肢A）で実装する。

#### 統合対象システム
1. **九星気学システム**（Vue.js 2.6 + TypeScript）
   - 外部依存: なし（完全自己完結）
   - 年盤・月盤・日盤計算ロジック
   - 100%同一結果保証可能

2. **姓名判断システム**（Vue.js 2.6 + TypeScript）
   - 外部依存: kigaku-navi.com API
   - 文字情報取得・画数計算・五行判定
   - 鑑定結果テキスト取得

### 9.2 アーキテクチャ設計

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│               (鑑定書作成・プレビュー・送信)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/JSON API
┌─────────────────────▼───────────────────────────────────────┐
│                  FastAPI Gateway                           │
│          (メイン鑑定システム・認証・PDF生成)                    │
├─────────────────────┬───────────────────────────────────────┤
│   TypeScript Service Integrations   │  External APIs       │
├─────────────────────┼───────────────────┬─────────────────────┤
│  九星気学サービス      │  姓名判断サービス     │  kigaku-navi API    │
│  (Node.js/TS)      │  (Node.js/TS)     │  (外部)             │
│  ・年盤計算         │  ・文字情報取得       │  ・文字データ         │
│  ・月盤計算         │  ・画数計算          │  ・鑑定結果テキスト    │
│  ・日盤計算         │  ・五行判定          │                    │
│  ・吉方位計算       │  ・姓名判断実行       │                    │
└─────────────────────┴───────────────────┴─────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               PostgreSQL Database                          │
│        (ユーザー・鑑定履歴・テンプレート設定)                    │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 サービス分離設計

#### FastAPI メインサービス (Port: 5001)
- 認証・認可管理
- 鑑定書統合処理
- PDF生成・メール送信
- データベース管理

#### 九星気学サービス (Port: 5002)
```typescript
// 抽出必須ファイル（9ファイル）
src/js/bans/qseis/Qsei.ts           // 九星定義と計算
src/js/bans/dates/QseiDate.ts       // 九星暦変換
src/js/bans/units/Setu.ts           // 節入り計算
src/js/bans/units/Gogyou.ts         // 五行定義
src/js/bans/units/Houi.ts           // 方位定義
src/js/bans/units/Hakka.ts          // 八卦定義
src/js/times/LocalDate.ts           // 日付クラス
src/js/times/ChronoUnit.ts          // 時間計算
src/js/utils/TypeUtils.ts           // 型変換
```

#### 姓名判断サービス (Port: 5003)
```typescript
// コアロジック + API連携
src/js/seimeis/units/Seimei.ts      // 姓名データ構造
src/js/seimeis/units/Chara.ts       // 文字クラス
src/js/seimeis/units/Gogyou.ts      // 五行判定
src/js/seimeis/units/YouIn.ts       // 陰陽判定
src/js/seimeis/units/Kaku.ts        // 画数計算
+ kigaku-navi.com API連携ロジック
```

### 9.4 API設計

#### 九星気学サービス API
```
POST /kyusei/calculate
{
  "birthDate": "1990-05-15",
  "currentDate": "2023-12-25"
}
↓
{
  "nenban": {"star": 1, "name": "一白水星"},
  "getsuban": {"star": 5, "name": "五黄土星"},
  "nippan": {"star": 3, "name": "三碧木星"},
  "kichihoui": {...}
}
```

#### 姓名判断サービス API
```
POST /seimei/analyze
{
  "sei": "田中",
  "mei": "太郎"
}
↓
{
  "characters": [...],
  "kakusu": {...},
  "gogyou": {...},
  "kanteiResults": [...]
}
```

#### 統合鑑定 API
```
POST /api/kantei/calculate
{
  "clientInfo": {
    "name": "田中太郎",
    "birthDate": "1990-05-15",
    "gender": "male"
  }
}
↓
{
  "kyuseiKigaku": {...},
  "seimeiHandan": {...},
  "templateIds": [1, 5, 12]
}
```

### 9.5 キャッシュ戦略

#### Redis キャッシュ設計
```python
# 九星気学計算結果（1年間キャッシュ）
cache_key = f"kyusei:{birth_date}:{current_date}"
ttl = 31536000  # 1年

# 姓名判断文字情報（永続キャッシュ）
cache_key = f"seimei:chara:{character}"
ttl = -1  # 永続

# 鑑定結果テキスト（1ヶ月キャッシュ）
cache_key = f"kantei:result:{result_id}"
ttl = 2592000  # 1ヶ月
```

#### kigaku-navi API レート制限対応
- 同一リクエスト: 1秒間隔制限
- 文字情報取得: 永続キャッシュ
- 鑑定結果取得: 24時間キャッシュ

## 10. 今後の拡張予定

### フェーズ2
- 複数鑑定士アカウント対応（チーム機能）
- 鑑定書テンプレートのさらなるカスタマイズ
- クライアント管理機能（顧客データベース）

### フェーズ3
- モバイルアプリ対応
- 吉方位自動計算の高度化
- AIによる鑑定コメント生成支援

---