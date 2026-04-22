import { Request, Response } from 'express';
import { OpinionService } from '../services/OpinionService';

export class OpinionController {
  
  private service = new OpinionService();

  // 意見一覧を取得するAPIハンドラー
  getOpinions = async (req: Request, res: Response) => {
    try {
      // サービス層から全ての意見データを取得（DBアクセスなどはService側で処理）
      const data = await this.service.getAllOpinions();

      // 取得したデータをJSON形式でクライアントに返却
      res.json(data);
    } catch (error) {
      // エラー内容をサーバーログに出力（デバッグ用）
      console.error(error);

      // クライアントには500エラー（サーバー内部エラー）を返却
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}