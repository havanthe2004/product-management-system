import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

export interface CreateCommodityTypeReqDto {
    typeCode: string;
    typeName: string;
    description?: string;
    groupId: number;
}

export interface UpdateCommodityTypeReqDto {
    typeCode?: string;
    typeName?: string;
    description?: string;
    status?: CommodityStatus;
    approvalStatus?: ApprovalStatus;
    groupId?: number;
}
