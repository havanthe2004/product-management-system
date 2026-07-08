import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from "typeorm";

import { Product } from "./product.entity";
import { RefreshToken } from "./refresh-token.entity";
import { UserRole } from "../common/enums/user-role.enum";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
        length: 50,
    })
    username: string;

    @Column()
    password: string;

    @Column({
        name: "full_name",
        length: 100,
    })
    fullName: string;

    @Column({
        nullable: true,
    })
    email: string;

    @Column({
        type: "varchar",
        length: 20,
        default: UserRole.OFFICER,
    })
    role: UserRole;

    @Column({
        default: true,
    })
    isActive: boolean;

    @OneToMany(() => Product, product => product.createdBy)
    createdProducts: Product[];

    @OneToMany(() => Product, product => product.updatedBy)
    updatedProducts: Product[];

    @OneToMany(() => Product, product => product.approvedBy)
    approvedProducts: Product[];

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];

}
