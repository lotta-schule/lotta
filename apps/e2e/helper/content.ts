/**
 * Content seeding through the public GraphQL API.
 * Call these with a GraphQL client of a user who is allowed to do it (usually the admin).
 */
export type GraphqlClient = <T = any>(
  query: string,
  variables?: Record<string, unknown>
) => Promise<T>;

export type ContentModuleInput = {
  type: 'TEXT' | 'TITLE' | 'IMAGE' | 'FORM' | 'DIVIDER';
  /** sent as JSON string, like the webapp does */
  content?: Record<string, unknown>;
  /** sent as JSON string, like the webapp does */
  configuration?: Record<string, unknown>;
};

export type SeededCategory = { id: string; title: string; path: string };
export type SeededArticle = { id: string; title: string; path: string };

const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const createCategory = async (
  gql: GraphqlClient,
  { title, groupIds = [] }: { title: string; groupIds?: (string | number)[] }
): Promise<SeededCategory> => {
  const { createCategory: category } = await gql<{
    createCategory: { id: string; title: string };
  }>(
    `mutation CreateCategory($category: CreateCategoryInput!) {
      createCategory(category: $category) { id title }
    }`,
    { category: { title } }
  );

  if (groupIds.length) {
    await gql(
      `mutation UpdateCategory($id: ID!, $category: UpdateCategoryInput!) {
        updateCategory(id: $id, category: $category) { id }
      }`,
      {
        id: category.id,
        category: { groups: groupIds.map((id) => ({ id: String(id) })) },
      }
    );
  }

  return { ...category, path: `/c/${category.id}-${slugify(title)}` };
};

export const createArticle = async (
  gql: GraphqlClient,
  {
    title,
    categoryId,
    groupIds = [],
    published = true,
    contentModules = [],
    isReactionsEnabled = false,
  }: {
    title: string;
    categoryId?: string;
    groupIds?: (string | number)[];
    published?: boolean;
    contentModules?: ContentModuleInput[];
    isReactionsEnabled?: boolean;
  }
): Promise<SeededArticle> => {
  const { createArticle: article } = await gql<{
    createArticle: { id: string; title: string };
  }>(
    `mutation CreateArticle($article: ArticleInput!) {
      createArticle(article: $article) { id title }
    }`,
    { article: { title } }
  );

  await gql(
    `mutation UpdateArticle($id: ID!, $article: ArticleInput!) {
      updateArticle(id: $id, article: $article) { id }
    }`,
    {
      id: article.id,
      article: {
        title,
        published,
        readyToPublish: published,
        isReactionsEnabled,
        category: categoryId ? { id: categoryId } : null,
        groups: groupIds.map((id) => ({ id: String(id) })),
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

  return { ...article, path: `/a/${article.id}-${slugify(title)}` };
};
