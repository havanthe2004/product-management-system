import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { CommodityApprovalStatus } from "../common/enums/commodity-approval-status.enum";

export interface CreateCommodityReqDto {
    commodityCode: string;
    commodityName: string;
    imageUrl?: string;
    groupId: number;
    typeId: number;
    unitId: number;
    description?: string;
    countryIds?: number[];
    qualityStandardIds?: number[];
}

export interface UpdateCommodityReqDto {
    commodityCode?: string;
    commodityName?: string;
    imageUrl?: string;
    groupId?: number;
    typeId?: number;
    unitId?: number;
    description?: string;
    status?: CommodityStatus;
    approvalStatus?: CommodityApprovalStatus;
    countryIds?: number[];
    qualityStandardIds?: number[];
}
