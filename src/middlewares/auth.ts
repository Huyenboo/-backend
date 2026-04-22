 // src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken'; // 'jsonwebtoken'でエラーが出る場合はこの形式でインポート

// 1. Payloadの構造を明確に定義
export interface TokenPayload {
  employee_id: number;
  role: string;
  iat: number;
  exp: number;
}

// 2. ExpressのRequestインターフェースを拡張し、Controllerでreq.user.employee_idを認識可能にする
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload; // 'any'の代わりにTokenPayloadを使用して型エラーを防ぐ
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 3. トークンを取得
  // req.cookiesを使用するには、app.tsで'cookie-parser'を設定する必要があります
  const token = req.cookies?.sid || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error_code: "AUTH_FAILED",
      message: "認証トークンが見つかりません。"
    });
  }

  try {
    // 4. トークンを検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

    // 5. reqにユーザー情報を設定
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error_code: "AUTH_FAILED",
      message: "トークンが無効または有効期限切れです。"
    });
  }
};