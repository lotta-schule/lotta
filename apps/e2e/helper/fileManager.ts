import { basename } from 'node:path';
import { FileChooser, Page, expect } from '@playwright/test';

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

  // Until the directory's content is loaded, there is no open directory to
  // upload into, and the button does nothing: click again then.
  let fileChooser: FileChooser | undefined;
  await expect(async () => {
    const fileChooserPromise = page.waitForEvent('filechooser', {
      timeout: 3_000,
    });
    await browserDialog
      .getByRole('button', { name: 'Datei hochladen' })
      .click();
    fileChooser = await fileChooserPromise;
  }).toPass({ timeout: 20_000 });
  await fileChooser!.setFiles(file);

  const newFileOption = browserDialog
    .getByRole('listbox')
    .last()
    .getByRole('option', { name: basename(file) });

  await newFileOption.waitFor({ state: 'visible' });

  await newFileOption.click();

  await browserDialog.getByRole('button', { name: 'Datei auswählen' }).click();

  await browserDialog.waitFor({ state: 'hidden' });
};
