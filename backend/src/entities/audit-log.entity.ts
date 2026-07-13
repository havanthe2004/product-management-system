import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("audit_logs")
export class AuditLog {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({
        type: "varchar",
        length: 255,
        nullable: true,
    })
    email: string | null;

    @Column({
        type: "varchar",
        length: 100,
    })
    module: string;

    @Column({
        type: "varchar",
        length: 100,
    })
    action: string;


    @Column({
        type: "varchar",
        length: 1000,
        nullable: true,
    })
    description: string | null;

    @Column({
        name: "old_data",
        type: "json",
        nullable: true,
    })
    oldData: any;

    @Column({
        name: "new_data",
        type: "json",
        nullable: true,
    })
    newData: any;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;

}
