import { expect, test } from '../fixtures';
import { createTenantSetup, loginUser, TenantDescriptor } from '../helper';
import { uploadAndSelect } from '../helper/fileManager';

const getBaseURL = ({ slug }: { slug: string }) =>
  `http://${slug}.local.lotta.schule:3000`;

test.describe('Tenant administration', () => {
  test.describe('general settings', () => {
    test.describe.configure({ mode: 'serial' });
    const somewhatUniqueIdentifier = Math.random().toString(36).substring(7);
    let tenant: TenantDescriptor = undefined!;
    test.beforeAll(async ({ browser, admin, browserName }) => {
      const result = await createTenantSetup(
        { browser, admin },
        {
          name: `AdminSettings General Lotta ${browserName} ${somewhatUniqueIdentifier}`,
          slug: `adminsettings-general-lotta-${browserName}-${somewhatUniqueIdentifier}`,
        }
      );
      tenant = result.tenant;
    });

    test.beforeEach(async ({ page, isMobile, admin, takeScreenshot }) => {
      const baseURL = getBaseURL({ slug: tenant.slug });
      const { loginDialog } = await loginUser(
        { page, baseURL: baseURL!, isMobile },
        admin
      );
      await expect(loginDialog).not.toBeVisible();

      await page.goto(`${baseURL}/admin`, { waitUntil: 'domcontentloaded' });

      await takeScreenshot('admin-settings');

      await page.getByRole('button', { name: /allgemein/i }).click();
      await page.waitForURL(`${baseURL}/admin/general`, {
        waitUntil: 'domcontentloaded',
      });

      await takeScreenshot('admin-settings-general');
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
      const saveButton = page.getByRole('button', { name: /speichern/i });
      await saveButton.click();
      await expect(saveButton).toBeDisabled();

      await expect(saveButton).not.toBeDisabled();

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
      isMobile,
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

      if (!isMobile) {
        await expect(newPage.getByRole('banner').locator('img')).toBeVisible();
      }
    });
  });
});
