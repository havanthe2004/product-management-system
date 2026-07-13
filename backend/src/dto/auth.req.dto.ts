export interface RegisterReqDto {
    email: string;
    password: string;
    confirmPassword?: string;
    fullName: string;
    idCardNumber: string;
    dateOfBirth: Date;
    gender: string;
}

export interface LoginReqDto {
    email: string;
    password: string;
}

export interface ForgotPasswordReqDto {
    email: string;
}

export interface ResetPasswordReqDto {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword?: string;
}