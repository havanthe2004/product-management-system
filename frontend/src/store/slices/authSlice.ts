import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum UserRole {
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  user: {
    id: 1,
    username: 'officer01',
    fullName: 'Nguyen Van A',
    email: 'officer01@example.com',
    role: UserRole.OFFICER,
    isActive: true,
  },
  isAuthenticated: true,
  token: 'mock-jwt-token',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
        state.user.fullName = action.payload === UserRole.ADMIN ? 'Quản trị viên' : 'Nguyen Van A';
        state.user.username = action.payload === UserRole.ADMIN ? 'admin01' : 'officer01';
      }
    }
  },
});

export const { loginSuccess, logout, switchRole } = authSlice.actions;
export default authSlice.reducer;
