import { test, expect } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const ORDER_NUMBER = '1316';

const ACCESS_TOKEN =
  'актуальный access token для тестов, который нужно получить из вашей сессии';
const REFRESH_TOKEN =
  'актуальный refresh token для тестов, который нужно получить из вашей сессии';

//Создание моковых данных для ингредиентов (в HAR-файле)
test.skip('записывает ингредиенты в HAR', async ({ page }) => {
  await page.routeFromHAR('./tests/hars/ingredients.har', {
    url: '**/ingredients',
    update: false,
  });
  // Открываем страницу, чтобы приложение отправило запрос ингредиентов
  await page.goto('/');
  // Ждём, пока ответ сервера отрисуется на странице (например, появится любая булка)
  await expect(page.getByText(BUN_NAME)).toBeVisible();
});

//Создание моковых данных для запроса данных пользователя
test('записывает ответ GET /auth/user в HAR', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'accessToken',
      value: ACCESS_TOKEN,
      url: 'http://localhost:4000',
    },
  ]);

  await page.addInitScript((refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);
  }, REFRESH_TOKEN);

  // Начинаем запись HAR
  await page.routeFromHAR('./tests/hars/auth_user.har', {
    url: '**/auth/user',
    update: false,
  });
  // Открываем страницу, чтобы приложение отправило запрос
  await page.goto('/');
  // Ждём, пока ответ сервера отрисуется на странице (например, появится любая булка)
  await expect(page.getByText(BUN_NAME)).toBeVisible();
});

//Создание моковых данных для ответа на запрос создания заказа
test.skip('записывает ответ POST /orders в HAR', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'accessToken',
      value: ACCESS_TOKEN,
      url: 'http://localhost:4000',
    },
  ]);

  await page.addInitScript((refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);
  }, REFRESH_TOKEN);

  // Начинаем запись HAR
  await page.routeFromHAR('./tests/hars/orders.har', {
    url: '**/order',
    update: false,
  });

  // Перед сборкой бургера дожидаемся успешного ответа /auth/user
  page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith('/auth/user') &&
      response.request().method() === 'GET'
  );

  await page.goto('/');

  await expect(page.locator('header a[href="/profile"]')).not.toContainText(
    'Личный кабинет'
  );

  // Ждём, пока ответ сервера отрисуется на странице (например, появится любая булка)
  await expect(page.getByText(BUN_NAME)).toBeVisible();

  // берем булку
  const bun = page.getByText(BUN_NAME);
  await expect(bun).toBeVisible(); ////надо ли эту проверку?
  // берем начинку
  const main = page.getByText(MAIN_NAME);
  await expect(main).toBeVisible(); ////надо ли эту проверку?

  //добавляем булку и начинку:
  const bunCard = page.locator('li', { hasText: BUN_NAME });
  await bunCard.getByRole('button', { name: 'Добавить' }).click();
  const mainCard = page.locator('li', { hasText: MAIN_NAME });
  await mainCard.getByRole('button', { name: 'Добавить' }).click();

  // берем конструктор:
  const burgerConstructor = page.locator(
    '[class*="burger-constructor__burger_constructor"]'
  );

  // проверяем что в конструкторе появились булка и начинка
  await expect(burgerConstructor).toContainText(`${BUN_NAME} (верх)`);
  await expect(burgerConstructor).toContainText(`${BUN_NAME} (низ)`);
  await expect(burgerConstructor).toContainText(MAIN_NAME);

  // API Playwright для ожидания сетевого ответа
  const orderResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith('/orders') &&
      response.request().method() === 'POST'
  );

  //нажимаем на кнопку 'Оформить заказ'
  await burgerConstructor.getByRole('button', { name: 'Оформить заказ' }).click();

  const orderResponse = await orderResponsePromise;

  expect(orderResponse.ok()).toBeTruthy();
});

test.describe('Интеграционные тесты страницы конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Перехватываем запрос на получение списка ингредиентов из HAR-файла
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/ingredients',
      update: false,
    });

    await page.goto('/');

    // Ждём, пока ответ сервера отрисуется на странице (например, появится любая булка)
    const bun = page.getByText(BUN_NAME);
    await expect(bun).toBeVisible();
  });

  test('Тест добавления ингредиветов в конструктор', async ({ page }) => {
    const mainsList = page.getByRole('heading', { name: 'Начинки' }).locator(' + ul'); //+ ul означает непосредственно следующий соседний элемент <ul>

    const firstMain = mainsList.getByRole('listitem').first();
    await firstMain.getByRole('button', { name: 'Добавить' }).click();

    const mainName = await firstMain.locator('p').last().innerText();

    // берем контруктор
    const burgerConstructor = page.locator(
      '[class*="burger-constructor__burger_constructor_"]' //*= означает «значение атрибута содержит эту строку»
    );

    await expect(burgerConstructor).toContainText(mainName);
  });

  test('Тест открытия и закрытия модального окна ингредиента', async ({ page }) => {
    // Ждём, пока ответ сервера отрисуется на странице (например, появится любая булка)
    const bun = page.getByText(BUN_NAME);
    await expect(bun).toBeVisible();
    // нажать на название ингредиента
    await bun.click();
    // проверить появление его деталей:
    const modalTitle = page.getByRole('heading', { name: 'Информация об ингредиенте' });
    await expect(modalTitle).toBeVisible();
    // await expect(page.locator('#modals').).toContainText('Информация об ингредиенте');
    await expect(page.locator('#modals')).toContainText(BUN_NAME);
    const closeModalBtn = page
      .locator('#modals')
      .getByRole('button', { name: 'Закрыть' });

    // закрыть окно крестиком и проверить, что оно исчезло:
    await closeModalBtn.click();

    await expect(modalTitle).not.toBeVisible();

    // закрытие по клику на оверлей:
    // нажать на название ингредиента
    await bun.click();
    // проверить появление его деталей:
    await expect(modalTitle).toBeVisible();
    await expect(page.locator('#modals')).toContainText(BUN_NAME);
    const modalOverlay = page.locator('[class*="modal-overlay"]');

    // закрыть окно крестиком и проверить, что оно исчезло:
    //точка внутри самого элемента modalOverlay: 1 пиксель от его левого края и 1 пиксель от верхнего
    await modalOverlay.click({ position: { x: 1, y: 1 } });

    await expect(modalTitle).not.toBeVisible();

    // закрытие модального окна клавишей Escape
    // нажать на название ингредиента
    await bun.click();
    // проверить появление его деталей:
    await expect(modalTitle).toBeVisible();
    await expect(page.locator('#modals')).toContainText(BUN_NAME);
    // закрыть модальное окно клавишей Escape и проверить, что оно исчезло:
    // отправить клавишу Escape через Playwright
    await page.keyboard.press('Escape');
    await expect(modalTitle).not.toBeVisible();
    await expect(page.locator('#modals')).not.toContainText(BUN_NAME);
  });

  test('Тест создания заказа', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        url: 'http://localhost:4000',
      },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.routeFromHAR('./tests/hars/auth_user.har', {
      url: '**/auth/user',
      update: false,
    });

    await page.routeFromHAR('./tests/hars/orders.har', {
      url: '**/orders',
      update: false,
      notFound: 'abort',
    });

    await page.goto('/');

    await expect(page.locator('header a[href="/profile"]')).not.toContainText(
      'Личный кабинет'
    );

    // берем булку
    const bun = page.getByText(BUN_NAME);
    await expect(bun).toBeVisible();
    // берем начинку
    const main = page.getByText(MAIN_NAME);
    await expect(main).toBeVisible();

    // Находим карточку булки и нажимаем кнопку «Добавить»
    const bunCard = page.locator('li', { hasText: BUN_NAME });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();
    // Находим карточку начинки и нажимаем кнопку «Добавить»
    const mainCard = page.locator('li', { hasText: MAIN_NAME });
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    // берем конструктор:
    const burgerConstructor = page.locator(
      '[class*="burger-constructor__burger_constructor"]'
    );

    // проверяем, что в конструкторе появились булка и начинка
    await expect(burgerConstructor).toContainText(`${BUN_NAME} (верх)`);
    await expect(burgerConstructor).toContainText(`${BUN_NAME} (низ)`);
    await expect(burgerConstructor).toContainText(MAIN_NAME);

    //нажимаем на кнопку 'Оформить заказ'
    await burgerConstructor.getByRole('button', { name: 'Оформить заказ' }).click();

    // проверяем, что открылось модальное окно с номером заказа
    const orderModal = page.locator('[class*="modal__modal"]');

    await expect(orderModal).toBeVisible();
    await expect(orderModal).toContainText(ORDER_NUMBER);

    // закрываем модальное окно
    const closeModalBtn = orderModal.getByRole('button', { name: 'Закрыть' });
    await closeModalBtn.click();
    // проверяем, что модальное окно  исчезло
    await expect(orderModal).not.toBeVisible();

    // проверяем, что после оформления заказа конструктор пуст
    await expect(burgerConstructor).not.toContainText(`${BUN_NAME} (верх)`);
    await expect(burgerConstructor).not.toContainText(`${BUN_NAME} (низ)`);
    await expect(burgerConstructor).not.toContainText(MAIN_NAME);
    await expect(burgerConstructor).toContainText('Выберите булки');
    await expect(burgerConstructor).toContainText('Выберите начинку');
  });
});
