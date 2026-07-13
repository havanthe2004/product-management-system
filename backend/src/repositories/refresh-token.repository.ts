import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entities/refresh-token.entity";

export const RefreshTokenRepository = AppDataSource.getRepository(RefreshToken).extend({

    /**
     * Find a refresh token entity by the token string
     */
    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.findOne({ 
            where: { token },
            relations: { user: true }
        });
    },

    /**
     * Revoke a token by marking it as revoked
     */
    async revokeToken(token: string): Promise<void> {
        await this.update({ token }, { isRevoked: true });
    }

});
