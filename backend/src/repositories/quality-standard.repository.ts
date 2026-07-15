import { AppDataSource } from "../config/data-source";
import { QualityStandard } from "../entities/quality-standard.entity";

export const QualityStandardRepository = AppDataSource.getRepository(QualityStandard).extend({
    
    /**
     * Find a standard by its standardCode
     */
    async findByCode(standardCode: string): Promise<QualityStandard | null> {
        return this.findOne({ 
            where: { standardCode }
        });
    }

});
