import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { orderBurgerApi, getOrdersApi } from '../../utils/burger-api';

import type { TOrder } from '../../utils/types';

// Асинхронный санк для оформления заказа
export const orderBurgerThunk = createAsyncThunk(
  'order/make',
  async (ingredientIds: string[], { rejectWithValue }) => {
    try {
      const data = await orderBurgerApi(ingredientIds);
      return data.order; // Сервер возвращает объект созданного заказа
    } catch (error: unknown) {
      // Сужение: если это стандартный объект ошибки,
      // TypeScript разрешает прочитать поле .message
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      // Если прилетела странная строка или null
      return rejectWithValue('Произошла неизвестная ошибка');
    }
  }
);

// Асинхронный санк для получения заказов пользователя
export const getUserOrdersThunk = createAsyncThunk(
  'order/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getOrdersApi();
      return data; // заказы пользователя
    } catch (error: unknown) {
      // Сужение: если это стандартный объект ошибки,
      // TypeScript разрешает прочитать поле .message
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      // Если прилетела странная строка или null
      return rejectWithValue('Произошла неизвестная ошибка');
    }
  }
);

// Описываем интерфейс для работы с заказом
export type TOrderState = {
  orderModalData: TOrder | null; // Данные заказа
  orderRequest: boolean; // Оформление заказа в процессе
  error: string | null; // Текст ошибки
  userOrders: TOrder[]; // Заказы пользователя
};

// Инициализируем стейт правильными дефолтными значениями
const initialState: TOrderState = {
  orderModalData: null,
  orderRequest: false,
  error: null,
  userOrders: [],
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Синхронная команда для закрытия модалки и сброса номера заказа на фронтенде
    clearOrderData: (state) => {
      state.orderModalData = null;
    },
  },
  extraReducers: (builder) => {
    return (
      builder
        .addCase(orderBurgerThunk.pending, (state) => {
          state.orderRequest = true;
          state.error = null;
          state.orderModalData = null;
        })
        .addCase(orderBurgerThunk.rejected, (state, action) => {
          state.orderRequest = false;
          state.error = action.payload as string;
        })
        // Успешное оформление заказа
        .addCase(orderBurgerThunk.fulfilled, (state, action) => {
          state.orderRequest = false;
          state.orderModalData = action.payload;
          state.error = null;
        })

        .addCase(getUserOrdersThunk.pending, (state) => {
          state.error = null;
        })
        .addCase(getUserOrdersThunk.rejected, (state, action) => {
          state.error = action.payload as string;
        })
        .addCase(getUserOrdersThunk.fulfilled, (state, action) => {
          state.userOrders = action.payload;
        })
    );
  },
});

export default orderSlice.reducer;
export const { clearOrderData } = orderSlice.actions;
