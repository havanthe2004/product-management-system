import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

import { Category } from "./category.entity";
import { Unit } from "./unit.entity";
import { User } from "./user.entity";
import { ProductStatus } from "../common/enums/product-status.enum";

@Entity("products")
export class Product {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 300,
    })
    name: string;

    @ManyToOne(() => Category)
    @JoinColumn({
        name: "category_id",
    })
    category: Category;

    @ManyToOne(() => Unit)
    @JoinColumn({
        name: "unit_id",
    })
    unit: Unit;

    @Column({
        nullable: true,
        name: "hs_code",
    })
    hsCode: string;

    @Column({
        nullable: true,
    })
    origin: string;

    @Column({
        type: "text",
        nullable: true,
    })
    description: string;

    @Column({
        type: "varchar",
        length: 20,
        default: ProductStatus.PENDING,
    })
    status: ProductStatus;

    @Column({
        name: "allow_edit",
        default: true,
    })
    allowEdit: boolean;

    @Column({
        name: "is_deleted",
        default: false,
    })
    isDeleted: boolean;

    @ManyToOne(() => User)
    @JoinColumn({
        name: "created_by",
    })
    createdBy: User;

    @ManyToOne(() => User, {
        nullable: true,
    })
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

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt: Date;

    @Column({
        nullable: true,
        name: "approved_at",
    })
    approvedAt: Date;

}
