import db from './config/db';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Nạp biến môi trường từ .env
dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const KEY_RAW = process.env.ENCRYPTION_KEY || '';

async function insertMockData() {
  console.log("--- Bắt đầu khởi tạo dữ liệu mẫu ---");

  // 1. Kiểm tra độ dài Key (AES-256 yêu cầu 32 bytes = 64 ký tự Hex)
  if (KEY_RAW.length !== 64) {
    console.error("❌ Lỗi: ENCRYPTION_KEY phải dài đúng 64 ký tự Hex.");
    console.log(`Độ dài hiện tại: ${KEY_RAW.length} ký tự.`);
    console.log("Gợi ý Key mẫu: 64617461626173656b657932353662697473656e6372797074696f6e6b657921");
    process.exit(1);
  }

  const KEY = Buffer.from(KEY_RAW, 'hex');

  // 2. Danh sách dữ liệu mẫu (Tiếng Nhật để đúng ngữ cảnh hệ thống)
  const mockContents = [
    { cat: '福利厚生', text: '食堂のたべものを増えてほしい' },
    { cat: 'ITツール', text: '食堂のたべものを増えてほしい' },
    { cat: '職場環境', text: '食堂のたべものを増えてほしい' },
    { cat: '福利厚生', text: '食堂のたべものを増えてほしい' },
    { cat: 'その他', text: '食堂のたべものを増えてほしい' }
  ];

  try {
    for (const item of mockContents) {
      // 3. Quy trình mã hóa AES-256-GCM
      const iv = crypto.randomBytes(12); // GCM yêu cầu IV 12 bytes
      const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
      
      const contentJson = JSON.stringify({ content: item.text });
      
      let enc = cipher.update(contentJson, 'utf8');
      enc = Buffer.concat([enc, cipher.final()]);
      const tag = cipher.getAuthTag();

      // 4. Thực hiện SQL Insert
      // Lưu ý: theme_id, form_id, employee_id phải tồn tại trong DB của bạn
      const sql = `
        INSERT INTO submission_data 
        (theme_id, form_id, employee_id, status, content_enc, content_iv, content_tag, category_code, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await db.execute(sql, [
        'THEME-001',      // theme_id mẫu
        'form_opinion_v1', // form_id mẫu
        1,                // employee_id mẫu (User đầu tiên)
        'pending',        // Trạng thái ban đầu
        enc,              // Dữ liệu đã mã hóa (Buffer)
        iv,               // Vector khởi tạo (Buffer)
        tag,              // Auth Tag (Buffer)
        item.cat          // Danh mục
      ]);
      
      console.log(`- Đã chèn thành công mục: [${item.cat}]`);
    }

    console.log("-----------------------------------------");
    console.log("✅ Hoàn tất! Đã thêm 5 dữ liệu mẫu chuẩn.");
    console.log("Bây giờ bạn có thể mở Frontend để kiểm tra nội dung.");
    
  } catch (error) {
    console.error("❌ Lỗi trong quá trình Insert:");
    console.error(error);
  } finally {
    process.exit();
  }
}

// Chạy hàm
insertMockData();