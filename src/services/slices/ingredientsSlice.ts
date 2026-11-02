import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getIngredientsApi } from '../../utils/burger-api';

import type { TIngredient } from '@utils-types';

// Асинхронный санк для скачивания ингредиентов с сервера
export const getIngredientsThunk = createAsyncThunk(
  'ingredients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getIngredientsApi();
      return data; // getIngredientsApi возвращает чистый массив TIngredient[]
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка загрузки');
    }
  }
);

// Описываем интерфейс состояния (ящика ингредиентов)
export type TIngredientsState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: string | null;
};

// Инициализируем стейт правильными дефолтными значениями
const initialState: TIngredientsState = {
  ingredients: [],
  isLoading: false,
  error: null,
};

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Запрос улетел — включаем лоадер, обнуляем прошлую ошибку
      .addCase(getIngredientsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Запрос упал с ошибкой
      .addCase(getIngredientsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Все успешно скачалось, редюсер кладет массив в стейт
      .addCase(getIngredientsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ingredients = action.payload;
      });
  },
});

export default ingredientsSlice.reducer;
