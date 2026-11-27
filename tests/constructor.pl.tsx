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
    update: true,
  });
  // Открываем страницу, чтобы приложение отправило запрос ингредиентов
  await page.goto('/');
  // Ждём, пока ответ сервера отрисуется на странице (например, появится любая булка)
  await expect(page.getByText(BUN_NAME)).toBeVisible();
});

//Создание моковых данных для запроса данных пользователя
test.skip('записывает ответ GET /auth/user в HAR', async ({ page, context }) => {
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
    update: true,
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
    url: '**/orders',
    update: true,
  });

  // Перед сборкой бургера дожидаемся успешного ответа /auth/user
  await page.waitForResponse(
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

  // Находим булку
  const bun = page.getByText(BUN_NAME);
  await expect(bun).toBeVisible();
  // Находим начинку
  const main = page.getByText(MAIN_NAME);
  await expect(main).toBeVisible();

  // Добавляем булку и начинку:
  const bunCard = page.locator('li', { hasText: BUN_NAME });
  await bunCard.getByRole('button', { name: 'Добавить' }).click();
  const mainCard = page.locator('li', { hasText: MAIN_NAME });
  await mainCard.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByAltText(`${BUN_NAME} (верх)`)).toBeVisible();
  await expect(page.getByAltText(`${BUN_NAME} (низ)`)).toBeVisible();
  await expect(page.getByAltText(`${MAIN_NAME}`)).toBeVisible();

  // API Playwright для ожидания сетевого ответа
  const orderResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith('/orders') &&
      response.request().method() === 'POST'
  );

  //нажимаем на кнопку 'Оформить заказ'
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

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

  test('Тест добавляет ингредиенты в конструктор', async ({ page }) => {
    // Находим секцию конcтруктора
    const constructorSection = page.locator('section').last();

    // проверяем что изначально конструктор пуст
    await expect(constructorSection.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructorSection.getByText('Выберите начинку')).toBeVisible();

    // Находим список булок
    const bunsList = page.getByRole('heading', { name: 'Булки' }).locator(' + ul'); //+ ul означает непосредственно следующий соседний элемент <ul>
    // бенрем первый элемент списка булок и добавляем его в конструктор
    const firstBun = bunsList.getByRole('listitem').first();
    await firstBun.getByRole('button', { name: 'Добавить' }).click();
    const bunName = await firstBun.locator('p').last().innerText();

    // Находим список начинок
    const mainsList = page.getByRole('heading', { name: 'Начинки' }).locator(' + ul');
    // Находим первый элемент списка начинок и добавляем его в конструктор
    const firstMain = mainsList.getByRole('listitem').first();
    await firstMain.getByRole('button', { name: 'Добавить' }).click();
    const mainName = await firstMain.locator('p').last().innerText();

    // Находим список соусов
    const saucesList = page.getByRole('heading', { name: 'Соусы' }).locator(' + ul');
    // Находим первый элемент списка соусов и добавляем его в конструктор
    const firstSauce = saucesList.getByRole('listitem').first();
    await firstSauce.getByRole('button', { name: 'Добавить' }).click();
    const sauceName = await firstSauce.locator('p').last().innerText();

    // проверяем что в конструкторе появились булка, начинка и соус
    await expect(constructorSection.getByText(`${bunName} (верх)`)).toBeVisible();
    await expect(constructorSection.getByText(`${bunName} (низ)`)).toBeVisible();
    await expect(constructorSection.getByText(mainName)).toBeVisible();
    await expect(constructorSection.getByText(sauceName)).toBeVisible();

    // проверяем что в конструкторе исчезли надписи "Выберите булки" и "Выберите начинку"
    await expect(constructorSection.getByText('Выберите булки')).not.toBeVisible();
    await expect(constructorSection.getByText('Выберите начинку')).not.toBeVisible();
  });

  test('Тест открывает и закрывает модальное окно ингредиента', async ({ page }) => {
    // Находим список булок
    const bunsList = page.getByRole('heading', { name: 'Булки' }).locator(' + ul'); //+ ul означает непосредственно следующий соседний элемент <ul>
    // Находим второй элемент списка булок
    const bun = bunsList.getByRole('listitem').nth(1);
    const bunName = await bun.locator('p').last().innerText();

    await expect(bun).toBeVisible();
    // нажимаем на название ингредиента
    await bun.click();
    // проверяем появление его деталей:
    const modalTitle = page.getByRole('heading', { name: 'Информация об ингредиенте' });
    await expect(modalTitle).toBeVisible();
    await expect(
      page.locator('#modals').getByText(bunName, { exact: true })
    ).toBeVisible();
    const closeModalBtn = page
      .locator('#modals')
      .getByRole('button', { name: 'Закрыть' });

    // закрываем модальное окно крестиком и проверяем, что оно исчезло:
    await closeModalBtn.click();
    await expect(modalTitle).not.toBeVisible();

    // проверяем закрытие модального окна по клику на оверлей:
    // нажимаем на ингредиент
    await bun.click();
    // проверяем появление его деталей в модальном окне:
    await expect(modalTitle).toBeVisible();
    await expect(
      page.locator('#modals').getByText(bunName, { exact: true })
    ).toBeVisible();

    const modalOverlay = page.getByTestId('modal-overlay');
    await expect(modalOverlay).toBeVisible();

    // закрываем модальное окно по клику на оверлей и проверяем, что оно исчезло:
    // точка внутри самого элемента modalOverlay: 1 пиксель от его левого края и 1 пиксель от верхнего
    await modalOverlay.click({ position: { x: 1, y: 1 } });

    await expect(modalTitle).not.toBeVisible();

    // закрываем модальное окно клавишей Escape
    // нажимаем на ингредиент
    await bun.click();
    // проверяем появление его деталей в модальном окне:
    await expect(modalTitle).toBeVisible();
    await expect(
      page.locator('#modals').getByText(bunName, { exact: true })
    ).toBeVisible();
    // закрываем модальное окно клавишей Escape и проверяем, что оно исчезло:
    // отправляе клавишу Escape через Playwright
    await page.keyboard.press('Escape');
    await expect(modalTitle).not.toBeVisible();
    await expect(page.locator('#modals')).not.toContainText(bunName);
  });

  test('Тест создает заказ и очищает конструктор', async ({ context, page }) => {
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

    // Находим булку
    const bun = page.getByText(BUN_NAME);
    await expect(bun).toBeVisible();
    // Находим начинку
    const main = page.getByText(MAIN_NAME);
    await expect(main).toBeVisible();

    // Находим карточку булки и нажимаем кнопку «Добавить»
    const bunCard = page.locator('li', { hasText: BUN_NAME });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();
    // Находим карточку начинки и нажимаем кнопку «Добавить»
    const mainCard = page.locator('li', { hasText: MAIN_NAME });
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    // Находим секцию конструктора
    const constructorSection = page.locator('section').last();

    // проверяем, что в конструкторе появились булка и начинка
    await expect(constructorSection).toContainText(`${BUN_NAME} (верх)`);
    await expect(constructorSection).toContainText(`${BUN_NAME} (низ)`);
    await expect(constructorSection).toContainText(MAIN_NAME);

    //нажимаем на кнопку 'Оформить заказ'
    await constructorSection.getByRole('button', { name: 'Оформить заказ' }).click();

    // проверяем, что открылось модальное окно с номером заказа
    const orderModal = page.locator('#modals');

    await expect(
      orderModal.getByRole('heading', {
        name: ORDER_NUMBER,
        level: 2,
        exact: true, //проверяет точное имя заголовка
      })
    ).toHaveText(ORDER_NUMBER); //дополнительно сравнивает содержимое заголовка с ожидаемым номером без частичного совпадения

    // Проверяем очистку конструктора до закрытия модального окна
    await expect(constructorSection).not.toContainText(`${BUN_NAME} (верх)`);
    await expect(constructorSection).not.toContainText(`${BUN_NAME} (низ)`);
    await expect(constructorSection).not.toContainText(MAIN_NAME);
    await expect(constructorSection).toContainText('Выберите булки');
    await expect(constructorSection).toContainText('Выберите начинку');

    // закрываем модальное окно
    const closeModalBtn = orderModal.getByRole('button', { name: 'Закрыть' });
    await closeModalBtn.click();
    // проверяем, что модальное окно исчезло
    await expect(orderModal).not.toBeVisible();
  });
});
