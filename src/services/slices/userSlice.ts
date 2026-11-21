import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  registerUserApi,
  loginUserApi,
  getUserApi, //для фоновой проверки юзера
  updateUserApi,
  logoutApi,
} from '../../utils/burger-api';
import { setCookie, deleteCookie } from '../../utils/cookie';

import type { TRegisterData, TLoginData } from '../../utils/burger-api';
import type { TUser } from '../../utils/types';

// Асинхронный санк для регистрации
export const registerThunk = createAsyncThunk(
  'user/register',
  async (userData: TRegisterData, { rejectWithValue }) => {
    try {
      const data = await registerUserApi(userData);

      localStorage.setItem('refreshToken', data.refreshToken);
      setCookie('accessToken', data.accessToken);

      return data.user;
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

// Асинхронный санк для логина
export const loginThunk = createAsyncThunk(
  'user/login',
  async (userData: TLoginData, { rejectWithValue }) => {
    try {
      const data = await loginUserApi(userData);

      localStorage.setItem('refreshToken', data.refreshToken);
      setCookie('accessToken', data.accessToken);

      return data.user;
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

// Асинхронный санк для изменения данных пользователя
export const updateUserThunk = createAsyncThunk(
  'user/update',
  async (userData: TRegisterData, { rejectWithValue }) => {
    try {
      const data = await updateUserApi(userData);
      return data.user;
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

// Асинхронный санк для выхода
export const logoutThunk = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      // чистим токены
      localStorage.removeItem('refreshToken');
      deleteCookie('accessToken');

      return true;
    } catch (error: unknown) {
      // Сужение: если это стандартный объект ошибки,
      // TypeScript разрешает прочитать поле .message
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      // Если прилетела странная строка или null
      return rejectWithValue('Произошла неизвестная ошибка');
    } finally {
      // Чистим токены в браузере в любом случае
      // Если сервер не нашел роут, всё равно выкидываем юзера на фронтенде
      localStorage.removeItem('refreshToken');
      deleteCookie('accessToken');
    }
  }
);

// Асинхронный санк для фоновой проверки пользователя
export const checkUserAuthThunk = createAsyncThunk(
  'user/checkAuth',
  async (_, { dispatch }) => {
    // можем диспатчить команды прямо отсюда, без всяких хуков
    // Если в браузере завалялся рефреш-токен, пробуем стянуть профиль юзера
    if (localStorage.getItem('refreshToken')) {
      try {
        const res = await getUserApi();
        return res.user;
      } catch {
        // Если токен протух — чистим хвосты.
        localStorage.removeItem('refreshToken');
        deleteCookie('accessToken');
      } finally {
        // В любом случае (успех или провал запроса) проверка завершена!
        dispatch(authChecked());
      }
    } else {
      // Если токена вообще не было — проверка тоже завершена
      dispatch(authChecked());
    }
  }
);

// Описываем интерфейс ящика пользователя
export type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean; // Проверен ли токен при старте (для прелоадера)
  isLoading: boolean; // Крутилка для кнопок "Войти/Зарегистрироваться"
  error: string | null; // Текст ошибки
};

// Инициализируем стейт дефолтными значениями
const initialState: TUserState = {
  user: null,
  isAuthChecked: false, // Изначально проверка еще не прошла
  isLoading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked: (state) => {
      state.isAuthChecked = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // Запрос улетел — включаем лоадер, обнуляем прошлую ошибку
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Запрос упал с ошибкой
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Успешно зарегистрировались. Повар-редюсер ??? что делает?
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })

      // Запрос улетел — включаем лоадер, обнуляем прошлую ошибку
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Запрос упал с ошибкой
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Успешно зарегистрировались.
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })

      // обновление данных юзера
      .addCase(updateUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })

      // выход юзера
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthChecked = true; //статус проверен
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthChecked = true; //статус проверен
      })

      // --- ФОНОВАЯ ПРОВЕРКА ПРИ СТАРТЕ ---
      .addCase(checkUserAuthThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload; // Если сервер подтвердил куку — записываем профиль
        }
      });
  },
});

export default userSlice.reducer;
export const { authChecked } = userSlice.actions;
