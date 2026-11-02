import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { loginThunk } from '../../services/slices/userSlice';
import { useDispatch } from '../../services/store';

export const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 Активируем хук локации

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    dispatch(loginThunk({ email, password }))
      .unwrap()
      .then(() => {
        // проверяем, есть ли в бардачке адрес страницы, с которой нас выгнали
        // если есть (например, /profile) — ведем туда. Если нет — отправляем на главную '/'
        const from = location.state?.from || { pathname: '/' };
        navigate(from, { replace: true });
      })
      .catch((err) => console.error('Ошибка логина: ', err));
  };

  return (
    <LoginUI
      errorText=""
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
