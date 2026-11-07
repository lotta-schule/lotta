import { APIRequestContext, PlaywrightWorkerArgs } from '@playwright/test';
import { expect, GUEST_STATE, tenantTest as test } from '../fixtures';
import {
  createArticle,
  graphql,
  loginViaApi,
  SeededUser,
  uniqueEmail,
} from '../helper';

/**
 * Whether the user can read the article. Logs in freshly every time, because a
 * user's groups are part of the access token they get on login.
 */
const canRead = async (
  playwright: PlaywrightWorkerArgs['playwright'],
  baseURL: string,
  user: SeededUser,
  articleId: string
) => {
  const request: APIRequestContext = await playwright.request.newContext();
  try {
    await loginViaApi(request, baseURL, user);
    const { body } = await graphql<{ article: { id: string } | null }>(
      request,
      baseURL,
      'query Article($id: ID!) { article(id: $id) { id } }',
      { variables: { id: articleId } }
    );
    return body?.data?.article?.id === articleId;
  } finally {
    await request.dispose();
  }
};

test.describe('Users and groups', () => {
  test.use({ loginAs: 'admin' });

  test("an admin assigns a user to a group, which gives access to the group's content", async ({
    page,
    baseURL,
    playwright,
    graphqlAs,
    seed,
  }) => {
    const name = `Samweis Gamdschie ${Date.now().toString(36)}`;
    const {
      users: [user],
      groups: [teachers],
    } = await seed({
      groups: [{ name: 'Lehrer' }],
      users: [{ name, email: uniqueEmail('sam'), password: 'kartoffeln' }],
    });
    const article = await createArticle(await graphqlAs('admin'), {
      title: `Nur für Lehrer ${Date.now().toString(36)}`,
      groupIds: [teachers.id],
    });

    expect(await canRead(playwright, baseURL, user, article.id)).toBe(false);

    await test.step('admin adds the user to the "Lehrer" group', async () => {
      await page.goto('/admin/users');
      await page
        .getByRole('textbox', { name: 'Nach Namen suchen:' })
        .fill(name);
      await page.getByRole('row').filter({ hasText: name }).click();

      const dialog = page.getByRole('dialog', { name: `${name} bearbeiten` });
      await dialog
        .getByRole('combobox', { name: 'Gruppe zuweisen' })
        .fill('Lehrer');
      await page.getByRole('option', { name: 'Lehrer', exact: true }).click();
      // wait for the group to be added and the suggestions to be closed, else
      // the click on "speichern" may only close the suggestions
      await expect(
        dialog.getByRole('button', { name: 'Tag Lehrer löschen' })
      ).toBeVisible();
      await expect(page.getByRole('listbox')).toBeHidden();
      const updateUser = page.waitForResponse(
        (res) =>
          res.url().endsWith('/api') &&
          (res.request().postData() ?? '').includes('mutation UpdateUser(')
      );
      await dialog.getByRole('button', { name: /speichern/i }).click();
      expect((await updateUser).ok()).toBe(true);
      // the dialog shows the success state for 2.5s before closing
      await expect(dialog).toBeHidden({ timeout: 10_000 });
    });

    expect(await canRead(playwright, baseURL, user, article.id)).toBe(true);
  });

  test("a user joins a group with the group's enrollment key", async ({
    page,
    browser,
    baseURL,
    playwright,
    graphqlAs,
    seed,
  }) => {
    const id = Date.now().toString(36);
    const groupName = `Klasse 7b ${id}`;
    const enrollmentKey = `geheim-7b-${id}`;
    let groupId = '';

    await test.step('admin creates a group with an enrollment key', async () => {
      await page.goto('/admin/groups');
      await page.getByRole('button', { name: 'Gruppe erstellen' }).click();

      const dialog = page.getByRole('dialog', {
        name: 'Nutzergruppe erstellen',
      });
      await dialog
        .getByRole('textbox', { name: 'Name der Gruppe:' })
        .fill(groupName);
      await dialog.getByRole('button', { name: 'Gruppe erstellen' }).click();
      await page.waitForURL(/\/admin\/groups\/\d+$/);
      groupId = page.url().split('/').pop()!;

      const keyInput = page.getByRole('textbox', {
        name: 'Neue Einschreibeschlüssel eintragen',
      });
      await keyInput.fill(enrollmentKey);
      await keyInput.press('Enter');
      await expect(
        page.getByRole('listitem').filter({ hasText: enrollmentKey })
      ).toBeVisible();
      const saveButton = page.getByRole('button', { name: /^speichern$/i });
      await expect(saveButton).toBeEnabled();
      // wait for the save to finish before reloading
      const updateGroup = page.waitForResponse(
        (res) =>
          res.url().endsWith('/api') &&
          (res.request().postData() ?? '').includes('UpdateUserGroup')
      );
      await saveButton.click();
      expect((await updateGroup).ok()).toBe(true);

      await page.reload();
      await expect(page.getByText(enrollmentKey)).toBeVisible();
    });

    const article = await createArticle(await graphqlAs('admin'), {
      title: `Hausaufgaben 7b ${id}`,
      groupIds: [groupId],
    });
    const {
      users: [user],
    } = await seed({
      users: [
        {
          name: `Rosie Hüttinger ${id}`,
          email: uniqueEmail('rosie'),
          password: 'blumen',
        },
      ],
    });

    expect(await canRead(playwright, baseURL, user, article.id)).toBe(false);

    await test.step('the user enters the enrollment key in their profile', async () => {
      const context = await browser.newContext({
        storageState: GUEST_STATE,
      });
      await loginViaApi(context.request, baseURL, user);
      const userPage = await context.newPage();
      await userPage.goto(baseURL + '/profile');

      const keyInput = userPage.getByRole('textbox', {
        name: 'Neue Einschreibeschlüssel eintragen',
      });
      await keyInput.fill(enrollmentKey);
      await keyInput.press('Enter');
      await expect(
        userPage.getByRole('listitem').filter({ hasText: enrollmentKey })
      ).toBeVisible();
      const updateProfile = userPage.waitForResponse(
        (res) =>
          res.url().endsWith('/api') &&
          (res.request().postData() ?? '').includes('enrollmentTokens')
      );
      await userPage.getByRole('button', { name: 'Speichern' }).click();
      await updateProfile;

      await userPage.reload();
      await expect(userPage.getByText(enrollmentKey)).toBeVisible();
      await context.close();
    });

    expect(await canRead(playwright, baseURL, user, article.id)).toBe(true);
  });
});
