export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OFFICER = 'OFFICER',
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  idCardNumber: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
  updatedAt: string;
  username?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CommodityGroup {
  id: number;
  groupCode: string;
  groupName: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CommodityType {
  id: number;
  typeCode: string;
  typeName: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  groupId: number;
  group?: CommodityGroup;
}

export interface Country {
  id: number;
  isoCode: string;
  countryName: string;
  region?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface QualityStandard {
  id: number;
  standardCode: string;
  standardName: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Unit {
  id: number;
  unitCode?: string;
  unitName: string;
  symbol: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AuditLog {
  id: number;
  email?: string;
  module: string;
  action: string;
  description?: string;
  oldData?: any;
  newData?: any;
  createdAt: string;
}
