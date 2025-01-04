import { basename } from 'node:path';
import { Page } from '@playwright/test';
import { screenSave } from '../screenSave';

export const uploadAndSelect = async (
  { page }: { page: Page },
  path: string,
  file: string
) => {
  const browserDialog = page.getByRole('dialog', { name: 'Datei auswählen' });

  await browserDialog.waitFor({ state: 'visible' });

  for (const [segment, _index] of path
    .split('/')
    .map((segment, index) => [segment, index] as const)) {
    const currentDir = browserDialog.getByRole('listbox').last();
    if (
      (await currentDir.getByRole('option', { name: segment }).isVisible()) ===
      false
    ) {
      // TODO: Create directory
    }
    await currentDir.getByRole('option', { name: segment }).click();
  }

  const fileChooserPromise = page.waitForEvent('filechooser');
  await browserDialog.getByRole('button', { name: 'Datei hochladen' }).click();

  const fileChooser = await fileChooserPromise;
  fileChooser.setFiles(file);

  const newFileOption = browserDialog
    .getByRole('listbox')
    .last()
    .getByRole('option', { name: basename(file) });

  await newFileOption.waitFor({ state: 'visible' });

  screenSave(await browserDialog.screenshot(), 'file-manager-upload');

  await newFileOption.click();

  await browserDialog.getByRole('button', { name: 'Datei auswählen' }).click();

  await browserDialog.waitFor({ state: 'hidden' });
};
