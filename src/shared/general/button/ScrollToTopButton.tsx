import * as React from 'react';
import { Button } from './Button';
import { ArrowUpwardRounded } from '@material-ui/icons';
import { useSpring, animated } from 'react-spring';
import { useScrollEvent } from 'util/useScrollEvent';
import { useWindowSize } from 'util/useWindowSize';

import styles from './scroll-to-top-button.module.scss';

const AnimatedButton = animated(Button);

export const ScrollToTopButton = React.memo(() => {
    const [isShown, setIsShown] = React.useState(false);

    const { innerHeight } = useWindowSize();
    const onScroll = React.useCallback(() => {
        setIsShown(window.scrollY > 2 * innerHeight);
    }, [innerHeight]);
    useScrollEvent(onScroll, 1000, [onScroll]);

    const props = useSpring({
        opacity: isShown ? 1 : 0,
        tension: 2000,
        mass: 0.5,
        friction: 15,
    });
    return (
        <AnimatedButton
            style={props}
            className={styles.root}
            title={'Zum Anfang der Seite scrollen'}
            icon={<ArrowUpwardRounded />}
            onClick={() => {
                window.scroll({
                    top: 0,
                    behavior: 'smooth',
                });
            }}
        />
    );
});
ScrollToTopButton.displayName = 'ScrollToTopButton';
