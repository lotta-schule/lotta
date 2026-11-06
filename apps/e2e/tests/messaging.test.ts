import { Page } from '@playwright/test';
import { expect, tenantTest as test } from '../fixtures';

const openMessaging = async (page: Page, baseURL: string) => {
  await page.goto(baseURL + '/messaging');
  await expect(
    page.getByRole('button', { name: 'Neue Nachricht schreiben' })
  ).toBeVisible();
};

const messageInput = (page: Page) =>
  page.getByRole('textbox', { name: 'Nachricht schreiben' });

test.describe('Messaging', () => {
  test(
    'a user can send a message to another user, who can read and answer it',
    { tag: '@smoke' },
    async ({ browser, baseURL, isMobile, getAuthState, users }) => {
      test.skip(isMobile, 'Messaging is not tested on mobile yet');

      const message = `Hallo Frodo, wie geht es dir? ${Date.now().toString(36)}`;
      const answer = `Danke, gut! ${Date.now().toString(36)}`;

      const teacherContext = await browser.newContext({
        storageState: await getAuthState('teacher'),
      });
      const studentContext = await browser.newContext({
        storageState: await getAuthState('student'),
      });

      await test.step('teacher writes to the student', async () => {
        const page = await teacherContext.newPage();
        await openMessaging(page, baseURL);

        await page
          .getByRole('button', { name: 'Neue Nachricht schreiben' })
          .click();
        const dialog = page.getByRole('dialog', { name: 'Empfänger wählen' });
        await dialog
          .getByRole('combobox', { name: 'Nutzer suchen' })
          .fill(users.student.name.split(' ')[0]);
        await page.getByRole('option', { name: users.student.name }).click();
        await dialog
          .getByRole('button', { name: 'Nachricht verfassen' })
          .click();
        await expect(
          page.getByText(
            `Schreibe deine erste Nachricht an ${users.student.name}.`
          )
        ).toBeVisible();

        await messageInput(page).fill(message);
        await page.getByRole('button', { name: 'Nachricht senden' }).click();

        await expect(page.getByText(message)).toBeVisible();
      });

      await test.step('student reads the message and answers', async () => {
        const page = await studentContext.newPage();
        await openMessaging(page, baseURL);

        await page.getByText(users.teacher.name).first().click();
        await expect(page.getByText(message)).toBeVisible();

        await messageInput(page).fill(answer);
        await page.getByRole('button', { name: 'Nachricht senden' }).click();
        await expect(page.getByText(answer)).toBeVisible();
      });

      await test.step('teacher sees the answer', async () => {
        const page = await teacherContext.newPage();
        await openMessaging(page, baseURL);

        await page.getByText(users.student.name).first().click();
        await expect(page.getByText(answer)).toBeVisible();
      });

      await teacherContext.close();
      await studentContext.close();
    }
  );

  test.describe('opening the messaging page directly', () => {
    test.describe('when logged in', () => {
      test.use({ loginAs: 'student' });

      test('shows the messages', async ({ page, baseURL }) => {
        await openMessaging(page, baseURL);
        expect(new URL(page.url()).pathname).toBe('/messaging');
      });
    });

    test('is not allowed for visitors', async ({ page }) => {
      const response = await page.goto('/messaging');
      expect(response?.status()).toBe(401);
      await expect(
        page.getByRole('button', { name: 'Neue Nachricht schreiben' })
      ).toHaveCount(0);
    });
  });
});
