export interface UserDto {
    id: number;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
}

export interface LoginResDto {
    user: UserDto;
    accessToken: string;
    refreshToken: string;
}