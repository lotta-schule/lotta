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
  faDoorOpen,
} from '@fortawesome/free-solid-svg-icons';
import { BaseButton } from '@lotta-schule/hubert';
import { serverTranslations } from 'i18n/server';
import { Icon } from 'shared/Icon';
import { NewFeedbackCountBadge } from 'component/feedback/NewFeedbackCountBadge';
import { AdminPage } from './_component/AdminPage';
import Link from 'next/link';

import styles from './page.module.scss';

async function AdminRootPage() {
  const { t } = await serverTranslations();
  return (
    <AdminPage
      icon={faCubes}
      title={t('Administration')}
      className={styles.root}
    >
      <h3>{t('My lotta')}</h3>
      <section>
        <BaseButton
          as={Link}
          href={'/admin/general'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faSliders} />
          </span>
          <span>Grundeinstellungen</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/presentation'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faPalette} />
          </span>
          <span>Darstellung</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/usage'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faChartBar} />
          </span>
          <span>Nutzung</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/analytics'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faChartLine} />
          </span>
          <span>Statistiken</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/feedback'}
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
      <section>
        <BaseButton
          as={Link}
          href={'/admin/users'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faCircleUser} />
          </span>
          <span>Nutzer</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/groups'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faUserGroup} />
          </span>
          <span>Gruppen</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/constraints'}
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
      <section>
        <BaseButton
          as={Link}
          href={'/admin/categories'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faShapes} />
          </span>
          <span>Kategorien</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/widgets'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faSquareCaretRight} />
          </span>
          <span>Marginalen</span>
        </BaseButton>
      </section>

      <section>
        <BaseButton
          as={Link}
          href={'/'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faDoorOpen} />
          </span>
          <span>Bereich verlassen</span>
        </BaseButton>
      </section>
    </AdminPage>
  );
}

export default AdminRootPage;
