import { expect, test } from '../fixtures';
import { createTenantSetup, loginUser, TenantDescriptor } from '../helper';
import { uploadAndSelect } from '../helper/fileManager';
import { screenSave } from '../screenSave';

const getBaseURL = ({ slug }: { slug: string }) =>
  `http://${slug}.local.lotta.schule:3000`;

test.describe('Tenant administration', () => {
  test.describe('general settings', () => {
    test.describe.configure({ mode: 'serial' });
    const somewhatUniqueIdentifier = Math.random().toString(36).substring(7);
    let tenant: TenantDescriptor;
    test.beforeAll(async ({ browser, admin, browserName }) => {
      const { tenant: t } = await createTenantSetup(
        { browser, admin },
        {
          name: `AdminSettings General Lotta ${browserName} ${somewhatUniqueIdentifier}`,
          slug: `adminsettings-general-lotta-${browserName}-${somewhatUniqueIdentifier}`,
        }
      );
      tenant = t;
    });

    test.beforeEach(async ({ page, isMobile, admin }) => {
      const baseURL = getBaseURL({ slug: tenant.slug });
      const { loginDialog } = await loginUser(
        { page, baseURL: baseURL!, isMobile },
        admin
      );
      await expect(loginDialog).not.toBeVisible();

      await page.goto(`${baseURL}/admin`, { waitUntil: 'domcontentloaded' });

      await screenSave(await page.screenshot(), 'admin-settings');

      await page.getByRole('button', { name: /grundeinstellungen/i }).click();
      await page.waitForURL(`${baseURL}/admin/general`, {
        waitUntil: 'domcontentloaded',
      });

      await screenSave(await page.screenshot(), 'admin-settings-general');
    });

    test('should be able to update the tenant name', async ({
      page,
      browser,
    }) => {
      const baseURL = getBaseURL({ slug: tenant.slug });

      await expect(
        page.getByRole('textbox', { name: 'Name der Seite' })
      ).toHaveValue(tenant.title);
      await page
        .getByRole('textbox', { name: 'Name der Seite' })
        .fill('Example Lotta Schule');
      await page.getByRole('button', { name: /speichern/i }).click();

      await page.reload();
      await expect(
        page.getByRole('textbox', { name: 'Name der Seite' })
      ).toHaveValue('Example Lotta Schule');

      const newBrowserContext = await browser.newContext();
      const newPage = await newBrowserContext.newPage();

      await newPage.goto(baseURL, { waitUntil: 'domcontentloaded' });

      await expect(newPage).toHaveTitle('Example Lotta Schule');
      await expect(newPage.getByRole('banner')).toContainText(
        'Example Lotta Schule'
      );
    });

    test('should be able to update the tenant logo', async ({
      page,
      browser,
    }) => {
      const baseURL = getBaseURL({ slug: tenant.slug });
      const editOverlay = page
        .getByLabel('Logo der Seite')
        .getByTestId('EditOverlay');

      await editOverlay.click();

      await uploadAndSelect(
        { page },
        'Meine Bilder',
        'fixtures/images/logo.png'
      );

      // TODO: Find smth better
      await expect(editOverlay.locator('img')).toBeVisible();

      await page.getByRole('button', { name: /speichern/i }).click();

      const newBrowserContext = await browser.newContext();
      const newPage = await newBrowserContext.newPage();

      await newPage.goto(baseURL, { waitUntil: 'domcontentloaded' });

      await expect(newPage.getByRole('banner').locator('img')).toBeVisible();
    });
  });
});
