import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { CommodityGroup } from "./entities/commodity-group.entity";

async function main() {
    await AppDataSource.initialize();
    console.log("Database initialized");

    const repo = AppDataSource.getRepository(CommodityGroup);
    
    // Count all
    const countAll = await repo.count();
    console.log("Total groups in database:", countAll);

    // Page 1, limit 1
    const [items1, total1] = await repo.findAndCount({
        order: { createdAt: "DESC" },
        skip: 0,
        take: 1
    });
    console.log("Page 1, limit 1:", items1.map(i => ({ id: i.id, code: i.groupCode, name: i.groupName })), "Total count:", total1);

    // Page 2, limit 1
    const [items2, total2] = await repo.findAndCount({
        order: { createdAt: "DESC" },
        skip: 1,
        take: 1
    });
    console.log("Page 2, limit 1:", items2.map(i => ({ id: i.id, code: i.groupCode, name: i.groupName })), "Total count:", total2);

    await AppDataSource.destroy();
}

main().catch(err => {
    console.error("Error:", err);
});
