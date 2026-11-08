import { capture, docsTest as test, expect } from './fixtures';
import { createArticle, createCategory } from '../helper';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

/** Docs: "Beiträge bearbeiten" (apps/docs) */
test.describe('Beiträge bearbeiten', () => {
  test.use({ loginAs: 'admin' });

  test('article editor', async ({ page, graphqlAs }) => {
    const gql = await graphqlAs('admin');
    const category = await createCategory(gql, { title: 'Schulleben' });
    const article = await createArticle(gql, {
      title: 'Projektwoche 2026',
      categoryId: category.id,
      contentModules: [
        {
          type: 'TITLE',
          content: { title: 'Eine Woche voller Ideen' },
        },
        {
          type: 'TEXT',
          content: {
            nodes: [
              paragraph(
                'Vom 14. bis 18. September verwandelt sich unsere Schule in eine große Werkstatt: ' +
                  'Schülerinnen und Schüler aller Jahrgänge arbeiten gemeinsam an Projekten rund um das Thema Nachhaltigkeit.'
              ),
              paragraph(
                'Zum Abschluss präsentieren alle Gruppen ihre Ergebnisse am Freitag ab 15 Uhr in der Aula. ' +
                  'Eltern und Freunde der Schule sind herzlich eingeladen.'
              ),
            ],
          },
        },
      ],
    });

    await page.goto(article.path);
    const editButton = page.getByRole('button', {
      name: /beitrag bearbeiten/i,
    });
    await expect(editButton).toBeVisible();
    await capture(page, 'article-edit-button', { highlight: editButton });

    await editButton.click();
    await page.waitForURL(/\/edit$/);
    const footer = page.getByTestId('EditArticleFooter');
    await expect(footer).toBeVisible();
    await capture(page, 'article-editor', {
      fullPage: true,
      highlight: page.getByRole('button', { name: 'Text', exact: true }),
    });

    await capture(page, 'article-editor-save', {
      locator: footer,
      highlight: footer.getByRole('button', { name: /^speichern$/i }),
    });
  });
});
