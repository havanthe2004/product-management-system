import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";
import { CommodityStatus } from "../common/enums/commodity-status.enum";

@Entity("quality_standards")
export class QualityStandard {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({
        name: "standard_code",
        type: "varchar",
        length: 30,
        unique: true,
    })
    standardCode: string;

    @Column({
        name: "standard_name",
        type: "varchar",
        length: 255,
    })
    standardName: string;

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
