import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

export interface CreateCommodityGroupReqDto {
    groupCode: string;
    groupName: string;
    description?: string;
}

export interface UpdateCommodityGroupReqDto {
    groupCode?: string;
    groupName?: string;
    description?: string;
    status?: CommodityStatus;
    approvalStatus?: ApprovalStatus;
}
