import { Pool } from 'mysql2/promise';

export class SubmissionRepository {
  constructor(private db: Pool) {}

  async create(data: any) {
    const query = `
      INSERT INTO submission_data 
      (theme_id, form_id, employee_id, status, content_enc, content_iv, content_tag, category_code)
      VALUES (?, ?, ?, 'completed', ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute(query, [
      data.theme_id,
      data.form_id,
      data.employee_id,
      data.content_enc,
      data.content_iv,
      data.content_tag,
      data.category_code
    ]);
    return result;
  }
}