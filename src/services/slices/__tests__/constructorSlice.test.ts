import { expect, test, describe } from '@jest/globals';
import type { TConstructorState } from '../../../utils/types';

import constructorReducer from '../constructorSlice';

import {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearBurgerConstructor,
} from '../constructorSlice';

const main = {
  _id: '643d69a5c3f7b9001cfa0941',
  id: 'main-1',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main' as const,
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
};

const bun = {
  _id: '643d69a5c3f7b9001cfa093c',
  id: 'bun-1',
  name: 'Краторная булка N-200i',
  type: 'bun' as const,
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
};

const sauce1 = {
  _id: '643d69a5c3f7b9001cfa0945',
  id: 'sauce-1',
  name: 'Соус с шипами Антарианского плоскоходца',
  type: 'sauce' as const,
  proteins: 101,
  fat: 99,
  carbohydrates: 100,
  calories: 100,
  price: 88,
  image: 'https://code.s3.yandex.net/react/code/sauce-01.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-01-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-01-large.png',
};

const sauce2 = {
  _id: '6acd6b8163765e331a0bd9f2',
  id: 'sauce-2',
  name: 'Соус фирменный Space Sauce',
  type: 'sauce',
  proteins: 50,
  fat: 22,
  carbohydrates: 11,
  calories: 14,
  price: 80,
  image: 'https://norma.ffapi.ru/images/sauce-04.png',
  image_mobile: 'https://norma.ffapi.ru/images/sauce-04-mobile.png',
  image_large: 'https://norma.ffapi.ru/images/sauce-04-large.png',
  __v: 0,
};

describe('Проверка работы редьюсера constructorReducer как функции', () => {
  const initialState: TConstructorState = {
    bun: null,
    ingredients: [],
  };
  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с неизвестым экшеном', () => {
    const prevState = undefined;
    const state = constructorReducer(prevState, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном addIngredient - добавление булки', () => {
    const action = addIngredient(bun);
    const state: TConstructorState = constructorReducer(initialState, action);

    expect(action.payload.id).toEqual(expect.any(String));
    expect(state).toEqual({ bun: action.payload, ingredients: [] });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном addIngredient - добавление ингредиента', () => {
    const action = addIngredient(sauce1);
    const state: TConstructorState = constructorReducer(initialState, action);

    expect(action.payload.id).toEqual(expect.any(String));
    expect(state).toEqual({ bun: null, ingredients: [action.payload] });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном removeIngredient - удаление ингредиента', () => {
    const prevState: TConstructorState = {
      bun,
      ingredients: [main, sauce1, sauce2],
    };

    const state: TConstructorState = constructorReducer(
      prevState,
      removeIngredient('sauce-1')
    );

    expect(state).toEqual({
      bun: bun,
      ingredients: [main, sauce2],
    });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном moveIngredient - изменение порядка начинок в конструкторе', () => {
    const prevState: TConstructorState = {
      bun,
      ingredients: [main, sauce1, sauce2],
    };

    const state: TConstructorState = constructorReducer(
      prevState,
      moveIngredient({ index: 1, direction: 'up' })
    );

    expect(state.ingredients).toEqual([sauce1, main, sauce2]);

    expect(state).toEqual({
      bun: bun,
      ingredients: [sauce1, main, sauce2],
    });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном clearBurgerConstructor - очистка конструктора', () => {
    const prevState: TConstructorState = {
      bun,
      ingredients: [main, sauce1, sauce2],
    };

    const state: TConstructorState = constructorReducer(
      prevState,
      clearBurgerConstructor()
    );

    expect(state.ingredients).toEqual([]);

    expect(state).toEqual(initialState);
  });
});
