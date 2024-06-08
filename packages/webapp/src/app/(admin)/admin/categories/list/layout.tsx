import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import {
  TwoColumnLayout,
  TwoColumnLayoutContent,
  TwoColumnLayoutSidebar,
} from 'component/layout';
import { CategoryListToolbar } from './component/CategoriesListToolbar';
import { CategoryNavigation } from './component';

async function CategoriesLayout({
  children,
}: React.PropsWithChildren<{ params: { groupId?: string } }>) {
  return (
    <AdminPage icon={faUserGroup} title={'Kategorien'} hasHomeLink>
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
