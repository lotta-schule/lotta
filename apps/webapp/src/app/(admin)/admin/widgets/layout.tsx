import { AdminPage } from '#/app/(admin)/admin/_component/AdminPage.js';
import { faSquareCaretRight } from '@fortawesome/free-solid-svg-icons';
import {
  TwoColumnLayout,
  TwoColumnLayoutContent,
  TwoColumnLayoutSidebar,
} from '#/component/layout/index.js';
import { Toolbar } from '@lotta-schule/hubert';
import { CreateWidgetButton, WidgetsNavigation } from './_component/index.js';

async function WidgetsLayout({
  children,
}: React.PropsWithChildren<{ params: Promise<{ groupId?: string }> }>) {
  return (
    <AdminPage
      icon={faSquareCaretRight}
      title={'Marginalen'}
      hasHomeLink
      takesFullSpace
    >
      <TwoColumnLayout>
        <TwoColumnLayoutSidebar>
          <Toolbar hasScrollableParent withPadding>
            <CreateWidgetButton />
          </Toolbar>
          <WidgetsNavigation />
        </TwoColumnLayoutSidebar>
        <TwoColumnLayoutContent>{children}</TwoColumnLayoutContent>
      </TwoColumnLayout>
    </AdminPage>
  );
}
export default WidgetsLayout;
