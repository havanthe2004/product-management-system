import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

@Entity("countries")
export class Country {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({
        name: "iso_code",
        type: "varchar",
        length: 10,
        unique: true,
    })
    isoCode: string;

    @Column({
        name: "country_name",
        type: "varchar",
        length: 255,
    })
    countryName: string;


    @Column({
        type: "text",
        nullable: true,
    })
    description: string;

    @Column({
        type: "enum",
        enum: CommodityStatus,
        default: CommodityStatus.INACTIVE,
    })
    status: CommodityStatus;

    @Column({
        name: "approval_status",
        type: "enum",
        enum: ApprovalStatus,
        default: ApprovalStatus.PENDING,
    })
    approvalStatus: ApprovalStatus;

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
