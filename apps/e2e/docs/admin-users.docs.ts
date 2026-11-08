import { capture, docsTest as test, expect } from './fixtures';

/** Docs: "Nutzer verwalten" (apps/docs) */
test.describe('Nutzer verwalten', () => {
  test.use({ loginAs: 'admin' });

  test('user administration', async ({ page, seed }) => {
    // a few more users, so the list looks like a (small) school
    await seed({
      users: [
        {
          name: 'Jonas Becker',
          email: 'jonas.becker@lotta-gymnasium.de',
          password: 'docs-password',
          class: '9a',
          groups: ['Schüler'],
        },
        {
          name: 'Sophie Wagner',
          email: 'sophie.wagner@lotta-gymnasium.de',
          password: 'docs-password',
          class: '10c',
          groups: ['Schüler'],
        },
        {
          name: 'Dr. Petra Hoffmann',
          email: 'petra.hoffmann@lotta-gymnasium.de',
          password: 'docs-password',
          groups: ['Lehrer'],
        },
      ],
    });

    await page.goto('/admin/users');
    const search = page.getByRole('textbox', { name: 'Nach Namen suchen:' });
    await expect(search).toBeVisible();
    await capture(page, 'admin-users');

    await search.fill('Sophie');
    const row = page.getByRole('row').filter({ hasText: 'Sophie Wagner' });
    await expect(row).toBeVisible();
    await capture(page, 'admin-users-search', { highlight: search });

    await row.click();
    const dialog = page.getByRole('dialog', {
      name: 'Sophie Wagner bearbeiten',
    });
    await expect(dialog).toBeVisible();
    await capture(page, 'admin-users-edit', {
      locator: dialog,
      highlight: dialog.getByRole('combobox', { name: 'Gruppe zuweisen' }),
    });
  });
});
