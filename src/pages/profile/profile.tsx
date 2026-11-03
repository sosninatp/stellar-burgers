import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { updateUserThunk } from '../../services/slices/userSlice';
import { useSelector, useDispatch } from '../../services/store';

export const Profile = (): React.JSX.Element => {
  const user = useSelector((store) => store.user.user);
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  useEffect(() => {
    setFormValue((prevState) => ({
      ...prevState,
      name: user?.name || '',
      email: user?.email || '',
    }));
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    dispatch(
      updateUserThunk({
        email: formValue.email,
        name: formValue.name,
        password: formValue.password,
      })
    )
      .unwrap()
      .then(() => {
        // Очищаем инпут пароля после успешного обновления на сервере
        setFormValue((prev) => ({ ...prev, password: '' }));
      });
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();

    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Если в Redux пользователя больше нет (произошел логаут),
  // останавливаем рендер формы, чтобы старый email не залипал на экране
  if (!user) {
    return <></>; // Возвращаем пустоту, пока ProtectedRoute делает редирект на /login
  }

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
