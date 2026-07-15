import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

export interface CreateQualityStandardReqDto {
    standardCode: string;
    standardName: string;
    description?: string;
}

export interface UpdateQualityStandardReqDto {
    standardCode?: string;
    standardName?: string;
    description?: string;
    status?: CommodityStatus;
    approvalStatus?: ApprovalStatus;
}
