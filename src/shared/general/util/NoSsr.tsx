import * as React from 'react';

export const NoSsr: React.FC = ({ children }) => {
    const [hasRendered, setHasRendered] = React.useState(false);
    React.useEffect(() => {
        setHasRendered(true);
    }, []);

    return hasRendered ? (children as React.ReactElement) : null;
};
