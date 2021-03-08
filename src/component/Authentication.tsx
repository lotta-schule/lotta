import { FC, useEffect, useState } from 'react';
import { checkExpiredToken } from 'api/client';

export const Authentication: FC<{ children?: any }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        checkExpiredToken(true).then(
            () => setIsReady(true),
            () => setIsReady(true)
        );
        const intervalId = setInterval(() => {
            checkExpiredToken();
        }, 60 * 1000);
        return () => {
            clearInterval(intervalId);
        };
    });

    if (children && isReady) {
        return children;
    }
    return null;
};
