import * as React from 'react';
import { Toolbar } from '@lotta-schule/hubert';
import { EditUserGroup } from '../component';
import { loadUserGroup } from 'loader';
import { notFound } from 'next/navigation';

async function GroupPage({
  params: { groupId },
}: {
  params: { groupId: string };
}) {
  const group = await loadUserGroup(groupId);

  if (!group) {
    return notFound();
  }

  return (
    <div>
      <Toolbar hasScrollableParent>
        {/*<Button
          className={styles.createGroupButton}
          icon={<Icon icon={faCirclePlus} />}
          onClick={() => setIsCreateUserGroupDialogOpen(true)}
        >
          Gruppe erstellen
        </Button>*/}
      </Toolbar>
      <EditUserGroup group={group} />
    </div>
  );
}

export default GroupPage;
