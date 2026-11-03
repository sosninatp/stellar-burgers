import { Preloader, IngredientDetailsUI } from '@ui';
import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';

//Импортируем стили стартера из файла стилей приложения для одиночных страниц деталей
import appStyles from '../app/app.module.css';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const ingredients = useSelector((state) => state.ingredients.ingredients);

  const ingredientData = useMemo(() => {
    if (!ingredients.length || !id) return null;
    return ingredients.find((ingredient) => ingredient._id === id);
  }, [id, ingredients]);

  if (!ingredientData) {
    return <Preloader />;
  }

  // Проверяем, открыта ли страница как отдельная (в новой вкладке, без фонового бэкграунда)
  const isDetailPage = !location.state?.background;

  if (isDetailPage) {
    return (
      <div className={appStyles.detailPageWrap}>
        <IngredientDetailsUI ingredientData={ingredientData} />
      </div>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
