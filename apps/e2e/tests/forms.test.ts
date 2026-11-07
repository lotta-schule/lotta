import { readFile } from 'node:fs/promises';
import { expect, tenantTest as test } from '../fixtures';
import {
  createArticle,
  createCategory,
  uniqueEmail,
  waitForSentMail,
} from '../helper';

test.describe('Forms', () => {
  test(
    'a visitor submits a form, the response is mailed and saved for the author',
    { tag: '@smoke' },
    async ({ baseURL, graphqlAs, openPageAs }) => {
      const id = Date.now().toString(36);
      const recipient = uniqueEmail('sekretariat');
      const message = `Mein Kind ist morgen krank ${id}`;

      const gql = await graphqlAs('admin');
      const category = await createCategory(gql, { title: `Kontakt ${id}` });
      const article = await createArticle(gql, {
        title: `Krankmeldung ${id}`,
        categoryId: category.id,
        contentModules: [
          {
            type: 'FORM',
            configuration: {
              destination: recipient,
              save_internally: true,
              elements: [
                {
                  element: 'input',
                  type: 'text',
                  name: 'name',
                  label: 'Name des Kindes',
                  required: true,
                },
                {
                  element: 'input',
                  multiline: true,
                  name: 'nachricht',
                  label: 'Nachricht',
                  required: true,
                },
              ],
            },
          },
        ],
      });

      await test.step('a visitor fills in and submits the form', async () => {
        const page = await openPageAs('guest');
        await page.goto(baseURL + article.path);

        const form = page.getByTestId('FormContentModule');
        const sendButton = form.getByRole('button', { name: 'Senden' });
        await expect(sendButton).toBeDisabled();

        await form
          .getByRole('textbox', { name: 'Name des Kindes' })
          .fill('Elanor Gamdschie');
        await form.getByRole('textbox', { name: 'Nachricht' }).fill(message);
        await sendButton.click();

        await expect(
          form.getByText('Das Formular wurde erfolgreich versendet.')
        ).toBeVisible();
      });

      await test.step('the response is mailed to the recipient', async () => {
        const mail = await waitForSentMail(
          (mail) => mail.to.some(([, address]) => address === recipient),
          { timeout: 15_000 }
        );
        expect(mail.text_body).toContain(article.title);
        expect(mail.text_body).toContain('Elanor Gamdschie');
        expect(mail.text_body).toContain(message);
      });

      await test.step('the author sees the saved response', async () => {
        const page = await openPageAs('admin');
        await page.goto(baseURL + article.path);
        await page
          .getByRole('button', { name: 'Formulareinsendungen sehen' })
          .click();
        const dialog = page.getByRole('dialog', { name: 'Formulardaten' });
        await expect(
          dialog.getByText('1 gespeicherte Einsendungen')
        ).toBeVisible();

        const download = page.waitForEvent('download');
        await dialog
          .getByRole('button', { name: 'Einsendungen als CSV herunterladen' })
          .click();
        const csv = await readFile(await (await download).path(), 'utf8');
        expect(csv).toContain('Elanor Gamdschie');
        expect(csv).toContain(message);
      });
    }
  );
});
