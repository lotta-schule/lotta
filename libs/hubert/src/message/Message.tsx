'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import styles from './Message.module.scss';

export interface MessageProps extends React.HTMLProps<HTMLDivElement> {
  message?: string | null;
  color: string;
  className?: string;
  children?: any;
}

export const Message = React.memo<MessageProps>(
  ({ message, color, className, children, ...otherProps }) => {
    const otherStyle: React.CSSProperties = {
      backgroundColor: `color(rgb(var(${color}) saturation(-30))`,
      borderColor: color,
      color,
    };

    return (
      <motion.div
        role={'alert'}
        aria-label={message || undefined}
        style={otherStyle}
        className={clsx(styles.root, className)}
        variants={{
          visible: { opacity: 1, height: 'auto' },
          hidden: { opacity: 0, height: 0 },
        }}
        aria-hidden={message ? undefined : true}
        animate={message ? 'visible' : 'hidden'}
        {...(otherProps as any)}
      >
        {message}
        {children}
      </motion.div>
    );
  }
);
Message.displayName = 'Message';
