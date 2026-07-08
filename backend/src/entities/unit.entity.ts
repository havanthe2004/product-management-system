import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from "typeorm";

@Entity("units")
export class Unit {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 50,
    })
    name: string;

    @Column({
        length: 20,
    })
    symbol: string;

    @Column({
        default: true,
    })
    isActive: boolean;

}
