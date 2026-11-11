import type { GraphqlClient } from '../helper';

/**
 * Content of the docs tenant: a small, plausible school website, so the
 * screenshots of the documentation look like a real Lotta.
 * Created once per worker (see the `school` fixture in ./fixtures.ts).
 */

const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export type SchoolCategory = { id: string; title: string; path: string };
export type SchoolArticle = { id: string; title: string; path: string };

export type School = {
  groups: Record<string, string>;
  homepage: SchoolCategory;
  categories: {
    aktuelles: SchoolCategory;
    projekte: SchoolCategory;
    material: SchoolCategory;
    material7b: SchoolCategory;
    impressum: SchoolCategory;
  };
  articles: {
    projektwoche: SchoolArticle;
    konzert: SchoolArticle;
    mensa: SchoolArticle;
    garten: SchoolArticle;
    theater: SchoolArticle;
    mathe7b: SchoolArticle;
  };
  calendar: { id: string; name: string };
  widget: { id: string; title: string };
};

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const textModule = (...paragraphs: string[]) => ({
  type: 'TEXT',
  content: JSON.stringify({ nodes: paragraphs.map(paragraph) }),
});

const createCategory = async (
  gql: GraphqlClient,
  title: string,
  {
    parentId,
    isSidenav = false,
    ...update
  }: {
    parentId?: string;
    isSidenav?: boolean;
    layoutName?: string;
    groups?: { id: string }[];
    hideArticlesFromHomepage?: boolean;
  } = {}
): Promise<SchoolCategory> => {
  const { createCategory: category } = await gql<{
    createCategory: { id: string };
  }>(
    `mutation($category: CreateCategoryInput!) { createCategory(category: $category) { id } }`,
    {
      category: {
        title,
        isSidenav,
        ...(parentId ? { category: { id: parentId } } : {}),
      },
    }
  );
  if (Object.keys(update).length) {
    await gql(
      `mutation($id: ID!, $category: UpdateCategoryInput!) { updateCategory(id: $id, category: $category) { id } }`,
      { id: category.id, category: update }
    );
  }
  return {
    id: category.id,
    title,
    path: `/c/${category.id}-${slugify(title)}`,
  };
};

const createArticle = async (
  gql: GraphqlClient,
  {
    title,
    preview,
    categoryId,
    tags = [],
    groups = [],
    paragraphs,
    isReactionsEnabled = false,
    published = true,
  }: {
    title: string;
    preview: string;
    categoryId: string;
    tags?: string[];
    groups?: { id: string }[];
    paragraphs: string[];
    isReactionsEnabled?: boolean;
    published?: boolean;
  }
): Promise<SchoolArticle> => {
  const { createArticle: article } = await gql<{
    createArticle: { id: string };
  }>(
    `mutation($article: ArticleInput!) { createArticle(article: $article) { id } }`,
    { article: { title } }
  );
  await gql(
    `mutation($id: ID!, $article: ArticleInput!) { updateArticle(id: $id, article: $article) { id } }`,
    {
      id: article.id,
      article: {
        title,
        preview,
        tags,
        groups,
        published,
        readyToPublish: published,
        isReactionsEnabled,
        category: { id: categoryId },
        contentModules: [{ ...textModule(...paragraphs), sortKey: 0 }],
      },
    }
  );
  return { id: article.id, title, path: `/a/${article.id}-${slugify(title)}` };
};

/** A date `days` from today, at midnight */
const inDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const createSchool = async (gql: GraphqlClient): Promise<School> => {
  const { userGroups } = await gql<{
    userGroups: { id: string; name: string }[];
  }>(`query { userGroups { id name } }`);
  const groups = Object.fromEntries(userGroups.map((g) => [g.name, g.id]));
  const group = (name: string) => ({ id: groups[name] });

  const { categories: allCategories } = await gql<{
    categories: { id: string; title: string; isHomepage: boolean }[];
  }>(`query { categories { id title isHomepage } }`);
  const home = allCategories.find((c) => c.isHomepage)!;
  const homepage = { id: home.id, title: home.title, path: '/' };

  const aktuelles = await createCategory(gql, 'Aktuelles');
  const projekte = await createCategory(gql, 'Projekte', {
    layoutName: '2-columns',
  });
  const material = await createCategory(gql, 'Material', {
    groups: [group('Lehrer'), group('Schüler')],
    hideArticlesFromHomepage: true,
    layoutName: 'densed',
  });
  const material7b = await createCategory(gql, 'Klasse 7b', {
    parentId: material.id,
    groups: [group('Lehrer'), group('Schüler')],
    hideArticlesFromHomepage: true,
    layoutName: 'densed',
  });
  const impressum = await createCategory(gql, 'Impressum', { isSidenav: true });

  const garten = await createArticle(gql, {
    title: 'Unser Schulgarten blüht',
    preview:
      'Die Garten-AG hat Kräuter, Kartoffeln und Sonnenblumen gepflanzt.',
    categoryId: projekte.id,
    tags: ['Garten-AG'],
    paragraphs: [
      'Seit dem Frühjahr arbeitet die Garten-AG jeden Donnerstag im Schulgarten.',
    ],
  });
  const theater = await createArticle(gql, {
    title: 'Theater-AG probt „Die Physiker“',
    preview:
      'Premiere ist am letzten Schultag vor den Herbstferien in der Aula.',
    categoryId: projekte.id,
    paragraphs: ['Die Theater-AG probt zweimal pro Woche in der Aula.'],
  });
  const mathe7b = await createArticle(gql, {
    title: 'Mathematik 7b: Prozentrechnung',
    preview: 'Arbeitsblätter und Lösungen für die Woche bis zum 25. September.',
    categoryId: material7b.id,
    groups: [group('Lehrer'), group('Schüler')],
    paragraphs: ['Bearbeitet bis Freitag die Aufgaben 1 bis 5 auf Seite 42.'],
  });
  const mensa = await createArticle(gql, {
    title: 'Neue Öffnungszeiten der Mensa',
    preview: 'Ab Montag hat die Mensa von 11:30 bis 14:00 Uhr geöffnet.',
    categoryId: aktuelles.id,
    paragraphs: ['Ab Montag hat die Mensa länger geöffnet.'],
  });
  const konzert = await createArticle(gql, {
    title: 'Herbstkonzert der Musik-AG',
    preview:
      'Chor, Orchester und Big Band laden am 9. Oktober in die Aula ein.',
    categoryId: aktuelles.id,
    tags: ['Musik'],
    isReactionsEnabled: true,
    paragraphs: ['Der Eintritt ist frei, Spenden kommen der Musik-AG zugute.'],
  });
  const projektwoche = await createArticle(gql, {
    title: 'Projektwoche 2026',
    preview:
      'Eine Woche voller Ideen: Projekte rund um das Thema Nachhaltigkeit.',
    categoryId: aktuelles.id,
    tags: ['Projektwoche'],
    isReactionsEnabled: true,
    paragraphs: [
      'Vom 14. bis 18. September verwandelt sich unsere Schule in eine große Werkstatt: ' +
        'Schülerinnen und Schüler aller Jahrgänge arbeiten gemeinsam an Projekten rund um das Thema Nachhaltigkeit.',
      'Zum Abschluss präsentieren alle Gruppen ihre Ergebnisse am Freitag ab 15 Uhr in der Aula.',
    ],
  });

  await gql(`mutation($id: ID!) { toggleArticlePin(id: $id) { id } }`, {
    id: mensa.id,
  });

  const calendarName = 'Schultermine';
  const { createCalendar: calendar } = await gql<{
    createCalendar: { id: string };
  }>(`mutation($data: CalendarInput!) { createCalendar(data: $data) { id } }`, {
    data: { name: calendarName, color: '#2a9d8f' },
  });
  for (const [summary, start, days] of [
    ['Elternabend Klassenstufe 7', 3, 1],
    ['Wandertag', 8, 1],
    ['Herbstferien', 20, 12],
  ] as const) {
    await gql(
      `mutation($data: CalendarEventInput!) { createCalendarEvent(data: $data) { id } }`,
      {
        data: {
          calendarId: calendar.id,
          summary,
          start: inDays(start).toISOString(),
          end: inDays(start + days).toISOString(),
          isFullDay: true,
          timezone: 'Europe/Berlin',
        },
      }
    );
  }

  const widgetTitle = 'Termine';
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
              color: '#2a9d8f',
              days: 90,
            },
          ],
        }),
      },
    }
  );
  for (const category of [homepage, aktuelles]) {
    await gql(
      `mutation($id: ID!, $category: UpdateCategoryInput!) { updateCategory(id: $id, category: $category) { id } }`,
      { id: category.id, category: { widgets: [{ id: widget.id }] } }
    );
  }

  return {
    groups,
    homepage,
    categories: { aktuelles, projekte, material, material7b, impressum },
    articles: { projektwoche, konzert, mensa, garten, theater, mathe7b },
    calendar: { id: calendar.id, name: calendarName },
    widget: { id: widget.id, title: widgetTitle },
  };
};
