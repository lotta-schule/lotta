import { Suspense } from 'react';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { DraggableGroupList } from './component/DraggableGroupList';
import { GroupListToolbar } from './component/GroupListToolbar';
import {
  TwoColumnLayout,
  TwoColumnLayoutContent,
  TwoColumnLayoutSidebar,
} from 'component/layout';
import { LinearProgress } from '@lotta-schule/hubert';

async function GroupsLayout({
  children,
}: React.PropsWithChildren<{ params: { groupId?: string } }>) {
  return (
    <AdminPage icon={faUserGroup} title={'Gruppen'} hasHomeLink>
      <TwoColumnLayout>
        <TwoColumnLayoutSidebar>
          <GroupListToolbar />
          <Suspense
            fallback={
              <LinearProgress aria-label="Gruppen werden geladen ..." />
            }
          >
            <DraggableGroupList />
          </Suspense>
        </TwoColumnLayoutSidebar>
        <TwoColumnLayoutContent>{children}</TwoColumnLayoutContent>
      </TwoColumnLayout>
    </AdminPage>
  );
}
export default GroupsLayout;
