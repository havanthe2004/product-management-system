import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: number;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: number;
}

interface CategoriesState {
  list: Category[];
}

const initialState: CategoriesState = {
  list: [
    { id: 1, name: 'Điện tử & Gia dụng', description: 'Tivi, Tủ lạnh, Máy giặt...', displayOrder: 1, isActive: true },
    { id: 2, name: 'Thiết bị di động', description: 'Điện thoại, Máy tính bảng...', displayOrder: 2, isActive: true },
    { id: 3, name: 'Phụ kiện công nghệ', description: 'Cáp sạc, Tai nghe, Chuột...', displayOrder: 3, isActive: true },
    { id: 4, name: 'Thời trang nam/nữ', description: 'Quần áo, giày dép, túi xách...', displayOrder: 4, isActive: true },
  ],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.list = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.list.push(action.payload);
    },
  },
});

export const { setCategories, addCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
