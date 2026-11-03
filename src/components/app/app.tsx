import { AppHeader } from '@components';
import { Preloader } from '@ui';
import { useEffect } from 'react';

import { getIngredientsThunk } from '../../services/slices/ingredientsSlice';
import { checkUserAuthThunk } from '../../services/slices/userSlice';
import { useDispatch, useSelector } from '../../services/store';
import RouteComponent from '../appRoutes/AppRoutes';

import type { AppContentProps } from './type';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const isIngredientsLoading = useSelector((state) => state.ingredients.isLoading);
  const ingredientsError = useSelector((state) => state.ingredients.error);

  const dispatch = useDispatch();

  useEffect(() => {
    // получение ингредиентов из апи диспатчем который сделали в сторе
    dispatch(getIngredientsThunk());
    // определиться залогинен ли пользователь - установить флаг isAuthChecked
    dispatch(checkUserAuthThunk());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        isLoading={isIngredientsLoading}
        error={ingredientsError ? new Error() : null}
      />
    </div>
  );
};

export default App;

const AppContent = ({ isLoading, error }: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  return <RouteComponent />;
};
