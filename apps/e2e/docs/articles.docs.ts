import { capture, desktopOnly, docsTest as test, expect } from './fixtures';

/**
 * Docs: "Ihr erster Beitrag", "Module im Überblick", "Sichtbarkeit & Einstellungen",
 * "Veröffentlichen & Meine Beiträge", "Reaktionen", "Beiträge freigeben & anpinnen"
 */
test.describe('Beiträge', () => {
  desktopOnly();

  test.describe('in the editor', () => {
    test.use({ loginAs: 'admin' });

    test('article editor', async ({ page, school }) => {
      await page.goto(school.articles.projektwoche.path + '/edit');
      const footer = page.getByTestId('EditArticleFooter');
      await expect(footer).toBeVisible();

      await capture(page, 'article-editor-preview', {
        locator: page.getByTestId('ArticlePreview').first(),
      });

      await capture(page, 'article-editor-modules', {
        locator: page.getByTestId('AddModuleBar'),
      });

      await capture(page, 'article-editor-settings', { locator: footer });

      // a title module has all tools (moving, settings, deleting)
      await page
        .getByTestId('AddModuleBar')
        .getByRole('button', { name: 'Titel', exact: true })
        .click();
      const titleModule = page.getByTestId('ContentModule').last();
      await titleModule.scrollIntoViewIfNeeded();
      await titleModule.hover();
      const tool = (name: string) =>
        titleModule.getByRole('button', { name }).first();
      await expect(tool('Moduleinstellungen')).toBeVisible();

      await capture(page, 'article-module-toolbar', {
        locator: titleModule,
        markers: [
          {
            locator: tool('Modul um eine Stelle nach oben bewegen'),
            label: '1',
          },
          { locator: tool('Moduleinstellungen'), label: '2' },
          { locator: tool('Modul löschen'), label: '3' },
        ],
      });
    });

    test('pinning an article', async ({ page, school }) => {
      await page.goto(school.categories.aktuelles.path);
      const preview = page
        .getByTestId('ArticlePreview')
        .filter({ hasText: school.articles.mensa.title });
      const pin = preview.getByRole('button', {
        name: 'Beitrag an der Kategorie anpinnen',
      });
      await expect(pin).toBeVisible();

      await capture(page, 'article-pin', { locator: preview, highlight: pin });
    });
  });

  test('my articles and articles to publish', async ({
    graphqlAs,
    openPageAs,
    baseURL,
    school,
  }) => {
    const gql = await graphqlAs('teacher');
    const articles = [
      { title: 'Wandertag der 7b: Ab in den Harz', readyToPublish: true },
      { title: 'Vokabeltest Englisch Unit 3', readyToPublish: false },
    ];
    for (const { title, readyToPublish } of articles) {
      const { createArticle } = await gql<{ createArticle: { id: string } }>(
        `mutation($article: ArticleInput!) { createArticle(article: $article) { id } }`,
        { article: { title } }
      );
      await gql(
        `mutation($id: ID!, $article: ArticleInput!) { updateArticle(id: $id, article: $article) { id } }`,
        {
          id: createArticle.id,
          article: {
            title,
            readyToPublish,
            category: { id: school.categories.aktuelles.id },
          },
        }
      );
    }

    const teacherPage = await openPageAs('teacher');
    await teacherPage.goto(baseURL + '/profile/articles');
    await expect(teacherPage.getByText(articles[0].title)).toBeVisible();
    await capture(teacherPage, 'my-articles', {
      locator: teacherPage.getByRole('main').last(),
    });

    const adminPage = await openPageAs('admin');
    await adminPage.goto(baseURL + '/unpublished');
    await expect(adminPage.getByText(articles[0].title)).toBeVisible();
    await capture(adminPage, 'admin-unpublished', {
      locator: adminPage.getByRole('main').last(),
    });
  });

  test.describe('as a student', () => {
    test.use({ loginAs: 'student' });

    test('reactions', async ({ page, school }) => {
      const { konzert } = school.articles;
      await page.goto(konzert.path);
      await page
        .getByRole('button', { name: `Auf "${konzert.title}" reagieren` })
        .click();
      const selector = page.getByTestId('ReactionSelector');
      await expect(selector).toBeVisible();

      await capture(page, 'article-reactions', { highlight: selector });
    });
  });

  test.describe('as a teacher', () => {
    test.use({ loginAs: 'teacher' });

    test('creating an article (video)', async ({ recordVideo }) => {
      test.setTimeout(120_000);
      await recordVideo('article-create', { as: 'teacher' }, async (page) => {
        await page.goto('/');
        await page.getByTestId('CreateArticleButton').click();
        const dialog = page.getByRole('dialog', { name: 'Beitrag erstellen' });
        await dialog
          .getByRole('textbox', { name: /Titel des Beitrags/ })
          .pressSequentially('Ausflug in den Zoo', { delay: 60 });
        await dialog.getByRole('button', { name: 'Beitrag erstellen' }).click();
        await page.waitForURL(/\/edit$/);

        await page
          .getByTestId('AddModuleBar')
          .getByRole('button', { name: 'Text', exact: true })
          .click();
        const textEditor = page.locator('[contenteditable="true"]').last();
        await textEditor.click({ clickCount: 3 });
        await page.keyboard.type(
          'Am Freitag besucht die Klasse 7b den Zoo. Treffpunkt ist um 8 Uhr am Haupteingang.',
          { delay: 25 }
        );
        await page.getByTestId('EditArticleFooter').scrollIntoViewIfNeeded();
      });
    });
  });
});
