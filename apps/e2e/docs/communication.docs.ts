import { capture, desktopOnly, docsTest as test, expect } from './fixtures';

/** Docs: "Nachrichten", "Meine Dateien" */
test.describe('Nachrichten und Dateien', () => {
  desktopOnly();
  test.use({ loginAs: 'teacher' });

  test('messaging', async ({ page, users }) => {
    await page.goto('/messaging');
    const newMessage = page.getByRole('button', {
      name: 'Neue Nachricht schreiben',
    });
    await expect(newMessage).toBeVisible();

    await newMessage.click();
    const dialog = page.getByRole('dialog', { name: 'Empfänger wählen' });
    await dialog
      .getByRole('combobox', { name: 'Nutzer suchen' })
      .fill(users.student.name.split(' ')[0]);
    await expect(
      page.getByRole('option', { name: users.student.name })
    ).toBeVisible();
    await capture(page, 'messaging-new', { locator: dialog });

    await page.getByRole('option', { name: users.student.name }).click();
    await dialog.getByRole('button', { name: 'Nachricht verfassen' }).click();

    const input = page.getByRole('textbox', { name: 'Nachricht schreiben' });
    for (const message of [
      'Hallo Lena, denkst du bitte an die Einverständniserklärung für den Wandertag?',
      'Du kannst sie mir einfach morgen in der ersten Stunde geben.',
    ]) {
      await input.fill(message);
      await page.getByRole('button', { name: 'Nachricht senden' }).click();
      await expect(page.getByText(message)).toBeVisible();
    }

    await capture(page, 'messaging', {
      highlight: newMessage,
    });
  });

  test('files', async ({ page }) => {
    await page.goto('/profile/files');
    const currentDirectory = () => page.getByRole('listbox').last();
    await expect(
      currentDirectory().getByRole('option', { name: 'Meine Bilder' })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Ordner erstellen' })
      .first()
      .click();
    const dialog = page.getByRole('dialog', { name: 'Neuen Ordner erstellen' });
    await dialog
      .getByRole('textbox', { name: 'Name des Ordners' })
      .fill('Unterricht 7b');
    await dialog.getByRole('button', { name: 'Ordner erstellen' }).click();
    await currentDirectory()
      .getByRole('option', { name: 'Unterricht 7b' })
      .click();

    for (const file of ['schulfest-2.jpg', 'schulfest-3.jpg']) {
      const fileChooser = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: 'Datei hochladen' }).click();
      await (await fileChooser).setFiles(`fixtures/images/docs/${file}`);
      await expect(
        currentDirectory().getByRole('option', { name: file })
      ).toBeVisible({ timeout: 30_000 });
    }
    await currentDirectory()
      .getByRole('option', { name: 'schulfest-2.jpg' })
      .click();
    await expect(
      page.getByRole('img', { name: 'schulfest-2.jpg' })
    ).toBeVisible({
      timeout: 30_000,
    });

    await capture(page, 'files', {
      locator: page.getByRole('main'),
      markers: [
        {
          locator: page
            .getByRole('button', { name: 'Ordner erstellen' })
            .first(),
          label: '1',
        },
        {
          locator: page
            .getByRole('button', { name: 'Datei hochladen' })
            .first(),
          label: '2',
        },
      ],
    });
  });
});
