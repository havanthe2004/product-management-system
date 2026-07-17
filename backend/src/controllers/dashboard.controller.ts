import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { ResponseHelper } from "../utils/response.helper";

export class DashboardController {
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const statsData = await dashboardService.getStats();
      return ResponseHelper.success(res, statsData, "Lấy số liệu thống kê tổng quan thành công!");
    } catch (error: any) {
      return ResponseHelper.error(res, error.message, null, 400);
    }
  }
}

export const dashboardController = new DashboardController();
