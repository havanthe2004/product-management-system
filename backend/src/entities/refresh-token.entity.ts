import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("refresh_tokens")
export class RefreshToken {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
        type: "varchar",
        length: 500,
    })
    token: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
    })
    user: User;

    @Column({
        name: "expires_at",
    })
    expiresAt: Date;

    @Column({
        name: "is_revoked",
        default: false,
    })
    isRevoked: boolean;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt: Date;

}
