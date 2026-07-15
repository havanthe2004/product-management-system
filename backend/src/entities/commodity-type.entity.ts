import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";
import { CommodityGroup } from "./commodity-group.entity";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { ApprovalStatus } from "../common/enums/approval-status.enum";

@Entity("commodity_types")
export class CommodityType {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @ManyToOne(() => CommodityGroup)
    @JoinColumn({
        name: "group_id",
    })
    group: CommodityGroup;

    @Column({
        name: "type_code",
        type: "varchar",
        length: 20,
        unique: true,
    })
    typeCode: string;

    @Column({
        name: "type_name",
        type: "varchar",
        length: 255,
    })
    typeName: string;

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
