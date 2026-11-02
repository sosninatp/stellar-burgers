import { Preloader, IngredientDetailsUI } from '@ui';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useSelector } from '../../services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();

  const ingredients = useSelector((state) => state.ingredients.ingredients);

  const ingredientData = useMemo(() => {
    if (!ingredients.length || !id) return null;
    return ingredients.find((ingredient) => ingredient._id === id);
  }, [id, ingredients]);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
