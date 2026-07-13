import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { OtpStatus } from "../common/enums/otp-status.enum";

@Entity("password_reset_otps")
export class PasswordResetOtp {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
    })
    user: User;

    @Column({
        name: "otp_code",
        type: "varchar",
        length: 6,
    })
    otpCode: string;

    @Column({
        type: "int",
        default: 0,
    })
    attempts: number;

    @Column({
        type: "enum",
        enum: OtpStatus,
        default: OtpStatus.PENDING,
    })
    status: OtpStatus;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;

    @Column({
        name: "expires_at",
        type: "datetime",
    })
    expiresAt: Date;

}
