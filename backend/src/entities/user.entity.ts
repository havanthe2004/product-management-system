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
import { UserRole } from "../common/enums/user-role.enum";
import { UserStatus } from "../common/enums/user-status.enum";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.OFFICER,
    })
    role: UserRole;

    @Column({
        name: "full_name",
        type: "varchar",
        length: 255,
    })
    fullName: string;

    @Column({
        type: "varchar",
        length: 255,
        unique: true,
    })
    email: string;

    @Column({
        type: "varchar",
        length: 255,
    })
    password: string;

    @Column({
        type: "varchar",
        length: 255,
    })
    idCardNumber: string;

    @Column({
        type: "date",
        name: "dob",
        nullable: true,
    })
    dateOfBirth: Date;

    @Column({
        type: "varchar",
        length: 100,
        nullable: true,
    })
    gender: string;

    @Column({
        type: "varchar",
        length: 20,
        nullable: true,
    })
    phone: string;


    @Column({
        type: "varchar",
        length: 500,
        nullable: true,
    })
    avatar: string;

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

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
