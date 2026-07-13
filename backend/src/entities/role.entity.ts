import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("roles")
export class Role {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({
        name: "role_name",
        type: "varchar",
        length: 100,
        unique: true,
    })
    roleName: string;

    @Column({
        type: "text",
        nullable: true,
    })
    description: string;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt: Date;

}
