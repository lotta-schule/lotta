import { expect, tenantTest as test } from '../fixtures';

test.describe('Not found', () => {
  for (const path of ['/gibt-es-nicht', '/a/999999-gibt-es-nicht']) {
    test(`${path} shows the not-found page within the tenant layout`, async ({
      page,
      baseURL,
      isMobile,
    }) => {
      const response = await page.goto(baseURL + path);
      expect(response?.status()).toBe(404);

      const main = page.getByRole('main');
      await expect(
        main.getByRole('heading', { name: 'Seite nicht gefunden' })
      ).toBeVisible();
      // the regular navigation and user menu are there
      await expect(
        page.getByRole('navigation').first().getByRole('button', {
          name: 'Startseite',
        })
      ).toBeVisible();
      if (isMobile) {
        await page.getByRole('button', { name: /menü öffnen/i }).click();
      }
      await expect(
        page.getByRole('button', { name: /anmelden/i })
      ).toBeVisible();

      await main.getByRole('link', { name: 'Zur Startseite' }).click();
      await page.waitForURL(baseURL + '/');
    });
  }

  test('the catch-all route does not hide proxied or static files', async ({
    request,
    baseURL,
  }) => {
    for (const path of ['/manifest.json', '/favicon/favicon.ico']) {
      const response = await request.get(baseURL + path);
      expect(response.status(), path).toBe(200);
    }
  });
});
