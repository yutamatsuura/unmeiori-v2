FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 本番用依存関係のみをインストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# ポート5002を公開
EXPOSE 5002

# 非rootユーザーで実行
USER node

# アプリケーション起動
CMD ["npm", "start"]