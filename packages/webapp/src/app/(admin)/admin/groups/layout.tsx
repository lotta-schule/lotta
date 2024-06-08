import { Suspense } from 'react';
import { AdminPage } from '../_component/AdminPage';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { DraggableGroupList } from './_component/DraggableGroupList';
import { GroupListToolbar } from './_component/GroupListToolbar';
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
