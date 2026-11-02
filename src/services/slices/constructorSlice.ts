import { createSlice, nanoid } from '@reduxjs/toolkit';

import type {
  TIngredient,
  TConstructorIngredient,
  TConstructorState,
} from '../../utils/types';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

export const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    //Команда добавления конкретного ингредиента в конструктор
    addIngredient: {
      // Подготовительная функция (prepare) автоматически сгенерирует уникальный id
      // до того, как экшен прилетит в редюсер
      prepare: (ingredient: TIngredient) => {
        const id = nanoid();
        return { payload: { ...ingredient, id } };
      },
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        //если булка - заменить
        if (action.payload.type === 'bun') {
          return { ...state, bun: action.payload };
        } else {
          state.ingredients.push(action.payload);
          return state;
        }
      },
    },
    // Команда удаления конкретного ингредиента из конструктора по его уникальному id
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((el) => el.id != action.payload);
    },

    // Команда очистки конструктора
    clearBurgerConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    },
  },
});

export default constructorSlice.reducer;
// Экспортируем команды-экшены для компонентов
export const { addIngredient, removeIngredient, clearBurgerConstructor } =
  constructorSlice.actions;
