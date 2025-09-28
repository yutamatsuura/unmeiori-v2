FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 全依存関係をインストール（ビルドに必要）
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# 本番用依存関係のみを再インストール
RUN npm ci --omit=dev && npm cache clean --force

# Cloud Runのポートを公開（環境変数PORTまたはデフォルト8080）
EXPOSE 8080

# 非rootユーザーで実行
USER node

# ビルド済みJavaScriptを実行
CMD ["node", "dist/index.js"]