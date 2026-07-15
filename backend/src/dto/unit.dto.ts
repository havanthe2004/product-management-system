import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

export interface CreateUnitReqDto {
    unitCode?: string;
    unitName: string;
    symbol: string;
    description?: string;
}

export interface UpdateUnitReqDto {
    unitCode?: string;
    unitName?: string;
    symbol?: string;
    description?: string;
    status?: CommodityStatus;
    approvalStatus?: ApprovalStatus;
}
