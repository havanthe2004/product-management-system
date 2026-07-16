import { AppDataSource } from "../config/data-source";
import { Commodity } from "../entities/commodity.entity";

export const CommodityRepository = AppDataSource.getRepository(Commodity).extend({
    
    /**
     * Find a commodity by its commodityCode
     */
    async findByCode(commodityCode: string): Promise<Commodity | null> {
        return this.findOne({ 
            where: { commodityCode }
        });
    }

});
