import { Page } from '@playwright/test';
import { expect, tenantTest as test } from '../fixtures';

const unique = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** The listbox showing the content of the directory that is currently open */
const currentDirectory = (page: Page) => page.getByRole('listbox').last();

const createDirectory = async (page: Page, name: string) => {
  await page.getByRole('button', { name: 'Ordner erstellen' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Neuen Ordner erstellen' });
  await dialog.getByRole('textbox', { name: 'Name des Ordners' }).fill(name);
  await dialog.getByRole('button', { name: 'Ordner erstellen' }).click();
  await expect(dialog).toBeHidden();
  await expect(
    currentDirectory(page).getByRole('option', { name })
  ).toBeVisible();
};

/** Selects a file, which opens its preview panel with the file's actions */
const selectFile = async (page: Page, name: string) => {
  await currentDirectory(page).getByRole('option', { name }).click();
  await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible();
};

test.describe('Files', () => {
  test.use({ loginAs: 'teacher' });

  test(
    'a user can upload, move and delete their files',
    { tag: '@smoke' },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'The file manager is not tested on mobile yet');

      const source = unique('Quelle');
      const target = unique('Ziel');

      await page.goto('/profile/files');
      // Folders cannot be created at the root level, only inside the default folders
      await currentDirectory(page)
        .getByRole('option', { name: 'Meine Dokumente' })
        .click();

      await test.step('create two folders', async () => {
        await createDirectory(page, source);
        await createDirectory(page, target);
      });

      await test.step('upload a file into the first folder', async () => {
        await currentDirectory(page)
          .getByRole('option', { name: source })
          .click();

        const fileChooser = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Datei hochladen' }).click();
        await (await fileChooser).setFiles('fixtures/images/logo.png');

        await expect(
          currentDirectory(page).getByRole('option', { name: 'logo.png' })
        ).toBeVisible();
      });

      await test.step('the uploaded image is served', async () => {
        await selectFile(page, 'logo.png');
        const preview = page.getByRole('img', { name: 'logo.png' });
        await expect(preview).toBeVisible();
        await expect
          .poll(() =>
            preview.evaluate((img: HTMLImageElement) => img.naturalWidth)
          )
          .toBeGreaterThan(0);
      });

      await test.step('move the file into the second folder', async () => {
        await selectFile(page, 'logo.png');
        await page
          .getByRole('button', { name: 'verschieben', exact: true })
          .click();

        const dialog = page.getByRole('dialog', { name: 'Datei verschieben' });
        // The directory selector starts in the file's folder: go up, then into the target
        await dialog.getByRole('menuitem', { name: /^\.\.\// }).click();
        await dialog.getByRole('menuitem', { name: target }).click();
        await dialog.getByRole('button', { name: 'Datei verschieben' }).click();
        await expect(dialog).toBeHidden();

        await expect(
          currentDirectory(page).getByRole('option', { name: 'logo.png' })
        ).toHaveCount(0);
      });

      await test.step('the file is in the second folder after reloading', async () => {
        await page.reload();
        await currentDirectory(page)
          .getByRole('option', { name: 'Meine Dokumente' })
          .click();
        await currentDirectory(page)
          .getByRole('option', { name: target })
          .click();
        await expect(
          currentDirectory(page).getByRole('option', { name: 'logo.png' })
        ).toBeVisible();
      });

      await test.step('delete the file', async () => {
        await selectFile(page, 'logo.png');
        await page
          .getByRole('button', { name: 'löschen', exact: true })
          .click();

        const dialog = page.getByRole('dialog', { name: 'Dateien löschen' });
        await dialog
          .getByRole('button', { name: 'Dateien endgültig löschen' })
          .click();
        await expect(dialog).toBeHidden();

        await expect(
          currentDirectory(page).getByRole('option', { name: 'logo.png' })
        ).toHaveCount(0);
      });
    }
  );
});
