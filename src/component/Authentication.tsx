import * as React from 'react';
import { checkExpiredToken } from 'api/client';

export const Authentication: React.FC<{ children: any }> = ({ children }) => {
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            checkExpiredToken();
        }, 60 * 1000);
        return () => {
            clearInterval(intervalId);
        };
    });

    return children;
};
