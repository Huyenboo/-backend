import { SubmissionRepository } from '../repositories/submissionRepository';
import crypto from 'crypto';

export class SubmissionService {
  private submissionRepository: SubmissionRepository;
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(submissionRepository: SubmissionRepository) {
    this.submissionRepository = submissionRepository;
    // 16進数文字列（64文字）からBuffer（32バイト）へ変換
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }

  async processAndSave(employeeId: number, rawData: any) {
    // formDataがundefinedにならないように保証
    const formData = rawData.form_data || {};

    // 1. 暗号化する内容（comment）を準備
    // commentが空の場合、undefinedではなく空文字を使用
    const commentText = formData.comment || "";
    const dataToEncrypt = { comment: commentText };
    const plainText = JSON.stringify(dataToEncrypt);
    
    // 2. 暗号化ロジック（既存のまま維持）
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let enc = cipher.update(plainText, 'utf8');
    enc = Buffer.concat([enc, cipher.final()]);
    const tag = cipher.getAuthTag();

    // 3. DB保存用オブジェクトを準備（重要項目は || null を使用）
    const submissionRecord = {
      // theme_idはformDataから取得（存在しない場合はrawDataから取得）
      theme_id: formData.theme_id || rawData.theme_id || null, 
      
      form_id: rawData.form_id || null,
      
      // スキーマ上のcategoryはformData.categoryに存在
      category_code: formData.category || null, 
      
      employee_id: employeeId || null,
      
      content_enc: enc,
      content_iv: iv,
      content_tag: tag,
      
      status: formData.status || 'completed'
    };

    // 必須項目にnullが含まれていないか確認
    console.log("保存直前のデータ:", submissionRecord);

    return await this.submissionRepository.create(submissionRecord);
  }
}