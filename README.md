backend/
├── src/
│   ├── config/           # 設定ファイル (データベース接続など)
│   ├── controllers/      # コントローラー (リクエスト・レスポンス制御)
│   ├── interfaces/       # インターフェース (TypeScript型定義)
│   ├── repositories/     # リポジトリ (DB操作・SQLクエリ)
│   ├── routes/           # ルーティング (APIパス定義)
│   ├── services/         # サービス (ビジネスロジック層)
│   └── app.ts            # Expressアプリ初期化
├── .env                  # 環境変数
├── tsconfig.json         # TypeScript設定
└── package.json          # 依存関係管理


1.package.json を初期化する

npm init -y

2.主要なライブラリ（Dependencies）をインストールする

npm install express mysql2 dotenv cors

3.開発用ライブラリ（Dev Dependencies）をインストールする

npm install -D typescript @types/express @types/node @types/cors ts-node-dev

4.TypeScript の設定ファイル（tsconfig.json）を初期化する

npx tsc --init


5.tsconfig.json を更新

6..envを作成


