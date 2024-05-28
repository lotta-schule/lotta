import * as React from 'react';

import {
  faCircleUser,
  faUserGroup,
  faChartBar,
  faExpand,
  faPalette,
  faSliders,
  faShapes,
  faSquareCaretRight,
  faCommentDots,
  faChartLine,
  faCubes,
} from '@fortawesome/free-solid-svg-icons';
import { BaseButton } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { NewFeedbackCountBadge } from 'component/feedback/NewFeedbackCountBadge';
import { AdminPage } from './_component/AdminPage';
import Link from 'next/link';

import styles from './page.module.scss';

async function AdminRootPage() {
  return (
    <AdminPage icon={faCubes} title={'Administration'} className={styles.root}>
      <h3>Mein lotta</h3>
      <section className={styles.buttonRow}>
        <BaseButton
          component={Link}
          href={'/admin/system/general'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faSliders} />
          </span>
          <span>Grundeinstellungen</span>
        </BaseButton>

        <BaseButton
          component={Link}
          href={'/admin/system/presentation'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faPalette} />
          </span>
          <span>Darstellung</span>
        </BaseButton>

        <BaseButton
          component={Link}
          href={'/admin/system/usage'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faChartBar} />
          </span>
          <span>Nutzung</span>
        </BaseButton>

        <BaseButton
          component={Link}
          href={'/admin/system/analytics'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faChartLine} />
          </span>
          <span>Statistiken</span>
        </BaseButton>

        <BaseButton
          component={Link}
          href={'/admin/system/feedback'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faCommentDots} />
          </span>
          <span>
            Feedback
            <NewFeedbackCountBadge />
          </span>
        </BaseButton>
      </section>

      <h3>Nutzer und Gruppen</h3>
      <section className={styles.buttonRow}>
        <BaseButton
          component={Link}
          href={'/admin/users/list'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faCircleUser} />
          </span>
          <span>Nutzer</span>
        </BaseButton>

        <BaseButton
          component={Link}
          href={'/admin/users/groups'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faUserGroup} />
          </span>
          <span>Gruppen</span>
        </BaseButton>

        <BaseButton
          component={Link}
          href={'/admin/users/constraints'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faExpand} />
          </span>
          <span>Beschränkungen</span>
        </BaseButton>
      </section>

      <h3>Kategorien und Marginalen</h3>
      <section className={styles.buttonRow}>
        <BaseButton
          component={Link}
          href={'/admin/categories/list'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faShapes} />
          </span>
          <span>Kategorien</span>
        </BaseButton>

        <BaseButton
          component={Link}
          href={'/admin/categories/widgets'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faSquareCaretRight} />
          </span>
          <span>Marginalen</span>
        </BaseButton>
      </section>
    </AdminPage>
  );
}

export default AdminRootPage;
