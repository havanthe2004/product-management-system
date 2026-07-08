import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  isActive: boolean;
}

interface UnitsState {
  list: Unit[];
}

const initialState: UnitsState = {
  list: [
    { id: 1, name: 'Cái', symbol: 'cái', isActive: true },
    { id: 2, name: 'Chiếc', symbol: 'chiếc', isActive: true },
    { id: 3, name: 'Hộp', symbol: 'hộp', isActive: true },
    { id: 4, name: 'Bộ', symbol: 'bộ', isActive: true },
    { id: 5, name: 'Thùng', symbol: 'thùng', isActive: true },
  ],
};

const unitsSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      state.list = action.payload;
    },
  },
});

export const { setUnits } = unitsSlice.actions;
export default unitsSlice.reducer;
