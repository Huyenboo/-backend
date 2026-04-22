import db from './config/db'; // Sử dụng config chuẩn đã chạy thành công
import crypto from 'crypto';
import dotenv from 'dotenv';

// 1. Nạp biến môi trường
dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const KEY_RAW = process.env.ENCRYPTION_KEY || '';

async function seedNewUser() {
  console.log("--- Bắt đầu khởi tạo nhân viên mẫu ---");

  // 2. Kiểm tra độ dài Key (AES-256 yêu cầu 32 bytes = 64 ký tự Hex)
  if (KEY_RAW.length !== 64) {
    console.error("❌ Lỗi: ENCRYPTION_KEY phải dài đúng 64 ký tự Hex.");
    process.exit(1);
  }

  const KEY = Buffer.from(KEY_RAW, 'hex');

  // 3. Thông tin nhân viên mới
  // LƯU Ý: Thay đổi email và employee_code nếu bạn muốn thêm nhiều người
  const newUser = {
    code: 'EMP002', 
    email: 'test2@example.com',
    name: 'Nguyễn Văn B',
    pass: 'password123', // Mật khẩu thô để mã hóa
    isAdmin: 0
  };

  try {
    // 4. Quy trình mã hóa mật khẩu AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let enc = cipher.update(newUser.pass, 'utf8');
    enc = Buffer.concat([enc, cipher.final()]);
    const tag = cipher.getAuthTag();

    // 5. Thực hiện SQL Insert vào bảng employee_master
    const sql = `
      INSERT INTO employee_master 
      (employee_code, email, full_name, password_enc, password_iv, password_tag, is_admin, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;

    await db.execute(sql, [
      newUser.code,
      newUser.email,
      newUser.name,
      enc,  // password_enc (VARBINARY)
      iv,   // password_iv (VARBINARY)
      tag,  // password_tag (VARBINARY)
      newUser.isAdmin
    ]);

    console.log("-----------------------------------------");
    console.log("✅ Thành công! Đã tạo nhân viên mới.");
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`🔑 Pass:  ${newUser.pass}`);
    console.log("-----------------------------------------");

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error(`❌ Lỗi: Nhân viên ${newUser.code} hoặc Email ${newUser.email} đã tồn tại.`);
    } else {
      console.error("❌ Lỗi trong quá trình Insert User:");
      console.error(error);
    }
  } finally {
    process.exit();
  }
}

// Chạy hàm
seedNewUser();