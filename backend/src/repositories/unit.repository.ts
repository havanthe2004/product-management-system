import { AppDataSource } from "../config/data-source";
import { Unit } from "../entities/unit.entity";

export const UnitRepository = AppDataSource.getRepository(Unit).extend({
    
    /**
     * Find a unit by its unitCode (only if unitCode is provided)
     */
    async findByCode(unitCode: string): Promise<Unit | null> {
        if (!unitCode) return null;
        return this.findOne({ 
            where: { unitCode }
        });
    }

});
