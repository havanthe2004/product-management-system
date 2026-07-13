import { Request } from "express";
import { AppDataSource } from "../config/data-source";
import { AuditLog } from "../entities/audit-log.entity";

export interface LogDetails {
    email?: string;
    module: string;
    action: string;
    description?: string;
    oldData?: any;
    newData?: any;
}

export class AuditLogService {
    private static auditLogRepository = AppDataSource.getRepository(AuditLog);

    /**
     * Ghi nhận lịch sử hoạt động (Audit Log)
     * @param req Express Request (chứa thông tin user đăng nhập)
     * @param details Thông tin chi tiết về hoạt động cần ghi nhận
     */
    static async log(req: Request, details: LogDetails): Promise<AuditLog | null> {
        try {
            const auditLog = new AuditLog();

            // Lấy email người dùng thực hiện (từ details hoặc req.user được gán từ Auth Middleware)
            const email = details.email || (req as any).user?.email;
            auditLog.email = email || null;

            auditLog.module = details.module;
            auditLog.action = details.action;
            auditLog.description = details.description ? details.description : null;
            auditLog.oldData = details.oldData ? details.oldData : null;
            auditLog.newData = details.newData ? details.newData : null;

            return await this.auditLogRepository.save(auditLog);
        } catch (error: any) {
            console.error("Lỗi khi lưu lịch sử hoạt động (Audit Log):", error.message);
            return null;
        }
    }
}
