import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';

import { loginThunk } from '../../services/slices/userSlice';
import { useDispatch } from '../../services/store';

export const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    dispatch(loginThunk({ email, password }))
      .unwrap()
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
