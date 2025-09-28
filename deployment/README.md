# マイクロサービス起動手順

## 基本構成
- **FastAPI メインサービス**: Port 5001
- **九星気学サービス (TypeScript)**: Port 5002
- **姓名判断サービス (TypeScript)**: Port 5003

## ローカル開発での起動方法

### 1. 個別起動（開発時）

#### FastAPIサービス（ポート5001）
```bash
cd services/fastapi-main
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### 九星気学サービス（ポート5002）
```bash
cd services/kyusei-service
npm install
npm start
```

#### 姓名判断サービス（ポート5003）
```bash
cd services/seimei-service
npm install
npm start
```

### 2. Docker Compose起動（本番環境）

**前提条件**: Docker Desktopが起動している必要があります

```bash
# すべてのサービスをビルドして起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d --build

# ログ確認
docker-compose logs

# 停止
docker-compose down
```

## ヘルスチェック

各サービスの動作確認：

```bash
# メインサービス
curl http://localhost:5001/health

# 九星気学サービス
curl http://localhost:5002/health

# 姓名判断サービス
curl http://localhost:5003/health
```

## ネットワーク

すべてのサービスは `microservices-network` という専用ネットワーク内で通信可能です。

## 注意事項

- 開発時は個別起動を推奨
- 本番デプロイ時はDocker Composeを使用
- ポート競合がある場合は既存プロセスを確認してください
  - `lsof -i :5001` (ポート5001の使用状況確認)