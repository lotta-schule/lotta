import { expect, tenantTest as test } from '../fixtures';
import { clickUserMenuEntry, waitForSentMail } from '../helper';

test.describe('Feedback', () => {
  test(
    'a user sends feedback, an admin answers it and the user gets the answer by mail',
    { tag: '@smoke' },
    async ({ baseURL, isMobile, openPageAs, users }) => {
      const id = Date.now().toString(36);
      const topic = `Heizung im Raum 104 ${id}`;
      const message = 'Im Raum 104 ist es seit Tagen kalt.';
      const answer = `Der Hausmeister kommt morgen vorbei ${id}.`;

      await test.step('a student sends feedback to the administrators', async () => {
        const page = await openPageAs('student');
        await page.goto(baseURL);
        await clickUserMenuEntry(page, isMobile, {
          desktop: 'Feedback',
          mobile: 'Feedback',
        });

        const dialog = page.getByRole('dialog', { name: 'Feedback schreiben' });
        await dialog
          .getByRole('textbox', {
            name: 'Thema auswählen oder kurz beschreiben',
          })
          .fill(topic);
        await dialog.getByRole('textbox', { name: /^Nachricht/ }).fill(message);
        await dialog
          .getByRole('button', { name: 'an Administratoren senden' })
          .click();
        await expect(dialog).toBeHidden();
      });

      await test.step('an admin reads and answers it', async () => {
        const page = await openPageAs('admin');
        await page.goto(baseURL + '/admin/feedback');

        await page.getByRole('row').filter({ hasText: topic }).click();
        await expect(page.getByText(message)).toBeVisible();
        await page
          .getByRole('button', { name: 'Feedback beantworten' })
          .click();

        const dialog = page.getByRole('dialog', {
          name: 'Nutzerfeedback beantworten',
        });
        await dialog.getByRole('textbox', { name: 'Antwort' }).fill(answer);
        await dialog.getByRole('button', { name: 'an Nutzer senden' }).click();
        await expect(dialog).toBeHidden();
      });

      await test.step('the student gets the answer by mail', async () => {
        const mail = await waitForSentMail(
          (mail) =>
            mail.subject.startsWith('Dein Feedback für') &&
            mail.to.some(([, address]) => address === users.student.email),
          { timeout: 15_000 }
        );
        expect(mail.text_body).toContain(answer);
      });
    }
  );
});
