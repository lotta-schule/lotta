import { capture, desktopOnly, docsTest as test, expect } from './fixtures';

/**
 * Docs: "Lotta in 5 Minuten", "Navigation, Startseite & Suche",
 * "Kalender & Vertretungsplan", "Kategorie-Einstellungen" (layouts)
 */
test.describe('Überblick und Navigation', () => {
  desktopOnly();

  test.describe('as a visitor', () => {
    test('home page', async ({ page, school }) => {
      await page.goto('/');
      const main = page.getByRole('main');
      await expect(
        main.getByText(school.articles.projektwoche.title)
      ).toBeVisible();
      const sidebar = page.getByRole('complementary');
      await expect(
        sidebar.getByText('Elternabend Klassenstufe 7')
      ).toBeVisible();

      await capture(page, 'overview-home', { fullPage: true });
    });

    test('calendar widget', async ({ page, school }) => {
      await page.goto(school.categories.aktuelles.path);
      const sidebar = page.getByRole('complementary');
      await expect(sidebar.getByText('Wandertag')).toBeVisible();

      await capture(page, 'widgets-calendar', {
        highlight: sidebar.getByText(school.widget.title).first(),
      });
    });

    test('two-column layout', async ({ page, school }) => {
      await page.goto(school.categories.projekte.path);
      await expect(
        page.getByRole('main').getByText(school.articles.garten.title)
      ).toBeVisible();

      await capture(page, 'category-layouts');
    });
  });

  test.describe('as a student', () => {
    test.use({ loginAs: 'student' });

    test('article previews with pinned and new articles', async ({
      page,
      school,
    }) => {
      await page.goto(school.categories.aktuelles.path);
      const previews = page.getByTestId('ArticlePreview');
      await expect(
        previews.filter({ hasText: school.articles.mensa.title })
      ).toBeVisible();

      await capture(page, 'navigation-article-previews', {
        locator: page.getByRole('main'),
      });
    });

    test('search', async ({ page }) => {
      await page.goto('/search');
      await page
        .getByRole('searchbox', { name: 'Suchbegriff' })
        .fill('Projektwoche');
      await expect(
        page.getByText(/Es wurden \d+ Beiträge gefunden/)
      ).toBeVisible({ timeout: 30_000 });

      await capture(page, 'search', {
        highlight: page.getByRole('searchbox', { name: 'Suchbegriff' }),
      });
    });
  });
});
