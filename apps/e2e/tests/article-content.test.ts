import { expect, tenantTest as test } from '../fixtures';
import { createArticle, createCategory, uploadAndSelect } from '../helper';

test.describe('Article content', () => {
  test.use({ loginAs: 'admin' });

  test(
    'an author adds text and an image to an article, visitors see both',
    { tag: '@smoke' },
    async ({ page, baseURL, graphqlAs, openPageAs }) => {
      const id = Date.now().toString(36);
      // plain ASCII on purpose: typing umlauts crashes the editor in Firefox (see below)
      const text = `Im Schulgarten wachsen dieses Jahr Kartoffeln ${id}.`;
      const gql = await graphqlAs('admin');
      const category = await createCategory(gql, { title: `Garten ${id}` });
      const article = await createArticle(gql, {
        title: `Gartenbericht ${id}`,
        categoryId: category.id,
      });

      await test.step('add a text and an image module, then save', async () => {
        await page.goto(article.path);
        await page.getByRole('button', { name: /beitrag bearbeiten/i }).click();
        await page.waitForURL(/\/edit$/);

        await page.getByRole('button', { name: 'Text', exact: true }).click();
        const textEditor = page.locator('[contenteditable="true"]').last();
        // The new module comes with a default text: select it and type over it
        await textEditor.click({ clickCount: 3 });
        await page.keyboard.type(text);
        await expect(textEditor).toHaveText(text);

        await page.getByRole('button', { name: 'Bild', exact: true }).click();
        await page
          .getByTestId('EditOverlay')
          .last()
          .getByRole('button', { name: 'Bild wechseln' })
          .click();
        await uploadAndSelect(
          { page },
          'Meine Bilder',
          'fixtures/images/logo.png'
        );

        await page
          .getByTestId('EditArticleFooter')
          .getByRole('button', { name: /^speichern$/i })
          .click();
        await page.waitForURL((url) => !url.pathname.endsWith('/edit'));
      });

      await test.step('a visitor sees the text and the image', async () => {
        const guestPage = await openPageAs('guest');
        await guestPage.goto(baseURL + article.path);

        const content = guestPage.getByRole('main').getByRole('article');
        await expect(content.getByText(text, { exact: true })).toBeVisible();

        // right after saving, the image may still be converted: reload until it is shown
        const image = content.locator('img').last();
        await expect(async () => {
          await guestPage.reload();
          await expect(image).toBeVisible({ timeout: 2_000 });
          expect(
            await image.evaluate((img: HTMLImageElement) => img.naturalWidth)
          ).toBeGreaterThan(0);
        }).toPass({ timeout: 30_000 });
      });
    }
  );

  // Known bug: in Firefox, inserted text (umlauts, IME, dictation, autocomplete)
  // followed by typing crashes the editor with "Cannot resolve a DOM point from
  // Slate point". Probably fixed by upgrading slate/slate-react (currently 0.76).
  // Remove `test.fail` once fixed.
  test('typing umlauts into a text module does not break the editor', async ({
    page,
    browserName,
    graphqlAs,
  }) => {
    test.fail(browserName === 'firefox', 'Known Slate bug in Firefox');

    const id = Date.now().toString(36);
    const gql = await graphqlAs('admin');
    const category = await createCategory(gql, { title: `Umlaute ${id}` });
    const article = await createArticle(gql, {
      title: `Umlaute ${id}`,
      categoryId: category.id,
    });

    await page.goto(article.path + '/edit');
    await page.getByRole('button', { name: 'Text', exact: true }).click();
    const textEditor = page.locator('[contenteditable="true"]').last();
    await textEditor.click({ clickCount: 3 });
    await page.keyboard.type('Kürbisse für die Schüler');

    await expect(textEditor).toHaveText('Kürbisse für die Schüler');
  });
});
