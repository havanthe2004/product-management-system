import { AppDataSource } from "../config/data-source";
import { CommodityType } from "../entities/commodity-type.entity";

export const CommodityTypeRepository = AppDataSource.getRepository(CommodityType).extend({
    
    /**
     * Find a type by its typeCode
     */
    async findByCode(typeCode: string): Promise<CommodityType | null> {
        return this.findOne({ 
            where: { typeCode }
        });
    }

});
