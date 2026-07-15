import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

export interface CreateCountryReqDto {
    isoCode: string;
    countryName: string;
    description?: string;
}

export interface UpdateCountryReqDto {
    isoCode?: string;
    countryName?: string;
    description?: string;
    status?: CommodityStatus;
    approvalStatus?: ApprovalStatus;
}
