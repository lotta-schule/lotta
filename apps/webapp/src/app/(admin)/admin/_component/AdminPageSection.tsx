import clsx from 'clsx';

import styles from './AdminPageSection.module.scss';

export type AdminPageSectionProps = React.PropsWithChildren<{
  title?: string;
  bottomToolbar?: boolean;
  className?: string;
}>;

export const AdminPageSection = ({
  title,
  bottomToolbar,
  className,
  children,
}: AdminPageSectionProps) => {
  return (
    <section
      className={clsx(className, styles.root, {
        [styles.bottomToolbar]: !!bottomToolbar,
      })}
    >
      {title && <h4>{title}</h4>}
      {children}
    </section>
  );
};
