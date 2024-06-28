import * as React from 'react';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import clsx from 'clsx';

import styles from './Header.module.scss';

export interface HeaderProps {
  bannerImageUrl?: string | null;
  children?: any;
}

export const Header = React.memo(
  ({ children, bannerImageUrl }: HeaderProps) => {
    return (
      <section
        data-testid="Header"
        className={clsx(styles.root, {
          [styles.hasBannerImage]: !!bannerImageUrl,
        })}
      >
        <div data-testid="HeaderContent" className={styles.subheader}>
          {bannerImageUrl && (
            <ResponsiveImage
              src={bannerImageUrl}
              alt=""
              width={900}
              aspectRatio={'6:1'}
              resize={'cover'}
              maxDisplayWidth={700}
              sizes="(max-width: 960px) 95vw, 700px"
            />
          )}
          <div className={styles.headerContent}>{children}</div>
        </div>
        {/*<div className={styles.userNavigationGridItem}>
          <UserNavigation />
        </div>*/}
      </section>
    );
  }
);
Header.displayName = 'Header';
