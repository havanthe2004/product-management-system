import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum ProductStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  unitId: number;
  hsCode: string;
  origin: string;
  description: string;
  status: ProductStatus;
  allowEdit: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

interface ProductsState {
  list: Product[];
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
}

const initialState: ProductsState = {
  list: [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB',
      categoryId: 2,
      unitId: 2,
      hsCode: '8517.13.00',
      origin: 'Trung Quốc',
      description: 'Điện thoại thông minh Apple iPhone 15 Pro Max, vỏ Titanium, chip A17 Pro.',
      status: ProductStatus.APPROVED,
      allowEdit: true,
      isDeleted: false,
      createdBy: 'officer01',
      createdAt: '2026-06-01T08:00:00Z',
      updatedAt: '2026-06-01T08:00:00Z',
      approvedBy: 'admin01',
      approvedAt: '2026-06-02T10:00:00Z',
    },
    {
      id: 2,
      name: 'MacBook Pro 14 M3 Pro 18GB/512GB',
      categoryId: 1,
      unitId: 2,
      hsCode: '8471.30.10',
      origin: 'Trung Quốc',
      description: 'Máy tính xách tay Apple MacBook Pro 14 inch chip M3 Pro, 18GB Unified Memory, SSD 512GB.',
      status: ProductStatus.PENDING,
      allowEdit: true,
      isDeleted: false,
      createdBy: 'officer01',
      createdAt: '2026-07-07T14:30:00Z',
      updatedAt: '2026-07-07T14:30:00Z',
    },
    {
      id: 3,
      name: 'Tai nghe chụp tai Sony WH-1000XM5',
      categoryId: 3,
      unitId: 1,
      hsCode: '8518.30.00',
      origin: 'Malaysia',
      description: 'Tai nghe chống ồn chủ động cao cấp Sony WH-1000XM5 màu đen.',
      status: ProductStatus.APPROVED,
      allowEdit: true,
      isDeleted: false,
      createdBy: 'officer01',
      createdAt: '2026-06-15T09:15:00Z',
      updatedAt: '2026-06-15T09:15:00Z',
      approvedBy: 'admin01',
      approvedAt: '2026-06-16T11:00:00Z',
    },
    {
      id: 4,
      name: 'Smart Tivi Samsung 4K 65 inch UA65AU7000',
      categoryId: 1,
      unitId: 1,
      hsCode: '8528.72.92',
      origin: 'Việt Nam',
      description: 'Tivi thông minh UHD 4K 65 inch Samsung, bộ xử lý Crystal 4K, hỗ trợ HDR10+.',
      status: ProductStatus.REJECTED,
      allowEdit: true,
      isDeleted: false,
      createdBy: 'officer01',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: '2026-07-01T10:00:00Z',
      approvedBy: 'admin01',
      approvedAt: '2026-07-02T09:00:00Z',
    }
  ],
  searchQuery: '',
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, 'id' | 'status' | 'isDeleted' | 'createdAt' | 'updatedAt'>>) => {
      const newProduct: Product = {
        ...action.payload,
        id: state.list.length > 0 ? Math.max(...state.list.map(p => p.id)) + 1 : 1,
        status: ProductStatus.PENDING,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.list.unshift(newProduct);
    },
    updateProduct: (state, action: PayloadAction<Partial<Product> & { id: number }>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        } as Product;
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    approveProduct: (state, action: PayloadAction<{ id: number; adminName: string }>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index].status = ProductStatus.APPROVED;
        state.list[index].approvedBy = action.payload.adminName;
        state.list[index].approvedAt = new Date().toISOString();
        state.list[index].updatedAt = new Date().toISOString();
      }
    },
    rejectProduct: (state, action: PayloadAction<{ id: number; adminName: string }>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index].status = ProductStatus.REJECTED;
        state.list[index].approvedBy = action.payload.adminName;
        state.list[index].approvedAt = new Date().toISOString();
        state.list[index].updatedAt = new Date().toISOString();
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  setSearchQuery,
  setStatusFilter,
  setCategoryFilter,
} = productsSlice.actions;

export default productsSlice.reducer;
