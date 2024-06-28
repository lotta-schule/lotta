import { PropsWithChildren } from 'react';
import { Button, Toolbar } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

import styles from './AdminPageTitle.module.scss';

export const AdminPageTitle = ({
  backUrl,
  children,
}: PropsWithChildren<{ backUrl: string }>) => {
  return (
    <Toolbar hasScrollableParent className={styles.root}>
      <h3>
        <Button
          href={backUrl}
          className={styles.backButton}
          icon={<Icon icon={faAngleLeft} title={'Zurück'} />}
        />
        {children}
      </h3>
    </Toolbar>
  );
};
