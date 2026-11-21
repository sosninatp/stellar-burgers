import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';

import type React from 'react';

type ProtectedRouteProps = {
  children?: React.ReactElement;
  onlyUnAuth?: boolean;
};

export const ProtectedRoute = ({ children, onlyUnAuth }: ProtectedRouteProps) => {
  const location = useLocation();

  const user = useSelector((store) => store.user.user);

  const isAuthChecked = useSelector((store) => store.user.isAuthChecked);

  if (!isAuthChecked) {
    return <div>Загрузка...</div>;
  }

  // Режим 1: Страница приватная (onlyUnAuth === false), но пользователя НЕТ
  if (!onlyUnAuth && !user) {
    // Запоминаем в state, откуда выгнали пользователя
    // Перейди на страницу /login, но положи в бардачок этой новой страницы объект state
    return <Navigate replace to="/login" state={{ from: location }} />;
  }
  // Режим 2: Страница только для неавторизованных (onlyUnAuth === true), но пользователь ЕСТЬ
  if (onlyUnAuth && user) {
    const from = location.state?.from || { pathname: '/' };
    return <Navigate to={from} />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};
