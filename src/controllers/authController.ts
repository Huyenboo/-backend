import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { EmployeeRepository } from '../repositories/EmployeeRepository';

const employeeRepo = new EmployeeRepository();
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // emailからuser探す
    const user = await employeeRepo.findByEmail(email);

    //Userが見つからない場合＝＞401エラー
    if (!user) {
      return res.status(401).json({ 
        error_code: "AUTH_FAILED", 
        message: "メールアドレスまたはパスワードが正しくありません。" 
      });
    }

    // DB (AES-256-GCM)から パスワード解決 
    let decryptedPassword = '';
    try {
      const decipher = crypto.createDecipheriv(
        ALGORITHM, 
        ENCRYPTION_KEY, 
        user.password_iv //DBから
      );
      decipher.setAuthTag(user.password_tag); // DBから
      
      decryptedPassword = decipher.update(user.password_enc, undefined, 'utf8');
      decryptedPassword += decipher.final('utf8');
    } catch (decryptError) {
      console.error("Giải mã thất bại:", decryptError);
      return res.status(401).json({ message: "Xác thực thất bại" });
    }

    // パスワード比較
    if (password !== decryptedPassword) {
      return res.status(401).json({ 
        error_code: "AUTH_FAILED", 
        message: "メールアドレスまたはパスワードが正しくありません。" 
      });
    }

    // ログイン成功実際ID
    const token = jwt.sign(
      { 
        employee_id: user.employee_id, 
        role: user.is_admin === 1 ? 'admin' : 'employee' 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '30m' } //  login_session定義30m
    );

    // 6. Set Cookie sid ( authMiddleware合わせる)
    res.cookie('sid', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000 
    });

    // Front に情報返す
    return res.status(200).json({
      employee_id: user.employee_id,
      full_name: user.full_name,
      role: user.is_admin === 1 ? 'admin' : 'employee'
    });

  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};