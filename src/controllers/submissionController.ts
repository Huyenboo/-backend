import { Request, Response } from 'express';
import { SubmissionService } from '../services/submissionService';
import { SubmissionRepository } from '../repositories/submissionRepository';
import pool from '../config/db'; // ここからpoolをexportしている想定

// クラスの初期化（DIを使う場合はそちらでもOK）
const submissionRepository = new SubmissionRepository(pool);
const submissionService = new SubmissionService(submissionRepository);

export const submitForm = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error_code: "AUTH_FAILED", 
        message: "ログインされていません" 
      });
    }

    const employeeId = req.user.employee_id; 
    
    // デバッグ用：フロントエンドから受け取ったデータをログ出力
    console.log("フロントエンドから受信したデータ:", req.body);

    const result = await submissionService.processAndSave(employeeId, req.body);
    
    return res.status(200).json({ 
      success: true, 
      submission_id: (result as any).insertId 
    });
  } catch (error: any) {
    // 重要：実際のエラー内容をターミナルに出力（MySQLエラー確認用）
    console.error("❌ サブミッション保存エラー:", error);
    
    return res.status(500).json({ 
      error_code: "INTERNAL_ERROR", 
      message: error.sqlMessage || error.message 
    });
  }
};