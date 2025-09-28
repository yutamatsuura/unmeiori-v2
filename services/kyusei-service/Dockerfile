FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 本番用依存関係のみをインストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# Cloud Runのポートを公開（環境変数PORTまたはデフォルト8080）
EXPOSE 8080

# 非rootユーザーで実行
USER node

# アプリケーション起動
CMD ["npm", "start"]