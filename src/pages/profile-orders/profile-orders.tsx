import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { getUserOrdersThunk } from '../../services/slices/ordersSlice';
import { useSelector, useDispatch } from '../../services/store';

import type { TOrder } from '@utils-types';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserOrdersThunk());
  }, []);

  const orders: TOrder[] = useSelector((state) => state.order.userOrders);

  return <ProfileOrdersUI orders={orders} />;
};
