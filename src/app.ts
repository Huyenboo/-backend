import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import opinionRoutes from './routes/opinionRoutes';
import authRoutes from './routes/authRoutes'; 
import submissionRoutes from './routes/submissionRoutes';

// ✅ FIX 1: middlewaresフォルダからauthMiddlewareをインポート
import { authMiddleware } from './middlewares/auth'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// --- ルート定義 ---

app.use('/api', opinionRoutes);
app.use('/api/v1/auth', authRoutes);

// ✅ FIX 2: 正しく読み込まれているかログで確認
console.log('AuthMiddleware:', typeof authMiddleware); // 'function' になるはず
console.log('SubmissionRoutes:', typeof submissionRoutes); // 'function'（Routerのため）

// ✅ FIX 3: middlewareを正しく適用
// submissionRoutes内のすべてのルートを保護したい場合：
app.use('/api/v1/submission', authMiddleware, submissionRoutes);

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`✅ バックエンドサーバーが起動しました！`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});

export default app;