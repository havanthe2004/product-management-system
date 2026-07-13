import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";
import { CommodityStatus } from "../common/enums/commodity-status.enum";

@Entity("commodity_groups")
export class CommodityGroup {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({
        name: "group_code",
        type: "varchar",
        length: 20,
        unique: true,
    })
    groupCode: string;

    @Column({
        name: "group_name",
        type: "varchar",
        length: 255,
    })
    groupName: string;

    @Column({
        type: "text",
        nullable: true,
    })
    description: string;

    @Column({
        type: "enum",
        enum: CommodityStatus,
        default: CommodityStatus.ACTIVE,
    })
    status: CommodityStatus;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt: Date;

    @DeleteDateColumn({
        name: "deleted_at",
        nullable: true,
    })
    deletedAt: Date;

}
