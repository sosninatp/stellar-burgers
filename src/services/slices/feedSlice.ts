import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getFeedsApi } from '../../utils/burger-api';

import type { TFeedState } from '../../utils/types';

export const getFeedsThunk = createAsyncThunk(
  'feed/getFeeds',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getFeedsApi();
      return data; // Сервер возвращает объект созданного заказа
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

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeedsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeedsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getFeedsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      });
  },
});

export default feedSlice.reducer;
// Через actions можно экспортировать только синхронные редюсеры
// Асинхронные санки (createAsyncThunk) создаются отдельно
// и экспортируются прямо на месте своего объявления.
