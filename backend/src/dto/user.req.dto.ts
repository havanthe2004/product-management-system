export interface CreateUserReqDto {
    email: string;
    password?: string;
    fullName: string;
    idCardNumber: string;
    dob?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    avatar?: string;
    roleName: "ADMIN" | "MANAGER" | "OFFICER";
}
