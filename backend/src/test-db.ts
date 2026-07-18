import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { Commodity } from "./entities/commodity.entity";
import { In } from "typeorm";

async function main() {
    await AppDataSource.initialize();
    console.log("Database initialized");

    const repo = AppDataSource.getRepository(Commodity);

    try {
        const countryIds = [1, 2]; // Test array
        console.log(`Querying commodities with countryIds in: ${countryIds.join(", ")}`);
        
        const [items, total] = await repo.findAndCount({
            where: {
                countries: { id: In(countryIds) }
            },
            relations: {
                countries: true
            },
            take: 10,
            skip: 0
        });

        console.log(`Found ${total} commodities:`);
        for (const item of items) {
            console.log(`- ${item.commodityCode}: ${item.commodityName}, countries: ${item.countries?.map(c => c.id).join(", ")}`);
        }
    } catch (err: any) {
        console.error("Query failed with error:", err.message);
    }

    await AppDataSource.destroy();
}

main().catch(err => {
    console.error("Error:", err);
});
