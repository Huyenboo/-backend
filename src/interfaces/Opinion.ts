export interface IOpinion {
  id: number;               // M03-COL-CHK（チェックボックス識別用）
  themeTitle: string;       // M03-COL-THEME（theme_title）
  categoryName: string;     // M03-COL-CATEGORY（マスタから取得した日本語名）
  content: string;          // 内容（詳細表示ロジックで使用）
  updatedAt: string;        // M03-COL-DATE（形式：YYYY-MM-DD HH:mm）
  status: string;           // M03-TBL-LISTにより'completed'である必要がある
}

export interface IDBSubmissionData {
  post_id: number;
  theme_id: string;
  theme_title: string;      // テーマ結合（join theme）
  category_code: string;   
  content_enc: Buffer;
  content_iv: Buffer;
  content_tag: Buffer;
  status: string;
  updated_at: Date;
}