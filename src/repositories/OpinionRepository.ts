import db from '../config/db';
import { IDBSubmissionData } from '../interfaces/Opinion';

export class OpinionRepository {
  // DBから意見データ一覧を取得するメソッド
  async findAll(): Promise<any[]> {
    // 取得用SQL：
    // ・submission_data（投稿データ）とsubmission_theme（テーマ）を結合
    // ・削除状態（deleted）以外のデータのみ取得
    // ・更新日時の降順で並び替え（最新が先頭）
    const sql = `
      SELECT 
        d.post_id, 
        d.category_code, 
        t.theme_title, 
        d.content_enc, 
        d.content_iv, 
        d.content_tag, 
        d.status, 
        d.updated_at
      FROM submission_data d
      JOIN submission_theme t ON d.theme_id = t.theme_id
      WHERE d.status != 'deleted'
      ORDER BY d.updated_at DESC
    `;

    // SQLを実行してデータを取得
    // db.executeは [rows, fields] の形式で返すため、rowsのみ取得
    const [rows] = await db.execute(sql);
    
    // 型情報が不明なため、一旦 any[] にキャストして返却
    // （Service層などで整形・型変換する想定）
    return rows as any[]; 
  }
}