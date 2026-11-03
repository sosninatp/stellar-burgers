import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';

import { registerThunk } from '../../services/slices/userSlice';
import { useDispatch } from '../../services/store';

export const Register = (): React.JSX.Element => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    dispatch(registerThunk({ email, name: userName, password }))
      .unwrap()
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
