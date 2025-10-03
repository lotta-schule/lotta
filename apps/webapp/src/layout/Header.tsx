import * as React from 'react';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { FileModel } from 'model';
import { UserNavigation } from './navigation/UserNavigation';
import clsx from 'clsx';

import styles from './Header.module.scss';

export interface HeaderProps {
  bannerImage?: FileModel;
  bannerImageUrl?: string;
  children?: any;
}

export const Header = React.memo(
  ({ children, bannerImage, bannerImageUrl }: HeaderProps) => {
    return (
      <section
        data-testid="Header"
        className={clsx(styles.root, {
          [styles.hasBannerImage]: !!(bannerImage || bannerImageUrl),
        })}
      >
        <div data-testid="HeaderContent" className={styles.subheader}>
          {bannerImage && (
            <ResponsiveImage
              file={bannerImage}
              format="banner"
              alt=""
              width={700}
            />
          )}
          {bannerImageUrl && <img src={bannerImageUrl} alt="" width={700} />}
          <div className={styles.headerContent}>{children}</div>
        </div>
        <div className={styles.userNavigationGridItem}>
          <UserNavigation />
        </div>
      </section>
    );
  }
);
Header.displayName = 'Header';
