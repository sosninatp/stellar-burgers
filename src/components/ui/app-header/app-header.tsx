import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { Link } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => (
  <header className={styles.header}>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        <Link to="/" className={styles.link}>
          <BurgerIcon type={'primary'} />
          <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
        </Link>
        <Link to="/feed" className={styles.link}>
          <ListIcon type={'primary'} />
          <p className="text text_type_main-default ml-2">Лента заказов</p>
        </Link>
      </div>
      <div className={styles.logo}>
        <Logo className="" />
      </div>
      <div className={styles.link_position_last}>
        <Link to="/profile" className={styles.link}>
          <ProfileIcon type={'primary'} />
          <p className="text text_type_main-default ml-2">
            {userName ?? 'Личный кабинет'}
          </p>
        </Link>
      </div>
    </nav>
  </header>
);
