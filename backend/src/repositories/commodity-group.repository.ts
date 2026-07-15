import { AppDataSource } from "../config/data-source";
import { CommodityGroup } from "../entities/commodity-group.entity";

export const CommodityGroupRepository = AppDataSource.getRepository(CommodityGroup).extend({
    
    /**
     * Find a group by its groupCode
     */
    async findByCode(groupCode: string): Promise<CommodityGroup | null> {
        return this.findOne({ 
            where: { groupCode }
        });
    }

});
