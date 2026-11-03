import { ConstructorPage } from '@pages';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';

import { Feed } from '../../pages/feed';
import { ForgotPassword } from '../../pages/forgot-password';
import { Login } from '../../pages/login';
import { NotFound404 } from '../../pages/not-fount-404';
import { Profile } from '../../pages/profile';
import { ProfileOrders } from '../../pages/profile-orders';
import { Register } from '../../pages/register';
import { ResetPassword } from '../../pages/reset-password';
import { IngredientDetails } from '../ingredient-details/index';
import { Modal } from '../modal/modal';
import { OrderInfo } from '../order-info/index';
import { ProtectedRoute } from '../ProtectedRoute/';

const RouteComponent = (): React.JSX.Element => {
  //для модальных
  const location = useLocation();
  // Читаем "записку в бардачке" (состояние, переданное при клике на Link)
  const backgroundLocation = location.state?.background;
  const navigate = useNavigate();

  return (
    <>
      {/* Если в бардачке location.state есть backgroundLocation 
        (мы кладем его при открытии модального окна из списка объектовв location ), 
        то не закрывать страницу этого списка backgroundLocation,
        а если открыли по прямой ссылке страницу с компонентом - то backgroundLocation нет
        и отображаем сразу компонент */}
      {
        <Routes location={backgroundLocation || location}>
          <Route path="/" element={<ConstructorPage />} />
          <Route path="/feed" element={<Feed />} />

          {/* пропс onlyUnAuth - Режим №1 (только для неавторизованных) */}
          <Route
            path="/login"
            element={
              <ProtectedRoute onlyUnAuth={true}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute onlyUnAuth={true}>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ProtectedRoute onlyUnAuth>
                <ForgotPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute onlyUnAuth>
                <ResetPassword />
              </ProtectedRoute>
            }
          />

          {/* Обертка БЕЗ пропса — включает Режим №2 (только для авторизованных) */}
          <Route element={<ProtectedRoute onlyUnAuth={false} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/orders" element={<ProfileOrders />} />
          </Route>

          <Route path="*" element={<NotFound404 />} />

          <Route path="/ingredients/:id" element={<IngredientDetails />} />
          <Route path="/feed/:number" element={<OrderInfo />} />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderInfo />
              </ProtectedRoute>
            }
          />
        </Routes>
      }

      {/* Модальное окно для информации о заказе */}
      {backgroundLocation && (
        <Routes>
          {/* Модальное окно ингредиента */}
          <Route
            path="/ingredients/:id"
            element={
              <Modal
                title="Информация об ингредиенте"
                onClose={() => {
                  navigate(-1);
                }}
              >
                <IngredientDetails />
              </Modal>
            }
          />
          {/* Модалmьное окно заказа из ленты заказов */}
          <Route
            path="/feed/:number"
            element={
              <Modal
                title="Информация о заказе"
                onClose={() => {
                  navigate(-1);
                }}
              >
                <OrderInfo />
              </Modal>
            }
          />

          {/* Модалmьное окно заказа из истории заказов */}
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <Modal
                  title="Информация о заказе в истории"
                  onClose={() => {
                    navigate(-1);
                  }}
                >
                  <OrderInfo />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};

export default RouteComponent;
