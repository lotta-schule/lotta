import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import {
  TwoColumnLayout,
  TwoColumnLayoutContent,
  TwoColumnLayoutSidebar,
} from 'component/layout';
import { CategoryListToolbar, CategoryNavigation } from './_component';

async function CategoriesLayout({
  children,
}: React.PropsWithChildren<{ params: { groupId?: string } }>) {
  return (
    <AdminPage
      icon={faUserGroup}
      title={'Kategorien'}
      hasHomeLink
      takesFullSpace
    >
      <TwoColumnLayout>
        <TwoColumnLayoutSidebar>
          <CategoryListToolbar />
          <CategoryNavigation />
        </TwoColumnLayoutSidebar>
        <TwoColumnLayoutContent>{children}</TwoColumnLayoutContent>
      </TwoColumnLayout>
    </AdminPage>
  );
}
export default CategoriesLayout;
