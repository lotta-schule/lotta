import * as React from 'react';
import { Button, Toolbar } from '@lotta-schule/hubert';
import { EditUserGroup } from '../component';
import { loadUserGroup } from 'loader';
import { notFound } from 'next/navigation';
import { Icon } from 'shared/Icon';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

import styles from './page.module.scss';

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
        <h3>
          <Button
            icon={<Icon icon={faAngleLeft} title={'Zurück'} />}
            href={'/admin/users/groups'}
            className={styles.backButton}
          />
          {group.name}
        </h3>
      </Toolbar>
      <EditUserGroup group={group} />
    </div>
  );
}

export default GroupPage;
