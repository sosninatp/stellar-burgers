import { Preloader, OrderInfoUI } from '@ui';
import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const location = useLocation();
  const orders = location.pathname.startsWith('/feed/')
    ? useSelector((store) => store.feed.orders)
    : useSelector((store) => store.order.userOrders);

  const { number } = useParams();

  const orderData = orders.filter(
    (userOrder) => userOrder.number.toString() === number
  )[0];

  const ingredients: TIngredient[] = useSelector(
    (store) => store.ingredients.ingredients
  );

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
