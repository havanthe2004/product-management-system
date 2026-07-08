import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from "typeorm";

@Entity("categories")
export class Category {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 200,
    })
    name: string;

    @Column({
        nullable: true,
    })
    description: string;

    @Column({
        name: "display_order",
        default: 0,
    })
    displayOrder: number;

    @Column({
        default: true,
    })
    isActive: boolean;

    @ManyToOne(() => Category, category => category.children, {
        nullable: true,
    })
    @JoinColumn({
        name: "parent_id",
    })
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];

}
