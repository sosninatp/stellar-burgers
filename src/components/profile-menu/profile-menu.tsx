import { ProfileMenuUI } from '@ui';
import { useLocation } from 'react-router-dom';

import { logoutThunk } from '../../services/slices/userSlice';
import { useDispatch } from '../../services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    dispatch(logoutThunk());
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
