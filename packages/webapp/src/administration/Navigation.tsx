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
} from '@fortawesome/free-solid-svg-icons';
import { Badge, BaseButton } from '@lotta-schule/hubert';
import { useNewFeedbackCount } from 'util/feedback';
import { Icon } from 'shared/Icon';
import Link from 'next/link';

import styles from './Navigation.module.scss';

export const Navigation = React.memo(() => {
  const newFeedbackBadgeNumber = useNewFeedbackCount();

  return (
    <div className={styles.root}>
      <h3>Mein lotta</h3>
      <section className={styles.buttonRow}>
        <Link href={'/admin/system/general'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faSliders} />
            </span>
            <span>Grundeinstellungen</span>
          </BaseButton>
        </Link>

        <Link href={'/admin/system/presentation'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faPalette} />
            </span>
            <span>Darstellung</span>
          </BaseButton>
        </Link>

        <Link href={'/admin/system/usage'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faChartBar} />
            </span>
            <span>Nutzung</span>
          </BaseButton>
        </Link>

        <Link href={'/admin/system/analytics'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faChartLine} />
            </span>
            <span>Statistiken</span>
          </BaseButton>
        </Link>

        <Link href={'/admin/system/feedback'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faCommentDots} />
            </span>
            <span>
              Feedback
              <Badge value={newFeedbackBadgeNumber} />
            </span>
          </BaseButton>
        </Link>
      </section>

      <h3>Nutzer und Gruppen</h3>
      <section className={styles.buttonRow}>
        <Link href={'/admin/users/list'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faCircleUser} />
            </span>
            <span>Nutzer</span>
          </BaseButton>
        </Link>

        <Link href={'/admin/users/groups'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faUserGroup} />
            </span>
            <span>Gruppen</span>
          </BaseButton>
        </Link>

        <Link href={'/admin/users/constraints'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faExpand} />
            </span>
            <span>Beschränkungen</span>
          </BaseButton>
        </Link>
      </section>

      <h3>Kategorien und Marginalen</h3>
      <section className={styles.buttonRow}>
        <Link href={'/admin/categories/list'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faShapes} />
            </span>
            <span>Kategorien</span>
          </BaseButton>
        </Link>

        <Link href={'/admin/categories/widgets'} passHref legacyBehavior>
          <BaseButton variant={'borderless'} className={styles.button}>
            <span>
              <Icon icon={faSquareCaretRight} />
            </span>
            <span>Marginalen</span>
          </BaseButton>
        </Link>
      </section>
    </div>
  );
});
Navigation.displayName = 'AdminNavigation';
