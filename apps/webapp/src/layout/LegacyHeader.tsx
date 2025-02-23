import * as React from 'react';
import { UserNavigation } from './navigation/UserNavigation';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { FileModel } from 'model';
import clsx from 'clsx';

import styles from './Header.module.scss';

export interface LegacyHeaderProps {
  bannerImage?: FileModel;
  bannerImageUrl?: string | null;
  children?: any;
}

export const LegacyHeader = React.memo(
  ({ children, bannerImage, bannerImageUrl }: LegacyHeaderProps) => {
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
              alt=""
              format="banner"
              width={660}
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
LegacyHeader.displayName = 'LegacyHeader';
