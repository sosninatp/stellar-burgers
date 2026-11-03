import { Preloader, OrderInfoUI } from '@ui';
import { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';
import { getOrderByNumberApi } from '../../utils/burger-api';

import type { TIngredient, TOrder } from '@utils-types';

//Импортируем стили стартера из файла стилей приложения для одиночных страниц деталей
import appStyles from '../app/app.module.css';

export const OrderInfo = (): React.JSX.Element => {
  const location = useLocation();
  const { number } = useParams();

  const ingredients: TIngredient[] = useSelector(
    (store) => store.ingredients.ingredients
  );

  // Локальный стейт для хранения скачанного заказа по его номеру
  const [fetchedOrder, setFetchedOrder] = useState<TOrder | null>(null);

  const feedOrders = useSelector((store) => store.feed.orders);
  const userOrders = useSelector((store) => store.order.userOrders);

  const storeOrders = location.pathname.startsWith('/feed/') ? feedOrders : userOrders;

  const orderFromStore = useMemo(() => {
    if (!number || !storeOrders?.length) return null;
    return storeOrders.find((el) => el.number.toString() === number);
  }, [number, storeOrders]);

  // Если в сторе пусто, берем номер из URL и запрашиваем API
  useEffect(() => {
    if (number && !orderFromStore) {
      getOrderByNumberApi(+number)
        .then((res) => {
          if (res.success && res.orders && res.orders.length > 0) {
            setFetchedOrder(res.orders[0]); // Сохраняем заказ в локальный стейт
          }
        })
        .catch((err) => {
          console.log('Ошибка загрузки заказа по номеру: ', err);
        });
    }
  }, [number]);

  // берем заказ из стора или скачанный с сервера
  const orderData = orderFromStore || fetchedOrder;

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients?.length) return null;

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

  // Проверяем, открыта ли страница как отдельная (в новой вкладке, без фонового бэкграунда)
  const isDetailPage = !location.state?.background;

  if (isDetailPage) {
    return (
      // Применяем стили стартера из app.module.css
      <div className={appStyles.detailPageWrap}>
        <OrderInfoUI orderInfo={orderInfo} />
      </div>
    );
  }

  // Если открыто в модалке — возвращаем UI без стиля
  return <OrderInfoUI orderInfo={orderInfo} />;
};
