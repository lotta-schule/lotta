import React from 'react';

import styles from './banner.module.scss';

export const Banner: React.FC = ({ children }) => {
    return <div className={styles.banner}>{children}</div>;
};
