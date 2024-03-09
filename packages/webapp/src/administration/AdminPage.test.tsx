import { adminGroup, SomeUser } from 'test/fixtures';
import { render } from 'test/util';
import { AdminPage } from './AdminPage';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticles.graphql';
import GetFeedbackOverviewQuery from 'api/query/GetFeedbackOverviewQuery.graphql';

const adminUser = { ...SomeUser, groups: [adminGroup] };

describe('shared/layouts/adminLayout/AdminPage', () => {
  it('should show the content when admin', () => {
    const screen = render(
      <AdminPage title={'Start'} component={() => <span>Secret</span>} />,
      {},
      {
        currentUser: adminUser,
        additionalMocks: [
          {
            request: { query: GetUnpublishedArticlesQuery },
            result: { data: { articles: [] } },
          },
          {
            request: { query: GetFeedbackOverviewQuery },
            result: {
              data: {
                feedbacks: [],
              },
            },
          },
        ],
      }
    );

    expect(screen.getByText('Secret')).toBeVisible();
  });

  it('should show an error message when userAvatar is not logged in', () => {
    const screen = render(
      <AdminPage title={'Start'} component={() => <span>Secret</span>} />,
      {},
      {}
    );

    expect(screen.queryByText('Secret')).toBeNull();
    expect(screen.getByText(/nicht die notwendigen rechte/i)).toBeVisible();
  });

  it('should show an error message when userAvatar is not admin', () => {
    const screen = render(
      <AdminPage title={'Start'} component={() => <span>Secret</span>} />,
      {},
      { currentUser: SomeUser }
    );

    expect(screen.queryByText('Secret')).toBeNull();
    expect(screen.getByText(/nicht die notwendigen rechte/i)).toBeVisible();
  });
});
