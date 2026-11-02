import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearBurgerConstructor } from '../../services/slices/constructorSlice';
import { orderBurgerThunk, clearOrderData } from '../../services/slices/ordersSlice';
import { useDispatch, useSelector } from '../../services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const orderRequest = useSelector((state) => state.order.orderRequest);
  const orderModalData = useSelector((state) => state.order.orderModalData);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Данные пользователя и конструктора
  const user = useSelector((state) => state.user.user);
  const constructorItems = useSelector((state) => state.burgerConstructor);

  const ingredientIds = constructorItems.bun
    ? [
        constructorItems.bun._id,
        ...constructorItems.ingredients.map((item) => item._id),
        constructorItems.bun._id,
      ]
    : [];

  const onOrderClick = (): void => {
    if (!constructorItems.bun || orderRequest) return;
    if (!user) {
      navigate('/login', { replace: true });
    }
    dispatch(orderBurgerThunk(ingredientIds))
      .unwrap()
      .then(() => dispatch(clearBurgerConstructor()))
      .catch((err) => console.error('Ошибка отправки заказа:', err));
  };

  const closeOrderModal = (): void => {
    dispatch(clearOrderData());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
