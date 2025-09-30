import { expect, test as setup } from './fixtures';

setup(
  'The first user should be able to login with his new password',
  async ({ page, isMobile, admin, baseURL }) => {
    // This is the baseURL from the fixtures. Just call it now so the fixture chain gets called once
    await page.goto(baseURL!);

    if (isMobile) {
      page.getByRole('button', { name: /menü öffnen/i }).tap();
      await expect(page.getByTestId('BaseLayoutSidebar')).toBeVisible();
    }

    const loginButton = page.getByRole('button', { name: /anmelden/i });
    await loginButton.click();

    const loginDialog = page.getByRole('dialog', { name: /anmelden/i });
    await loginDialog.waitFor({ state: 'visible', timeout: 2500 });

    page.screenshot();
    loginDialog.screenshot();

    await loginDialog
      .getByRole('textbox', { name: /email/i })
      .fill(admin.email);

    await loginDialog
      .getByRole('textbox', { name: /passwort/i })
      .fill(admin.password);

    await loginDialog.getByRole('button', { name: /anmelden/i }).click();

    // TODO: Make a test for the password update dialog
    //
    // const updatePasswordDialog = page.getByRole('dialog', {
    //   name: /passwort ändern/i,
    // });
    // await expect(updatePasswordDialog).toBeVisible();

    // // On first-ever try, there is an automatic password update
    // await updatePasswordDialog.waitFor({ state: 'visible' });
    // await updatePasswordDialog
    //   .getByRole('textbox', { name: 'Neues Passwort:', exact: true })
    //   .fill(userDefaultPassword);
    // await updatePasswordDialog
    //   .getByRole('textbox', { name: 'Wiederholung Neues Passwort:' })
    //   .fill(userDefaultPassword);
    // await page.keyboard.press('Enter');

    // await updatePasswordDialog.waitFor({ state: 'hidden' });
    await loginDialog.waitFor({ state: 'hidden', timeout: 15_000 });

    expect(page.getByRole('button', { name: /Mein Profil/i })).toBeVisible();
  }
);
