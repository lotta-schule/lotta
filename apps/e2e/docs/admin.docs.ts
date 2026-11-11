import { clickUserMenuEntry } from '../helper';
import { capture, desktopOnly, docsTest as test, expect } from './fixtures';

/** Docs: the pages of "Lotta verwalten" */
test.describe('Administration', () => {
  desktopOnly();
  test.use({ loginAs: 'admin' });

  test('overview, general settings and presentation', async ({ page }) => {
    await page.goto('/admin');
    await expect(
      page.getByText('Gruppen', { exact: true }).first()
    ).toBeVisible();
    await capture(page, 'admin-overview', {
      locator: page.getByRole('main').last(),
    });

    await page.goto('/admin/general');
    await expect(page.getByLabel('Logo der Seite')).toBeVisible();
    await capture(page, 'admin-general', {
      locator: page.getByRole('main').last(),
    });

    await page.goto('/admin/presentation');
    await expect(page.getByText('Vorlagen')).toBeVisible();
    await capture(page, 'admin-presentation');
  });

  test('groups and enrollment tokens', async ({ page, school }) => {
    await page.goto(`/admin/groups/${school.groups['Schüler']}`);
    const keyInput = page.getByRole('textbox', {
      name: 'Neue Einschreibeschlüssel eintragen',
    });
    await expect(keyInput).toBeVisible();
    await capture(page, 'admin-groups');

    await keyInput.fill('Schueler-2026');
    await keyInput.press('Enter');
    const token = page
      .getByRole('listitem')
      .filter({ hasText: 'Schueler-2026' });
    await expect(token).toBeVisible();
    await capture(page, 'admin-group-enrollment-tokens', {
      locator: page.getByRole('main').last(),
      highlight: token,
    });
  });

  test('constraints and usage', async ({ page }) => {
    await page.goto('/admin/constraints');
    await expect(
      page.getByText('Den Speicherplatz für Nutzer begrenzen auf:')
    ).toBeVisible();
    await capture(page, 'admin-constraints', {
      locator: page.getByRole('main').last(),
    });

    await page.goto('/admin/usage');
    await expect(page.getByRole('main').last()).toBeVisible();
    await capture(page, 'admin-usage', {
      locator: page.getByRole('main').last(),
    });
  });

  test('feedback', async ({ page, openPageAs, baseURL }) => {
    const topic = 'Stundenplan wird nicht angezeigt';
    const studentPage = await openPageAs('student');
    await studentPage.goto(baseURL);
    await clickUserMenuEntry(studentPage, false, {
      desktop: 'Feedback',
      mobile: 'Feedback',
    });
    const dialog = studentPage.getByRole('dialog', {
      name: 'Feedback schreiben',
    });
    await dialog
      .getByRole('textbox', { name: 'Thema auswählen oder kurz beschreiben' })
      .fill(topic);
    await dialog
      .getByRole('textbox', { name: /^Nachricht/ })
      .fill(
        'Seit heute Morgen zeigt die Marginale „Vertretungsplan“ keine Stunden mehr an.'
      );
    await dialog
      .getByRole('button', { name: 'an Administratoren senden' })
      .click();
    await expect(dialog).toBeHidden();

    await page.goto('/admin/feedback');
    await page.getByRole('row').filter({ hasText: topic }).click();
    await expect(page.getByText('keine Stunden mehr an')).toBeVisible();
    await capture(page, 'admin-feedback', {
      locator: page.getByRole('main').last(),
    });
  });

  test('categories', async ({ page, school }) => {
    await page.goto('/admin/categories');
    const main = page.getByRole('main').last();
    await expect(
      main.getByText(school.categories.aktuelles.title, { exact: true })
    ).toBeVisible();
    await capture(page, 'admin-categories', { locator: main });

    await page.getByRole('button', { name: 'Kategorie erstellen' }).click();
    const dialog = page.getByRole('dialog', { name: 'Kategorie erstellen' });
    await dialog
      .getByRole('textbox', { name: 'Name der Kategorie:' })
      .fill('Elternrat');
    await capture(page, 'admin-categories-create', { locator: dialog });
    await dialog.getByRole('button', { name: 'Abbrechen' }).click();
    await expect(dialog).toBeHidden();

    await main
      .getByText(school.categories.aktuelles.title, { exact: true })
      .click();
    await expect(
      page.getByRole('textbox', { name: 'Name der Kategorie' })
    ).toHaveValue(school.categories.aktuelles.title);
    await capture(page, 'admin-category-settings', { fullPage: true });

    const widgetCheckbox = page.getByRole('checkbox', {
      name: school.widget.title,
    });
    await widgetCheckbox.scrollIntoViewIfNeeded();
    await capture(page, 'admin-category-widgets', {
      locator: page.getByTestId('WidgetsSelectionList'),
      highlight: widgetCheckbox,
    });
  });

  test('widgets', async ({ page, school }) => {
    await page.goto(`/admin/widgets/${school.widget.id}`);
    const configuration = page.getByTestId('CalendarWidgetConfiguration');
    await expect(configuration).toBeVisible();
    await capture(page, 'admin-widgets', { fullPage: true });
    await capture(page, 'admin-widget-calendar', { locator: configuration });
  });

  test('calendar', async ({ page }) => {
    await page.goto('/admin/calendars');
    await expect(
      page.getByText('Elternabend Klassenstufe 7').first()
    ).toBeVisible();
    await capture(page, 'admin-calendar', {
      locator: page.getByRole('main').last(),
    });

    await page.getByRole('button', { name: 'Ereignis erstellen' }).click();
    const dialog = page.getByRole('dialog', { name: 'Ereignis erstellen' });
    await dialog.getByRole('textbox', { name: 'Name' }).fill('Sportfest');
    await dialog
      .getByRole('textbox', { name: 'Beschreibung' })
      .fill('Auf dem Sportplatz, bei Regen in der Turnhalle');
    await capture(page, 'admin-calendar-event', { locator: dialog });
  });
});
