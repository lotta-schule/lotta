import { Locator, Page } from '@playwright/test';
import { uploadAndSelect } from '../helper';
import {
  capture,
  desktopOnly,
  docsTest as test,
  expect,
  School,
} from './fixtures';
import type { GraphqlClient } from '../helper';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

/** An article with one module of each kind that needs no files */
const createModulesArticle = async (gql: GraphqlClient, school: School) => {
  const title = 'Tag der offenen Tür';
  const { createArticle } = await gql<{ createArticle: { id: string } }>(
    `mutation($article: ArticleInput!) { createArticle(article: $article) { id } }`,
    { article: { title } }
  );
  const contentModules = [
    { type: 'TITLE', content: { title: 'Unser Programm' } },
    {
      type: 'TEXT',
      content: {
        nodes: [
          paragraph(
            'Am Samstag, den 21. November, öffnen wir von 10 bis 14 Uhr unsere Türen. ' +
              'Lernen Sie unsere Schule, unsere Lehrkräfte und unsere Arbeitsgemeinschaften kennen.'
          ),
        ],
      },
    },
    {
      type: 'TABLE',
      content: {
        rows: [
          [{ text: 'Uhrzeit' }, { text: 'Programmpunkt' }, { text: 'Ort' }],
          [
            { text: '10:00' },
            { text: 'Begrüßung durch die Schulleitung' },
            { text: 'Aula' },
          ],
          [
            { text: '10:30' },
            { text: 'Schnupperunterricht' },
            { text: 'Haus B' },
          ],
          [
            { text: '12:00' },
            { text: 'Vorführung der Theater-AG' },
            { text: 'Aula' },
          ],
        ],
      },
    },
    {
      type: 'FORM',
      configuration: {
        destination: 'sekretariat@lotta-gymnasium.de',
        save_internally: true,
        elements: [
          {
            element: 'input',
            type: 'text',
            name: 'name',
            label: 'Ihr Name',
            required: true,
          },
          {
            element: 'input',
            type: 'email',
            name: 'email',
            label: 'Ihre E-Mail-Adresse',
            required: true,
          },
          {
            element: 'selection',
            type: 'select',
            name: 'personen',
            label: 'Anzahl der Personen',
            required: true,
            options: [
              { label: '1', value: '1', selected: true },
              { label: '2', value: '2' },
              { label: '3 oder mehr', value: '3+' },
            ],
          },
          {
            element: 'input',
            multiline: true,
            name: 'fragen',
            label: 'Ihre Fragen an uns',
            required: false,
          },
        ],
      },
    },
  ];
  await gql(
    `mutation($id: ID!, $article: ArticleInput!) { updateArticle(id: $id, article: $article) { id } }`,
    {
      id: createArticle.id,
      article: {
        title,
        preview: 'Am 21. November stellen wir uns allen Interessierten vor.',
        published: true,
        readyToPublish: true,
        category: { id: school.categories.aktuelles.id },
        contentModules: contentModules.map(
          ({ content, configuration, ...module }, sortKey) => ({
            ...module,
            sortKey,
            ...(content ? { content: JSON.stringify(content) } : {}),
            ...(configuration
              ? { configuration: JSON.stringify(configuration) }
              : {}),
          })
        ),
      },
    }
  );
  const slug = title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  return { title, path: `/a/${createArticle.id}-${slug}` };
};

const addModule = async (page: Page, name: string) => {
  await page
    .getByTestId('AddModuleBar')
    .getByRole('button', { name, exact: true })
    .click();
  const module = page.getByTestId('ContentModule').last();
  await module.scrollIntoViewIfNeeded();
  return module;
};

/** Waits until all images in the element are loaded (uploads are converted first) */
const imagesLoaded = async (element: Locator) =>
  expect(async () => {
    const images = element.locator('img');
    expect(await images.count()).toBeGreaterThan(0);
    for (const image of await images.all()) {
      expect(
        await image.evaluate((img: HTMLImageElement) => img.naturalWidth)
      ).toBeGreaterThan(0);
    }
  }).toPass({ timeout: 60_000 });

/** Docs: "Module im Überblick" and one page per module */
test.describe('Module', () => {
  desktopOnly();

  test('modules without files', async ({
    graphqlAs,
    openPageAs,
    baseURL,
    school,
  }) => {
    const article = await createModulesArticle(
      await graphqlAs('admin'),
      school
    );

    await test.step('readers fill in the form', async () => {
      const guestPage = await openPageAs('guest');
      await guestPage.goto(baseURL + article.path);
      const form = guestPage.getByTestId('FormContentModule');
      await form
        .getByRole('textbox', { name: 'Ihr Name' })
        .fill('Familie Schneider');
      await form
        .getByRole('textbox', { name: 'Ihre E-Mail-Adresse' })
        .fill('schneider@example.de');
      await form
        .getByRole('textbox', { name: 'Ihre Fragen an uns' })
        .fill('Gibt es eine Führung durch die Fachräume?');
      await capture(guestPage, 'module-form-filled', { locator: form });

      await form.getByRole('button', { name: 'Senden' }).click();
      await expect(
        form.getByText('Das Formular wurde erfolgreich versendet.')
      ).toBeVisible();
    });

    await test.step('the author sees the submissions', async () => {
      const adminPage = await openPageAs('admin');
      await adminPage.goto(baseURL + article.path);
      await adminPage
        .getByRole('button', { name: 'Formulareinsendungen sehen' })
        .click();
      const dialog = adminPage.getByRole('dialog', { name: 'Formulardaten' });
      await expect(dialog.getByText(/gespeicherte Einsendungen/)).toBeVisible();
      await capture(adminPage, 'module-form-results', { locator: dialog });
    });

    await test.step('the modules in the editor', async () => {
      const adminPage = await openPageAs('admin');
      await adminPage.goto(baseURL + article.path + '/edit');
      await expect(adminPage.getByTestId('EditArticleFooter')).toBeVisible();

      await capture(adminPage, 'module-text', {
        locator: adminPage.getByTestId('TextContentModule').first(),
      });
      await capture(adminPage, 'module-table', {
        locator: adminPage.getByTestId('TableContentModule').first(),
      });
      await capture(adminPage, 'module-form', {
        locator: adminPage.getByTestId('FormContentModule').first(),
      });

      const titleModule = adminPage
        .getByTestId('ContentModule')
        .filter({ has: adminPage.getByTestId('TitleContentModule') })
        .first();
      await titleModule.hover();
      await titleModule
        .getByRole('button', { name: 'Moduleinstellungen' })
        .click();
      const settings = adminPage.getByRole('dialog', {
        name: 'Moduleinstellungen',
      });
      await expect(settings).toBeVisible();
      await capture(adminPage, 'module-title', { locator: settings });
      await settings.getByRole('button', { name: 'Schließen' }).click();
    });
  });

  test.describe('modules with files', () => {
    test.use({ loginAs: 'admin' });

    test('image, gallery, download, video and audio', async ({
      page,
      school,
    }) => {
      await page.goto(school.articles.theater.path + '/edit');
      await expect(page.getByTestId('EditArticleFooter')).toBeVisible();

      await test.step('image', async () => {
        const module = await addModule(page, 'Bild');
        await module.hover();
        await module.getByRole('button', { name: 'Bild wechseln' }).click();
        await uploadAndSelect(
          { page },
          'Meine Bilder',
          'fixtures/images/docs/schulfest-1.jpg'
        );
        await module
          .getByPlaceholder('Bildbeschreibung')
          .fill('Generalprobe in der Aula (Foto: Theater-AG)');
        await imagesLoaded(module);
        await capture(page, 'module-image', { locator: module });
      });

      await test.step('gallery', async () => {
        const module = await addModule(page, 'Galerie');
        for (const image of [
          'schulfest-2.jpg',
          'schulfest-3.jpg',
          'schulfest-4.jpg',
        ]) {
          await module.getByRole('button', { name: 'Bild hinzufügen' }).click();
          await uploadAndSelect(
            { page },
            'Meine Bilder',
            `fixtures/images/docs/${image}`
          );
        }
        await imagesLoaded(module);
        await capture(page, 'module-gallery', { locator: module });
      });

      await test.step('download', async () => {
        const module = await addModule(page, 'Dateien');
        await module.getByRole('button', { name: 'Datei hinzufügen' }).click();
        await uploadAndSelect(
          { page },
          'Meine Bilder',
          'fixtures/images/docs/schulfest-1.jpg'
        );
        await module
          .getByPlaceholder('Beschreibung des Downloads')
          .first()
          .fill('Plakat zur Premiere');
        await capture(page, 'module-download', { locator: module });
      });

      await test.step('video and audio', async () => {
        const video = await addModule(page, 'Video');
        await video.hover();
        await capture(page, 'module-video', { locator: video });

        const audio = await addModule(page, 'Audio');
        await audio.hover();
        await capture(page, 'module-audio', { locator: audio });
      });
    });
  });
});
