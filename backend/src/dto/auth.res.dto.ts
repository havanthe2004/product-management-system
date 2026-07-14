export interface UserDto {
    id: number;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    avatar?: string | null;
}

export interface LoginResDto {
    user: UserDto;
    accessToken: string;
    refreshToken: string;
}