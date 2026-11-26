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
  type: 'main',
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
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
};

const sauce = {
  _id: '643d69a5c3f7b9001cfa0945',
  id: 'sauce-1',
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
    const state: TConstructorState = constructorReducer(initialState, {
      type: addIngredient.type,
      payload: bun,
    });

    expect(state).toEqual({
      bun,
      ingredients: [],
    });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном addIngredient - добавление ингредиента', () => {
    const state: TConstructorState = constructorReducer(initialState, {
      type: addIngredient.type,
      payload: sauce,
    });

    expect(state).toEqual({
      bun: null,
      ingredients: [sauce],
    });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном removeIngredient - удаление ингредиента', () => {
    const prevState: TConstructorState = {
      bun,
      ingredients: [main, sauce],
    };

    const state: TConstructorState = constructorReducer(prevState, {
      type: removeIngredient.type,
      payload: 'sauce-1',
    });

    expect(state).toEqual({
      bun: bun,
      ingredients: [main],
    });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном moveIngredient - изменение порядка начинок в конструкторе', () => {
    const prevState: TConstructorState = {
      bun,
      ingredients: [main, sauce],
    };

    const state: TConstructorState = constructorReducer(prevState, {
      type: moveIngredient.type,
      payload: {
        index: 1,
        direction: 'up',
      },
    });

    expect(state.ingredients).toEqual([sauce, main]);

    expect(state).toEqual({
      bun: bun,
      ingredients: [sauce, main],
    });
  });

  test('Тест проверяет работу редьюсера constructorReducer как функции при его вызове с экшеном clearBurgerConstructor - очистка конструктора', () => {
    const prevState: TConstructorState = {
      bun,
      ingredients: [main, sauce],
    };

    const state: TConstructorState = constructorReducer(prevState, {
      type: clearBurgerConstructor.type,
    });

    expect(state.ingredients).toEqual([]);

    expect(state).toEqual(initialState);
  });
});
