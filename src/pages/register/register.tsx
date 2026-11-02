import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { registerThunk } from '../../services/slices/userSlice';
import { useDispatch } from '../../services/store';

export const Register = (): React.JSX.Element => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    dispatch(registerThunk({ email, name: userName, password }))
      .unwrap()
      .then(() => {
        // проверяем: есть ли в бардачке адрес страницы, с которой нас выгнали
        // если есть (например, /profile) — ведем туда. Если нет — отправляем на главную '/'
        const from = location.state?.from || { pathname: '/' };
        navigate(from, { replace: true });
      })
      .catch((err) => console.error('Ошибка регистрации: ', err));
  };

  return (
    <RegisterUI
      errorText=""
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
