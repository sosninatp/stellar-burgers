import { combineReducers } from '@reduxjs/toolkit';

import constructorReducer from '../services/slices/constructorSlice';
import feedReducer from '../services/slices/feedSlice';
import ingredientsReducer from '../services/slices/ingredientsSlice';
import orderReducer from '../services/slices/ordersSlice';
import userReducer from '../services/slices/userSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  user: userReducer,
  order: orderReducer,
  feed: feedReducer,
});
