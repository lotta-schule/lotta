'use client';

import * as React from 'react';
import { Button } from './Button.js';
import { ArrowUpwardRounded } from '../icon/index.js';
import { motion } from 'framer-motion';
import { useScrollEvent, useWindowSize } from '../util/index.js';

import styles from './ScrollToTopButton.module.scss';

const AnimatedButton = motion.create(Button);

export const ScrollToTopButton = React.memo(() => {
  const [isShown, setIsShown] = React.useState(false);

  const { innerHeight } = useWindowSize();
  const onScroll = React.useCallback(() => {
    setIsShown(window.scrollY > 2 * innerHeight);
  }, [innerHeight]);
  useScrollEvent(onScroll, 1000, [onScroll]);

  return (
    <AnimatedButton
      className={styles.root}
      title={'Zum Anfang der Seite scrollen'}
      icon={<ArrowUpwardRounded />}
      initial={'hidden'}
      animate={isShown ? 'visible' : 'hidden'}
      variants={{
        visible: {
          opacity: 1,
          scale: 1,
        },
        hidden: {
          opacity: 0,
          scale: 0,
        },
      }}
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
