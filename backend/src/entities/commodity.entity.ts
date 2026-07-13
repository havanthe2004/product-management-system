import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";

import { CommodityGroup } from "./commodity-group.entity";
import { CommodityType } from "./commodity-type.entity";
import { Unit } from "./unit.entity";
import { User } from "./user.entity";
import { Country } from "./country.entity";
import { QualityStandard } from "./quality-standard.entity";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { CommodityApprovalStatus } from "../common/enums/commodity-approval-status.enum";

@Entity("commodities")
export class Commodity {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({
        name: "commodity_code",
        type: "varchar",
        length: 30,
        unique: true,
    })
    commodityCode: string;

    @Column({
        name: "commodity_name",
        type: "varchar",
        length: 255,
    })
    commodityName: string;

    @Column({
        name: "image_url",
        type: "varchar",
        length: 500,
        nullable: true,
    })
    imageUrl: string;

    @ManyToOne(() => CommodityGroup)
    @JoinColumn({
        name: "group_id",
    })
    group: CommodityGroup;

    @ManyToOne(() => CommodityType)
    @JoinColumn({
        name: "type_id",
    })
    type: CommodityType;

    @ManyToOne(() => Unit)
    @JoinColumn({
        name: "unit_id",
    })
    unit: Unit;

    @Column({
        type: "text",
        nullable: true,
    })
    description: string;

    @Column({
        name: "approval_status",
        type: "enum",
        enum: CommodityApprovalStatus,
        default: CommodityApprovalStatus.PENDING,
    })
    approvalStatus: CommodityApprovalStatus;

    @Column({
        name: "status",
        type: "enum",
        enum: CommodityStatus,
        default: CommodityStatus.ACTIVE,
    })
    status: CommodityStatus;

    @ManyToOne(() => User)
    @JoinColumn({
        name: "created_by",
    })
    createdBy: User;

    @ManyToOne(() => User)
    @JoinColumn({
        name: "updated_by",
    })
    updatedBy: User;

    @ManyToOne(() => User, {
        nullable: true,
    })
    @JoinColumn({
        name: "approved_by",
    })
    approvedBy: User;

    @Column({
        name: "approved_at",
        type: "datetime",
        nullable: true,
    })
    approvedAt: Date;

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

    @ManyToMany(() => Country)
    @JoinTable({
        name: "commodity_countries",
        joinColumn: {
            name: "commodity_id",
            referencedColumnName: "id",
        },
        inverseJoinColumn: {
            name: "country_id",
            referencedColumnName: "id",
        },
    })
    countries: Country[];

    @ManyToMany(() => QualityStandard)
    @JoinTable({
        name: "commodity_quality_standards",
        joinColumn: {
            name: "commodity_id",
            referencedColumnName: "id",
        },
        inverseJoinColumn: {
            name: "quality_standard_id",
            referencedColumnName: "id",
        },
    })
    qualityStandards: QualityStandard[];

}
