# 運命織（unmeiori）デプロイガイド

## Phase 1: 最小構成デプロイ

### 事前準備

#### 1. Google Cloud プロジェクト作成
```bash
# Google Cloud SDKをインストール済みの場合
gcloud projects create unmeiori-production
gcloud config set project unmeiori-production

# 必要なAPIを有効化
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### 2. 環境変数の設定
`.env.production.template`をコピーして`.env.production`を作成し、以下の値を設定：

```env
# 本番ドメイン（Vercelデプロイ後に取得）
FRONTEND_URL=https://your-domain.vercel.app
CORS_ORIGIN=https://your-domain.vercel.app

# 本番データベース（Neon PostgreSQL）
DATABASE_URL=postgresql://username:password@host.neon.database:5432/dbname?sslmode=require

# セキュアなJWTシークレット
JWT_SECRET=OMi+GEaDMjwgtShIs3VJzm4VJp9LahJ9D6hij/11ZHo=
SESSION_SECRET=DNbDswRlC03AKl3yb+v2vmLNKAUvZjk8MU2yzP9YyzI=

# Google Cloud設定
GCP_PROJECT_ID=unmeiori-production
```

#### 3. GitHub Secrets 設定
以下のシークレットをGitHubリポジトリに設定：

- `GCP_PROJECT_ID`: Google Cloudプロジェクト ID
- `GCP_SA_KEY`: サービスアカウントJSONキー
- `DATABASE_URL`: Neon PostgreSQL接続文字列
- `JWT_SECRET_KEY`: JWTシークレットキー
- `CORS_ORIGIN`: フロントエンドのURL

### デプロイ手順

#### 1. バックエンドサービスのデプロイ
```bash
# 手動デプロイの場合
cd services/fastapi-main
docker build -t gcr.io/unmeiori-production/unmeiori-api .
docker push gcr.io/unmeiori-production/unmeiori-api

gcloud run deploy unmeiori-api \
  --image gcr.io/unmeiori-production/unmeiori-api \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1
```

#### 2. フロントエンドのデプロイ（Vercel）
```bash
cd frontend
vercel --prod
```

### 確認事項

#### 1. サービスの稼働確認
- [ ] FastAPI: `https://unmeiori-api-xxx.a.run.app/docs`
- [ ] 九星気学: `https://kyusei-service-xxx.a.run.app/health`
- [ ] 姓名判断: `https://seimei-service-xxx.a.run.app/health`
- [ ] フロントエンド: `https://your-domain.vercel.app`

#### 2. 機能テスト
- [ ] ユーザー登録・ログイン
- [ ] 鑑定計算（九星気学 + 姓名判断）
- [ ] PDF生成・ダウンロード
- [ ] 鑑定履歴表示

### トラブルシューティング

#### CORS エラーが発生する場合
1. フロントエンドのURLがCORS_ORIGINに正しく設定されているか確認
2. FastAPIサービスが正しく環境変数を読み込んでいるか確認

#### データベース接続エラーが発生する場合
1. Neon PostgreSQLの接続文字列が正しいか確認
2. SSL設定（`?sslmode=require`）が含まれているか確認

#### サービス間通信エラーが発生する場合
1. 各サービスのURLが正しく設定されているか確認
2. Cloud Runサービスが起動しているか確認

### 監視・ログ

#### Cloud Runメトリクス
- CPU使用率
- メモリ使用率
- リクエスト数
- エラー率

#### ログ確認
```bash
gcloud logs read "resource.type=cloud_run_revision" --limit 50
```

### コスト最適化

#### 現在の設定での予想コスト
- 月間1,000リクエスト: $35-50
- 月間10,000リクエスト: $119-189
- 月間100,000リクエスト: $309-509

#### 最適化のポイント
- 不要なリソースの自動削除
- CPU/メモリの適切なサイジング
- リクエスト数に応じたオートスケーリング

## 次のフェーズ

### Phase 2: マイクロサービス最適化
- サービス間通信の最適化
- キャッシュ機能の追加
- パフォーマンス監視の強化

### Phase 3: 高可用性対応
- マルチリージョンデプロイ
- 冗長化・バックアップ強化
- CDNキャッシングの最適化