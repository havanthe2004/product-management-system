import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum UserRole {
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  username?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedToken,
  token: savedToken || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const mappedUser = {
        ...action.payload.user,
        username: action.payload.user.email
      };
      state.user = mappedUser;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
