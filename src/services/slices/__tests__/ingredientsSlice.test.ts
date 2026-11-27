import { expect, test, describe } from '@jest/globals';
import ingredientsReducer from '../ingredientsSlice';
import { getIngredientsThunk, TIngredientsState } from '../ingredientsSlice';

const mockIngredients = [
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0945',
    name: 'Соус с шипами Антарианского плоскоходца',
    type: 'sauce',
    proteins: 101,
    fat: 99,
    carbohydrates: 100,
    calories: 100,
    price: 88,
    image: 'https://code.s3.yandex.net/react/code/sauce-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-01-large.png',
  },
];

describe('Проверка работы редьюсера ingredientsReducer как функции ', () => {
  test('Тест проверяет работу редьюсера ingredientsReducer  как функции при его вызове с неизвестым экшеном', () => {
    //предыдушее состояние
    const prevState = undefined;
    const state = ingredientsReducer(prevState, { type: 'UNKNOWN' });
    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: null,
    });
  });

  test('Тест проверяет работу редьюсера ingredientsReducer как функции при его вызове с экшеном fulfilled', async () => {
    const prevState: TIngredientsState = {
      ingredients: [],
      isLoading: true,
      error: 'Предыдущая ошибка',
    };

    const action = getIngredientsThunk.fulfilled(
      mockIngredients,
      'request-id',
      undefined
    );
    const state: TIngredientsState = ingredientsReducer(prevState, action);

    expect(state).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: 'Предыдущая ошибка',
    });
  });

  test('Тест проверяет работу редьюсера ingredientsReducer как функции при его вызове с экшеном pending', async () => {
    const prevState: TIngredientsState = {
      ingredients: mockIngredients,
      isLoading: false,
      error: 'предыдущая ошибка',
    };

    const action = getIngredientsThunk.pending('request-id', undefined);
    const state: TIngredientsState = ingredientsReducer(prevState, action);

    expect(state).toEqual({
      ingredients: mockIngredients,
      isLoading: true,
      error: null,
    });
  });

  test('Тест проверяет работу редьюсера ingredientsReducer как функции при его вызове с экшеном rejected', async () => {
    const prevState: TIngredientsState = {
      ingredients: mockIngredients,
      isLoading: true,
      error: null,
    };

    const action = getIngredientsThunk.rejected(
      null,
      'request-id',
      undefined,
      'Ошибка получения ингредиентов'
    );
    const state: TIngredientsState = ingredientsReducer(prevState, action);

    expect(state).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: 'Ошибка получения ингредиентов',
    });
  });
});
