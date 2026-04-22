import db from '../config/db'; // Đường dẫn đến file cấu hình kết nối DB của bạn

export class EmployeeRepository {
  async findByEmail(email: string): Promise<any | null> {
    const sql = `
      SELECT 
        employee_id, 
        email, 
        full_name, 
        password_enc, 
        password_iv, 
        password_tag, 
        is_admin, 
        status
      FROM employee_master 
      WHERE email = ? AND status = 'active' 
      LIMIT 1
    `;

    try {
      const [rows]: any = await db.execute(sql, [email]);
      if (rows.length === 0) return null;
      return rows[0];
    } catch (error) {
      console.error("Database Error in EmployeeRepository:", error);
      throw error;
    }
  }
}