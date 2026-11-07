import { expect, tenantTest as test } from '../fixtures';

test.describe('Calendar', () => {
  test.use({ loginAs: 'admin' });

  test(
    'an admin creates a public calendar with an event, which can be subscribed to',
    { tag: '@smoke' },
    async ({ page, playwright }) => {
      const id = Date.now().toString(36);
      const calendarName = `Schulkalender ${id}`;
      const eventName = `Elternabend ${id}`;
      let subscriptionUrl = '';

      await page.goto('/admin/calendars');

      await test.step('create a public calendar', async () => {
        // the toolbar button opens a menu, its first item opens the dialog
        await page.getByRole('button', { name: 'Kalender verwalten' }).click();
        await page
          .getByRole('menuitem', { name: 'Kalender verwalten' })
          .click();
        const manageDialog = page.getByRole('dialog', {
          name: 'Kalender verwalten',
        });
        await manageDialog
          .getByRole('button', { name: 'Kalender erstellen' })
          .click();

        const createDialog = page.getByRole('dialog', {
          name: 'Kalender erstellen',
        });
        await createDialog
          .getByRole('textbox', { name: 'Name des Kalenders' })
          .fill(calendarName);
        await createDialog
          .getByRole('button', { name: 'Kalender erstellen' })
          .click();
        await expect(createDialog).toBeHidden();

        // creating the calendar closes the dialogs, open it again to edit it
        await page.getByRole('button', { name: 'Kalender verwalten' }).click();
        await page
          .getByRole('menuitem', { name: 'Kalender verwalten' })
          .click();
        await expect(manageDialog.getByText(calendarName)).toBeVisible();
        await manageDialog
          .getByRole('listitem')
          .filter({ hasText: calendarName })
          .getByRole('button', { name: 'bearbeiten' })
          .click();

        await manageDialog.getByRole('checkbox').check();
        await manageDialog.getByRole('button', { name: /speichern/i }).click();

        // the editor stays open to show the newly created link
        const linkInput = manageDialog.getByRole('textbox', {
          name: 'Öffentlicher Link',
        });
        await expect(linkInput).toBeVisible();
        await expect(linkInput).not.toHaveValue('');
        subscriptionUrl = await linkInput.inputValue();

        await page.keyboard.press('Escape');
        await expect(manageDialog).toBeHidden();
      });

      await test.step('create an event for today', async () => {
        await page.getByRole('button', { name: 'Ereignis erstellen' }).click();
        const dialog = page.getByRole('dialog', { name: 'Ereignis erstellen' });
        await dialog.getByRole('textbox', { name: 'Name' }).fill(eventName);

        // the only calendar is preselected
        await expect(
          dialog.getByRole('button', { name: new RegExp(calendarName) })
        ).toBeVisible();

        await dialog.getByRole('button', { name: /speichern/i }).click();
        await expect(dialog).toBeHidden();

        await expect(page.getByText(eventName)).toBeVisible();
      });

      await test.step('the event is in the public calendar feed', async () => {
        // a visitor without any session
        const request = await playwright.request.newContext();
        const response = await request.get(subscriptionUrl);
        expect(response.ok()).toBe(true);
        // e.g. "SUMMARY;LANGUAGE=DE:Elternabend …"
        expect(await response.text()).toMatch(
          new RegExp(`^SUMMARY[^:]*:${eventName}\\s*$`, 'm')
        );
        await request.dispose();
      });
    }
  );
});
