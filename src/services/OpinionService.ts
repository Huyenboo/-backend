import { OpinionRepository } from '../repositories/OpinionRepository';
import { IOpinion, IDBSubmissionData } from '../interfaces/Opinion';
import crypto from 'crypto';

export class OpinionService {
  private repository = new OpinionRepository();
  private readonly ALGORITHM = 'aes-256-gcm';

  // Định nghĩa Code Master (category_name) theo M03-COL-CATEGORY
  private readonly CATEGORY_NAME_MASTER: Record<string, string> = {
    'welfare': '福利厚生',
    'work': '業務改善',
    'relation': '人間関係',
    'other': 'その他'
  };

  private getEncryptionKey(): Buffer {
    const keyStr = process.env.ENCRYPTION_KEY || '';
    return Buffer.from(keyStr, 'hex');
  }

  async getAllOpinions(): Promise<IOpinion[]> {
    const KEY = this.getEncryptionKey();

    try {
      const rawData: IDBSubmissionData[] = await this.repository.findAll();

      // Chỉ hiển thị 投稿状態 = completed theo M03-TBL-LIST
      const completedData = rawData.filter(row => row.status === 'completed');

      return completedData.map((row): IOpinion => {
        try {
          // Giải mã nội dung
          const decipher = crypto.createDecipheriv(this.ALGORITHM, KEY, row.content_iv);
          decipher.setAuthTag(row.content_tag);
          let decrypted = decipher.update(row.content_enc as Buffer, undefined, 'utf8');
          decrypted += decipher.final('utf8');
          const contentObj = JSON.parse(decrypted);

          return {
            id: row.post_id,
            themeTitle: row.theme_title, // Lấy từ bảng Master Theme
            categoryName: this.CATEGORY_NAME_MASTER[row.category_code] || 'その他',
            content: contentObj.comment || '', 
            updatedAt: this.formatDateTime(row.updated_at), 
            status: row.status
          };
        } catch (error) {
          console.warn(`[ID ${row.post_id}] Decrypt failed`);
          return {
            id: row.post_id,
            themeTitle: row.theme_title,
            categoryName: this.CATEGORY_NAME_MASTER[row.category_code] || 'error',
            content: "【復号失敗】",
            updatedAt: this.formatDateTime(row.updated_at),
            status: row.status
          };
        }
      });
    } catch (dbError) {
      console.error("Database Error:", dbError);
      throw dbError;
    }
  }

  // Định dạng ngày: YYYY-MM-DD HH:mm theo M03-COL-DATE
  private formatDateTime(date: Date): string {
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}