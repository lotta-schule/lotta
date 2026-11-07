import { expect, tenantTest as test } from '../fixtures';
import { createCategory } from '../helper';

test.describe('Widgets', () => {
  test.use({ loginAs: 'admin' });

  test(
    "an admin adds a calendar widget to a category, visitors see the calendar's events",
    { tag: '@smoke' },
    async ({ page, baseURL, isMobile, graphqlAs, openPageAs }) => {
      test.skip(
        isMobile,
        'Widgets are in the sidebar, which is hidden on mobile'
      );

      const id = Date.now().toString(36);
      const calendarName = `Termine ${id}`;
      const eventName = `Projekttag ${id}`;
      const widgetTitle = `Schultermine ${id}`;

      const gql = await graphqlAs('admin');
      const category = await createCategory(gql, { title: `Aktuelles ${id}` });

      const { createCalendar: calendar } = await gql<{
        createCalendar: { id: string };
      }>(
        `mutation($data: CalendarInput!) { createCalendar(data: $data) { id } }`,
        { data: { name: calendarName, color: '#ff0000' } }
      );

      const start = new Date();
      start.setDate(start.getDate() + 2);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      await gql(
        `mutation($data: CalendarEventInput!) { createCalendarEvent(data: $data) { id } }`,
        {
          data: {
            calendarId: calendar.id,
            summary: eventName,
            start: start.toISOString(),
            end: end.toISOString(),
            isFullDay: true,
            timezone: 'Europe/Berlin',
          },
        }
      );

      const { widget } = await gql<{ widget: { id: string } }>(
        `mutation($title: String!) { widget: createWidget(title: $title, type: CALENDAR) { id } }`,
        { title: widgetTitle }
      );
      await gql(
        `mutation($id: ID!, $widget: WidgetInput!) { updateWidget(id: $id, widget: $widget) { id } }`,
        {
          id: widget.id,
          widget: {
            title: widgetTitle,
            configuration: JSON.stringify({
              calendars: [
                {
                  type: 'internal',
                  calendarId: calendar.id,
                  name: calendarName,
                  color: '#ff0000',
                  days: 30,
                },
              ],
            }),
          },
        }
      );

      await test.step('the admin assigns the widget to the category', async () => {
        await page.goto('/admin/categories');
        await page
          .getByRole('main')
          .getByText(category.title, { exact: true })
          .click();
        await page.getByRole('checkbox', { name: widgetTitle }).check();

        const saveCategory = page.waitForResponse(
          (res) =>
            res.url().endsWith('/api') &&
            (res.request().postData() ?? '').includes('updateCategory')
        );
        await page
          .getByRole('button', { name: 'speichern', exact: true })
          .click();
        expect((await saveCategory).ok()).toBe(true);
      });

      await test.step("a visitor sees the widget with the calendar's event", async () => {
        const guestPage = await openPageAs('guest');
        await guestPage.goto(baseURL + category.path);
        const sidebar = guestPage.getByRole('complementary');
        await expect(sidebar.getByText(widgetTitle)).toBeVisible();
        await expect(sidebar.getByText(eventName)).toBeVisible();
      });

      await test.step('other categories do not show the widget', async () => {
        const guestPage = await openPageAs('guest');
        await guestPage.goto(baseURL);
        await expect(guestPage.getByText(widgetTitle)).toHaveCount(0);
      });
    }
  );
});
