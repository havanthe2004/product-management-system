import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";
import { CommodityStatus } from "../common/enums/commodity-status.enum";

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
        type: "varchar",
        length: 100,
        nullable: true,
    })
    region: string;

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
