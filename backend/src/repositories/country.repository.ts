import { AppDataSource } from "../config/data-source";
import { Country } from "../entities/country.entity";

export const CountryRepository = AppDataSource.getRepository(Country).extend({
    
    /**
     * Find a country by its isoCode
     */
    async findByCode(isoCode: string): Promise<Country | null> {
        return this.findOne({ 
            where: { isoCode }
        });
    }

});
