import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";

export const UserRepository = AppDataSource.getRepository(User).extend({
    
    /**
     * Find a user by their email address
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ 
            where: { email },
            relations: { role: true }
        });
    }

});
