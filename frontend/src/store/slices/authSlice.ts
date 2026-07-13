import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type User, UserRole } from '../../types';
export { UserRole };

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
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      const mappedUser = {
        ...action.payload.user,
        username: action.payload.user.email
      };
      state.user = mappedUser;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
        state.user.fullName = action.payload === UserRole.ADMIN ? 'Quản trị viên' : action.payload === UserRole.MANAGER ? 'Quản lý' : 'Nguyen Van A';
        state.user.username = action.payload === UserRole.ADMIN ? 'admin01' : action.payload === UserRole.MANAGER ? 'manager01' : 'officer01';
      }
    }
  },
});

export const { loginSuccess, logout, switchRole } = authSlice.actions;
export default authSlice.reducer;
