import * as React from 'react';

import styles from './Banner.module.scss';

export const Banner: React.FC = ({ children }) => {
    return <div className={styles.banner}>{children}</div>;
};
